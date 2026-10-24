import { clearAdminSession } from "@/lib/admin-auth"
import { clearStudentSession } from "@/lib/portal-auth"

export async function POST() {
  await clearAdminSession()
  await clearStudentSession()
  return Response.json({ authenticated: false })
}
