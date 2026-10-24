import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const cookieName = "edified-student"
const sessionSeconds = 60 * 60 * 12

export type StudentSession = { id: string; role: "student"; name: string }

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.")
  }
  return value
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url")
}

function safeEqual(first: string, second: string) {
  const a = Buffer.from(first)
  const b = Buffer.from(second)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function createStudentSession(student: {
  id: string
  name: string
}) {
  const expiresAt = Date.now() + sessionSeconds * 1000
  const payload = Buffer.from(
    JSON.stringify({
      id: student.id,
      name: student.name,
      role: "student",
      expiresAt,
    }),
  ).toString("base64url")
  const store = await cookies()
  store.set(cookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionSeconds,
  })
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const value = (await cookies()).get(cookieName)?.value
  if (!value) return null
  const [payload, signature] = value.split(".")
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as StudentSession & { expiresAt: number }
    if (
      session.role !== "student" ||
      typeof session.id !== "string" ||
      typeof session.name !== "string" ||
      session.expiresAt <= Date.now()
    ) {
      return null
    }
    return { id: session.id, name: session.name, role: "student" }
  } catch {
    return null
  }
}

export async function clearStudentSession() {
  const store = await cookies()
  store.delete(cookieName)
}
