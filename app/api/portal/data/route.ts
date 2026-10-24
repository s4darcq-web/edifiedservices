import { hasAdminSession } from "@/lib/admin-auth"
import { getStudentSession } from "@/lib/portal-auth"
import {
  ensureLocalPortal,
  createStudentByAdmin,
  getPortalData,
  publicStudent,
  updateStudentByAdmin,
  updatePortalData,
  type PortalClass,
} from "@/lib/portal-store"
import { randomUUID } from "node:crypto"

async function getAccess() {
  ensureLocalPortal()
  if (await hasAdminSession()) return { role: "admin" as const, id: "admin", name: "Edified Mentor" }
  const session = await getStudentSession()
  if (!session) return null
  const data = await getPortalData()
  return data.students.some((student) => student.id === session.id) ? session : null
}

export async function GET() {
  try {
    const access = await getAccess()
    if (!access) return Response.json({ error: "Please sign in." }, { status: 401 })
    const data = await getPortalData()
    if (access.role === "admin") {
      return Response.json({
        role: "admin",
        classes: data.classes,
        students: data.students.map(publicStudent),
        announcements: data.announcements,
        messages: data.messages,
        activities: data.activities,
      })
    }
    const classes = data.classes.filter((item) => item.studentIds.includes(access.id))
    const classIds = new Set(classes.map((item) => item.id))
    const names = new Map(data.students.map((student) => [student.id, student.name]))
    return Response.json({
      role: "student",
      classes: classes.map(({ studentIds, ...item }) => ({
        ...item,
        members: studentIds
          .map((id) => names.get(id))
          .filter((name): name is string => Boolean(name)),
      })),
      announcements: data.announcements,
      messages: data.messages
        .filter((item) => classIds.has(item.classId))
        .map(({ id, classId, userId, userName, message, createdAt }) => ({
          id,
          classId,
          userId,
          userName,
          message,
          createdAt,
        })),
    })
  } catch (error) {
    console.error("Could not load portal data.", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load portal data." },
      { status: 503 },
    )
  }
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 100_000) {
    return Response.json({ error: "The submitted portal content is too large." }, { status: 413 })
  }
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 })
  }
  try {
    const access = await getAccess()
    if (!access) return Response.json({ error: "Please sign in." }, { status: 401 })
    const body = (await request.json()) as Record<string, unknown>
    const isAdmin = access.role === "admin"
    if (body.action === "add-student") {
      if (!isAdmin) {
        return Response.json({ error: "Administrator access is required." }, { status: 403 })
      }
      if (
        typeof body.name !== "string" || body.name.trim().length < 2 ||
        body.name.length > 80 ||
        typeof body.username !== "string" ||
        !/^[a-zA-Z0-9._-]{3,40}$/.test(body.username) ||
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
        body.email.length > 254 ||
        typeof body.password !== "string" ||
        body.password.length < 10 || body.password.length > 128
      ) {
        return Response.json(
          { error: "Enter a name, valid email, username (3–40 letters/numbers), and a password of at least 10 characters." },
          { status: 400 },
        )
      }
      const student = await createStudentByAdmin(body.name, body.username, body.password, body.email)
      return Response.json({ saved: true, student: publicStudent(student) })
    }
    if (body.action === "update-student") {
      const { id, name, email, password } = body
      if (
        !isAdmin ||
        typeof id !== "string" ||
        typeof name !== "string" || name.trim().length < 2 || name.length > 80 ||
        typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        (password !== undefined && (typeof password !== "string" || password.length < 10 || password.length > 128))
      ) {
        return Response.json(
          { error: isAdmin ? "Enter a valid name and email. A temporary password must be at least 10 characters." : "Administrator access is required." },
          { status: isAdmin ? 400 : 403 },
        )
      }
      const student = await updateStudentByAdmin(id, name, email, typeof password === "string" ? password : undefined)
      return Response.json({ saved: true, student: publicStudent(student) })
    }
    await updatePortalData((data) => {
      if (body.action === "send-message") {
        const classId = body.classId
        const message = body.message
        if (typeof classId !== "string" || typeof message !== "string" || !message.trim() || message.length > 2000) {
          throw new Error("Enter a message under 2,000 characters.")
        }
        const classroom = data.classes.find((item) => item.id === classId)
        if (!classroom || (!isAdmin && !classroom.studentIds.includes(access.id))) {
          throw new Error("You do not have access to this classroom.")
        }
        data.messages.push({
          id: randomUUID(),
          classId,
          userId: access.id,
          userName: isAdmin ? classroom.mentor : access.name,
          message: message.trim(),
          createdAt: new Date().toISOString(),
        })
        data.activities.push({
          id: randomUUID(),
          type: "message-sent",
          label: `${isAdmin ? classroom.mentor : access.name} posted in ${classroom.title}`,
          createdAt: new Date().toISOString(),
        })
        return
      }
      if (!isAdmin) throw new Error("Administrator access is required.")

      if (body.action === "save-class") {
        const { id, title, description, mentor, schedule, studentIds } = body
        if (
          typeof title !== "string" || !title.trim() || title.length > 120 ||
          typeof description !== "string" || description.length > 2000 ||
          typeof mentor !== "string" || mentor.length > 120 ||
          typeof schedule !== "string" || schedule.length > 200 ||
          !Array.isArray(studentIds) || !studentIds.every((value) => typeof value === "string")
        ) {
          throw new Error("Complete the class fields with valid values.")
        }
        const memberIds = [...new Set(studentIds as string[])].filter((studentId) =>
          data.students.some((student) => student.id === studentId),
        )
        const existing = typeof id === "string" ? data.classes.find((item) => item.id === id) : null
        const classroom: PortalClass = {
          id: existing?.id ?? randomUUID(),
          title: title.trim(),
          description: description.trim(),
          mentor: mentor.trim() || "Mentor to be assigned",
          schedule: schedule.trim() || "Schedule to be confirmed",
          studentIds: memberIds,
        }
        if (existing) Object.assign(existing, classroom)
        else {
          data.classes.push(classroom)
          data.activities.push({
            id: randomUUID(),
            type: "class-created",
            label: `Class created: ${classroom.title}`,
            createdAt: new Date().toISOString(),
          })
        }
        return
      }
      if (body.action === "delete-class") {
        if (typeof body.id !== "string") throw new Error("Select a class to remove.")
        const classroom = data.classes.find((item) => item.id === body.id)
        if (!classroom) throw new Error("Class was not found.")
        data.classes = data.classes.filter((item) => item.id !== body.id)
        data.messages = data.messages.filter((item) => item.classId !== body.id)
        data.activities.push({
          id: randomUUID(),
          type: "class-deleted",
          label: `Class deleted: ${classroom.title}`,
          createdAt: new Date().toISOString(),
        })
        return
      }
      if (body.action === "post-announcement") {
        if (
          typeof body.title !== "string" || !body.title.trim() || body.title.length > 140 ||
          typeof body.message !== "string" || !body.message.trim() || body.message.length > 3000
        ) {
          throw new Error("Enter an announcement title and message.")
        }
        data.announcements.unshift({
          id: randomUUID(),
          title: body.title.trim(),
          message: body.message.trim(),
          createdAt: new Date().toISOString(),
        })
        data.activities.push({
          id: randomUUID(),
          type: "announcement-posted",
          label: `Announcement posted: ${body.title.trim()}`,
          createdAt: new Date().toISOString(),
        })
        return
      }
      if (body.action === "edit-announcement") {
        if (
          typeof body.id !== "string" ||
          typeof body.title !== "string" || !body.title.trim() || body.title.length > 140 ||
          typeof body.message !== "string" || !body.message.trim() || body.message.length > 3000
        ) {
          throw new Error("Enter an announcement title and message.")
        }
        const announcement = data.announcements.find((item) => item.id === body.id)
        if (!announcement) throw new Error("Announcement was not found.")
        announcement.title = body.title.trim()
        announcement.message = body.message.trim()
        data.activities.push({
          id: randomUUID(),
          type: "announcement-updated",
          label: `Announcement updated: ${announcement.title}`,
          createdAt: new Date().toISOString(),
        })
        return
      }
      if (body.action === "delete-announcement") {
        if (typeof body.id !== "string") throw new Error("Select an announcement to remove.")
        const announcement = data.announcements.find((item) => item.id === body.id)
        if (!announcement) throw new Error("Announcement was not found.")
        data.announcements = data.announcements.filter((item) => item.id !== body.id)
        data.activities.push({
          id: randomUUID(),
          type: "announcement-deleted",
          label: `Announcement deleted: ${announcement.title}`,
          createdAt: new Date().toISOString(),
        })
        return
      }
      if (body.action === "remove-student") {
        if (typeof body.id !== "string") throw new Error("Select a student to remove.")
        const student = data.students.find((item) => item.id === body.id)
        if (!student) throw new Error("Student account was not found.")
        data.students = data.students.filter((item) => item.id !== body.id)
        data.classes = data.classes.map((classroom) => ({
          ...classroom,
          studentIds: classroom.studentIds.filter((id) => id !== body.id),
        }))
        data.messages = data.messages.filter((item) => item.userId !== body.id)
        data.activities.push({
          id: randomUUID(),
          type: "student-removed",
          label: `Student removed: ${student.name}`,
          createdAt: new Date().toISOString(),
        })
        return
      }
      throw new Error("Unsupported portal action.")
    })
    return Response.json({ saved: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save portal changes."
    if (/file-based student portal/.test(message)) {
      return Response.json({ error: message }, { status: 503 })
    }
    const status = /Administrator access|do not have access|Please sign in/.test(message) ? 403 : 400
    if (status >= 500) console.error("Could not update portal data.", error)
    return Response.json({ error: message }, { status })
  }
}
