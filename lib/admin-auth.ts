import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const cookieName = "edified-admin"
const sessionDurationSeconds = 60 * 60 * 8

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.")
  }
  return secret
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url")
}

export function verifyCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedUsername || !expectedPassword) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be configured.")
  }
  if (process.env.NODE_ENV === "production" && expectedPassword === "admin01234") {
    throw new Error("Change the example administrator password before deployment.")
  }
  return (
    safeCompare(username, expectedUsername) &&
    safeCompare(password, expectedPassword)
  )
}

function safeCompare(value: string, expected: string) {
  const actualBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

export async function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds
  const value = `${expiresAt}`
  const cookieStore = await cookies()
  cookieStore.set(cookieName, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDurationSeconds,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(cookieName)
}

export async function hasAdminSession() {
  const cookieValue = (await cookies()).get(cookieName)?.value
  if (!cookieValue) return false
  const [expiresAt, signature] = cookieValue.split(".")
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false
  return safeCompare(signature, sign(expiresAt))
}
