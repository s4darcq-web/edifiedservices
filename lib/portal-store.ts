import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

export type PortalStudent = {
  id: string
  name: string
  username: string
  email: string
  passwordHash: string
  createdAt: string
}

export type PortalClass = {
  id: string
  title: string
  description: string
  mentor: string
  schedule: string
  studentIds: string[]
}

export type PortalAnnouncement = {
  id: string
  title: string
  message: string
  createdAt: string
}

export type PortalMessage = {
  id: string
  classId: string
  userId: string
  userName: string
  message: string
  createdAt: string
}

export type PortalActivity = {
  id: string
  type:
    | "student-joined"
    | "student-updated"
    | "class-created"
    | "class-deleted"
    | "announcement-posted"
    | "announcement-updated"
    | "announcement-deleted"
    | "message-sent"
    | "student-removed"
  label: string
  createdAt: string
}

export type PortalData = {
  students: PortalStudent[]
  classes: PortalClass[]
  announcements: PortalAnnouncement[]
  messages: PortalMessage[]
  activities: PortalActivity[]
  demoSeedInitialized: boolean
}

const dataPath = path.join(process.cwd(), ".local", "portal.json")
let updateQueue = Promise.resolve()
const demoStudentId = "student-edified-demo-account"

export function ensureLocalPortal() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "The file-based student portal is local-development only. Configure private persistent storage before production use.",
    )
  }
}

async function readData(): Promise<PortalData> {
  ensureLocalPortal()
  try {
    const raw = await readFile(dataPath, "utf8")
    const data = JSON.parse(raw.replace(/^\uFEFF/, "")) as PortalData
    let migrated = raw.charCodeAt(0) === 0xfeff
    data.activities ??= []
    if (data.demoSeedInitialized === undefined) {
      data.demoSeedInitialized = true
      migrated = true
      if (!data.students.some((student) => student.username === "studentedified01")) {
        data.students.push(createDemoStudent())
        data.activities.push({
          id: randomUUID(),
          type: "student-joined",
          label: "First demo student account ready",
          createdAt: new Date().toISOString(),
        })
      }
    }
    for (const student of data.students) {
      if (!student.username) {
        student.username = student.email
        migrated = true
      }
    }
    if (migrated) await writeData(data)
    return data
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    const initial: PortalData = {
      students: [createDemoStudent()],
      classes: [],
      announcements: [],
      messages: [],
      activities: [{
        id: randomUUID(),
        type: "student-joined",
        label: "First demo student account ready",
        createdAt: new Date().toISOString(),
      }],
      demoSeedInitialized: true,
    }
    await writeData(initial)
    return initial
  }
}

function createDemoStudent(): PortalStudent {
  return {
    id: demoStudentId,
    name: "Student Edified",
    username: "studentedified01",
    email: "studentedified01@local.test",
    passwordHash: passwordHash("studentedified01"),
    createdAt: new Date().toISOString(),
  }
}

async function writeData(data: PortalData) {
  await mkdir(path.dirname(dataPath), { recursive: true })
  const tempPath = `${dataPath}.${randomUUID()}.tmp`
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  })
  await rename(tempPath, dataPath)
}

async function updateData<T>(update: (data: PortalData) => T | Promise<T>) {
  ensureLocalPortal()
  let result!: T
  const operation = updateQueue.then(async () => {
    const data = await readData()
    result = await update(data)
    await writeData(data)
  })
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  )
  await operation
  return result
}

function passwordHash(password: string, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`
}

function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":")
  if (!salt || !expectedHex) return false
  const expected = Buffer.from(expectedHex, "hex")
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function registerStudent(name: string, email: string, password: string) {
  return updateData((data) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (data.students.some((student) => student.email === normalizedEmail || student.username === normalizedEmail)) {
      throw new Error("An account with that email already exists.")
    }
    const student: PortalStudent = {
      id: randomUUID(),
      name: name.trim(),
      username: normalizedEmail,
      email: normalizedEmail,
      passwordHash: passwordHash(password),
      createdAt: new Date().toISOString(),
    }
    data.students.push(student)
    data.activities.push({
      id: randomUUID(),
      type: "student-joined",
      label: `${student.name} registered`,
      createdAt: new Date().toISOString(),
    })
    return student
  })
}

export async function createStudentByAdmin(
  name: string,
  username: string,
  password: string,
  email: string,
) {
  return updateData((data) => {
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedEmail = email.trim().toLowerCase()
    if (data.students.some((student) => student.username === normalizedUsername)) {
      throw new Error("That student username is already in use.")
    }
    if (data.students.some((student) => student.email === normalizedEmail)) {
      throw new Error("That student email is already in use.")
    }
    const student: PortalStudent = {
      id: randomUUID(),
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: passwordHash(password),
      createdAt: new Date().toISOString(),
    }
    data.students.push(student)
    data.activities.push({
      id: randomUUID(),
      type: "student-joined",
      label: `Admin added ${student.name}`,
      createdAt: new Date().toISOString(),
    })
    return student
  })
}

export async function updateStudentByAdmin(
  id: string,
  name: string,
  email: string,
  password?: string,
) {
  return updateData((data) => {
    const student = data.students.find((item) => item.id === id)
    if (!student) throw new Error("Student account was not found.")
    const normalizedEmail = email.trim().toLowerCase()
    if (data.students.some((item) => item.id !== id && item.email === normalizedEmail)) {
      throw new Error("That student email is already in use.")
    }
    student.name = name.trim()
    student.email = normalizedEmail
    if (password) student.passwordHash = passwordHash(password)
    data.activities.push({
      id: randomUUID(),
      type: "student-updated",
      label: `Student account updated: ${student.name}`,
      createdAt: new Date().toISOString(),
    })
    return student
  })
}

export async function authenticateStudent(email: string, password: string) {
  const data = await readData()
  const student = data.students.find(
    (item) =>
      item.email === email.trim().toLowerCase() ||
      item.username === email.trim().toLowerCase(),
  )
  return student && verifyPassword(password, student.passwordHash)
    ? student
    : null
}

export async function getPortalData() {
  return readData()
}

export async function updatePortalData(
  update: (data: PortalData) => void | Promise<void>,
) {
  return updateData(async (data) => {
    await update(data)
  })
}

export function publicStudent(student: PortalStudent) {
  return {
    id: student.id,
    name: student.name,
    username: student.username,
    email: student.email,
    createdAt: student.createdAt,
  }
}
