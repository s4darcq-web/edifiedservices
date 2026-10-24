import { createAdminSession, verifyCredentials } from "@/lib/admin-auth"
import { clearStudentSession } from "@/lib/portal-auth"

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string
      password?: string
    }
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !verifyCredentials(username, password)
    ) {
      return Response.json({ error: "Invalid username or password." }, { status: 401 })
    }
    await clearStudentSession()
    await createAdminSession()
    return Response.json({ authenticated: true })
  } catch (error) {
    console.error("Admin login failed.", error)
    const message =
      error instanceof Error &&
      /ADMIN_USERNAME|ADMIN_PASSWORD|ADMIN_SESSION_SECRET/.test(error.message)
        ? error.message
        : "Admin login is not configured correctly."
    return Response.json({ error: message }, { status: 500 })
  }
}
