import {
  clearAdminSession,
  createAdminSession,
  hasAdminSession,
  verifyCredentials,
} from "@/lib/admin-auth"
import { clearStudentSession, createStudentSession, getStudentSession } from "@/lib/portal-auth"
import {
  authenticateStudent,
  ensureLocalPortal,
  publicStudent,
  registerStudent,
} from "@/lib/portal-store"

function checkOrigin(request: Request) {
  const origin = request.headers.get("origin")
  return !origin || origin === new URL(request.url).origin
}

export async function GET() {
  try {
    if (await hasAdminSession()) {
      return Response.json({ user: { role: "admin", name: "Administrator" } })
    }
    ensureLocalPortal()
    const session = await getStudentSession()
    return Response.json({ user: session })
  } catch (error) {
    console.error("Could not check the portal session.", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Portal is unavailable." },
      { status: 503 },
    )
  }
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 })
  }
  try {
    const body = (await request.json()) as Record<string, unknown>
    if (body.action === "logout") {
      await clearStudentSession()
      await clearAdminSession()
      return Response.json({ user: null })
    }
    ensureLocalPortal()
    if (body.action === "register") {
      const { name, email, password } = body
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.length > 80 ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254 ||
        typeof password !== "string" ||
        password.length < 10 ||
        password.length > 128
      ) {
        return Response.json(
          { error: "Enter your name, a valid email, and a password of at least 10 characters." },
          { status: 400 },
        )
      }
      await clearAdminSession()
      const student = await registerStudent(name, email, password)
      await createStudentSession(student)
      return Response.json({ user: { role: "student", ...publicStudent(student) } })
    }
    if (body.action === "login") {
      const { username, password } = body
      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        username.length > 254 ||
        password.length > 128
      ) {
        return Response.json({ error: "Enter your username/email and password." }, { status: 400 })
      }
      if (verifyCredentials(username, password)) {
        await clearStudentSession()
        await createAdminSession()
        return Response.json({ user: { role: "admin", name: "Administrator" } })
      }
      const student = await authenticateStudent(username, password)
      if (!student) {
        return Response.json({ error: "Invalid email or password." }, { status: 401 })
      }
      await clearAdminSession()
      await createStudentSession(student)
      return Response.json({ user: { role: "student", ...publicStudent(student) } })
    }
    return Response.json({ error: "Unsupported authentication action." }, { status: 400 })
  } catch (error) {
    console.error("Portal authentication failed.", error)
    const message =
      error instanceof Error &&
      /ADMIN_USERNAME|ADMIN_PASSWORD|ADMIN_SESSION_SECRET|file-based student portal|An account with that email/.test(error.message)
        ? error.message
        : "Portal sign-in failed. Please try again."
    return Response.json(
      { error: message },
      { status: message.startsWith("An account with that email") ? 409 : 503 },
    )
  }
}
