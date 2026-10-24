"use client"

import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"

type Student = { id: string; name: string; username: string; email: string; createdAt: string }
type PortalClass = {
  id: string
  title: string
  description: string
  mentor: string
  schedule: string
  studentIds: string[]
}
type Announcement = { id: string; title: string; message: string; createdAt: string }
type Message = { id: string; classId: string; userName: string; message: string; createdAt: string }
type Activity = { id: string; type: string; label: string; createdAt: string }
export type AdminSection = "overview" | "pages" | "classes" | "students" | "announcements" | "chat" | "settings"

const newClass = () => ({
  id: "",
  title: "",
  description: "",
  mentor: "",
  schedule: "",
  studentIds: [] as string[],
})

export default function AdminPortal({ section, onBack }: { section: AdminSection; onBack: () => void }) {
  const [classes, setClasses] = useState<PortalClass[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [classForm, setClassForm] = useState(newClass())
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementText, setAnnouncementText] = useState("")
  const [editingAnnouncement, setEditingAnnouncement] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [mentorMessage, setMentorMessage] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentUsername, setStudentUsername] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editStudentName, setEditStudentName] = useState("")
  const [editStudentEmail, setEditStudentEmail] = useState("")
  const [editStudentPassword, setEditStudentPassword] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    const response = await fetch("/api/portal/data", { cache: "no-store" })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Could not load portal management.")
    setClasses(result.classes)
    setStudents(result.students)
    setAnnouncements(result.announcements)
    setMessages(result.messages)
    setActivities(result.activities)
    setSelectedClass((current) =>
      result.classes.some((item: PortalClass) => item.id === current)
        ? current
        : result.classes[0]?.id ?? "",
    )
  }, [])

  useEffect(() => {
    async function loadPortal() {
      try {
        await refresh()
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load portal management.")
      }
    }
    void loadPortal()
  }, [refresh])

  async function act(payload: Record<string, unknown>) {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const response = await fetch("/api/portal/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not save this change.")
      await refresh()
      setNotice("Changes saved successfully.")
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this change.")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function saveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act({ action: "save-class", ...classForm })) {
      setClassForm(newClass())
      setNotice("Class saved.")
    }
  }

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act({
      action: editingAnnouncement ? "edit-announcement" : "post-announcement",
      ...(editingAnnouncement ? { id: editingAnnouncement } : {}),
      title: announcementTitle,
      message: announcementText,
    })) {
      setAnnouncementTitle("")
      setAnnouncementText("")
      setEditingAnnouncement("")
      setNotice(editingAnnouncement ? "Announcement updated on student dashboards." : "Announcement posted to student dashboards.")
    }
  }

  async function sendMentorMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act({
      action: "send-message",
      classId: selectedClass,
      message: mentorMessage,
    })) {
      setMentorMessage("")
      setNotice("Mentor message sent to the classroom.")
    }
  }

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await act({
      action: "add-student",
      name: studentName,
      email: studentEmail,
      username: studentUsername,
      password: studentPassword,
    })) {
      setStudentName("")
      setStudentEmail("")
      setStudentUsername("")
      setStudentPassword("")
      setNotice("Student account created. Share the username and password securely.")
    }
  }

  function startStudentEdit(student: Student) {
    setEditingStudent(student)
    setEditStudentName(student.name)
    setEditStudentEmail(student.email)
    setEditStudentPassword("")
  }

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingStudent) return
    if (await act({
      action: "update-student",
      id: editingStudent.id,
      name: editStudentName,
      email: editStudentEmail,
      ...(editStudentPassword ? { password: editStudentPassword } : {}),
    })) {
      setEditingStudent(null)
      setEditStudentPassword("")
      setNotice(`${editStudentName}’s account was updated.`)
    }
  }

  async function removeStudent(student: Student) {
    if (!window.confirm(`Remove ${student.name} and their class access? Their chat messages will also be deleted.`)) return
    if (await act({ action: "remove-student", id: student.id })) {
      setNotice(`${student.name} was removed.`)
    }
  }

  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    const events = activities.filter((activity) => {
      const created = new Date(activity.createdAt)
      return created >= date && created < next
    })
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: events.length,
      announcements: events.filter((item) => item.type === "announcement-posted").length,
      messages: events.filter((item) => item.type === "message-sent").length,
    }
  })
  const maxActivity = Math.max(1, ...activityDays.map((day) => day.count))

  const classMessages = messages.filter((item) => item.classId === selectedClass)
  const sectionTitles: Record<AdminSection, { title: string; description: string }> = {
    overview: { title: "Dashboard Overview", description: "A snapshot of your learning portal and its latest activity." },
    pages: { title: "Website Pages", description: "Edit the content visitors see on the Edified Services website." },
    classes: { title: "Classes", description: "Create classes, manage schedules, and enroll students." },
    students: { title: "Students", description: "Manage student accounts and their sign-in details." },
    announcements: { title: "Announcements", description: "Publish updates that appear immediately on student dashboards." },
    chat: { title: "Classroom Chat", description: "Read classroom conversations and send messages as a mentor." },
    settings: { title: "Settings", description: "Review the portal configuration and administrator options." },
  }

  return (
    <section className="admin-portal">
      <div className="admin-portal__heading">
        <div>
          <span className="eyebrow">Edified Services · Administration</span>
          <h2>{sectionTitles[section].title}</h2>
          <p>{sectionTitles[section].description}</p>
        </div>
        {section === "pages" && <button className="admin-button admin-button--quiet" onClick={onBack}>Manage website pages</button>}
      </div>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <div className={`admin-portal-grid admin-portal-grid--${section}`}>
        {section === "overview" && <>
        <section className="admin-card portal-activity">
          <div className="admin-list-heading">
            <div><h2>Recent activity</h2><p>Student, class, announcement, and chat activity over the last 7 days.</p></div>
          </div>
          <div className="portal-activity-summary">
            <div><strong>{students.length}</strong><span>Students</span></div>
            <div><strong>{classes.length}</strong><span>Classes</span></div>
            <div><strong>{announcements.length}</strong><span>Announcements</span></div>
            <div><strong>{messages.length}</strong><span>Chat messages</span></div>
          </div>
          <div className="portal-activity-chart" role="img" aria-label={`Portal events for the last seven days, with a maximum of ${maxActivity} on one day`}>
            {activityDays.map((day, index) => (
              <div className="portal-activity-day" key={`${day.label}-${index}`} title={`${day.count} events: ${day.announcements} announcements, ${day.messages} messages`}>
                <span className="portal-activity-value">{day.count || ""}</span>
                <div className="portal-activity-bar" style={{ height: `${day.count ? Math.max(8, (day.count / maxActivity) * 100) : 2}%` }} />
                <span className="portal-activity-label">{day.label}</span>
              </div>
            ))}
          </div>
          <div className="portal-activity-legend"><span><i className="portal-activity-dot" /> Portal events by day</span><span>{activities.length} recorded events</span></div>
          <div className="portal-recent-activity">
            <h3>Recent activity</h3>
            {activities.length ? [...activities].slice(-8).reverse().map((activity) => (
              <article key={activity.id}>
                <span className={`portal-activity-type portal-activity-type--${activity.type}`} />
                <div><strong>{activity.label}</strong><time>{new Date(activity.createdAt).toLocaleString()}</time></div>
              </article>
            )) : <p className="admin-empty">No portal activity yet.</p>}
          </div>
        </section>
        <section className="admin-card admin-overview-recent">
          <div className="admin-list-heading"><div><h2>Latest updates</h2><p>The latest changes across your learning portal.</p></div></div>
          {activities.length ? [...activities].slice(-5).reverse().map((activity) => (
            <article className="admin-overview-update" key={activity.id}>
              <span className={`portal-activity-type portal-activity-type--${activity.type}`} />
              <div><strong>{activity.label}</strong><time>{new Date(activity.createdAt).toLocaleString()}</time></div>
            </article>
          )) : <p className="admin-empty">Your recent activity will appear here.</p>}
          <button className="admin-button admin-button--quiet" onClick={() => onBack()}>Manage website pages</button>
        </section>
        </>}

        {section === "classes" && <>
        <section className="admin-card">
          <h2>{classForm.id ? "Edit class" : "Create a class"}</h2>
          <form className="admin-portal-form" onSubmit={saveClass}>
            <label>Class name<input value={classForm.title} onChange={(event) => setClassForm({ ...classForm, title: event.target.value })} maxLength={120} required placeholder="e.g. Building confident learners" /></label>
            <label>Class description<textarea rows={3} value={classForm.description} onChange={(event) => setClassForm({ ...classForm, description: event.target.value })} maxLength={2000} placeholder="What will students learn in this class?" /></label>
            <div className="admin-form-grid">
              <label>Mentor name<input value={classForm.mentor} onChange={(event) => setClassForm({ ...classForm, mentor: event.target.value })} maxLength={120} placeholder="Mentor name" /></label>
              <label>Class schedule<input value={classForm.schedule} onChange={(event) => setClassForm({ ...classForm, schedule: event.target.value })} maxLength={200} placeholder="e.g. Wednesdays, 4:00 PM" /></label>
            </div>
            <fieldset className="portal-student-picker">
              <legend>Enroll students ({classForm.studentIds.length})</legend>
              {students.length ? students.map((student) => (
                <label key={student.id}>
                  <input
                    type="checkbox"
                    checked={classForm.studentIds.includes(student.id)}
                    onChange={(event) => setClassForm({
                      ...classForm,
                      studentIds: event.target.checked
                        ? [...classForm.studentIds, student.id]
                        : classForm.studentIds.filter((id) => id !== student.id),
                    })}
                  />
                  <span>{student.name} <small>{student.email}</small></span>
                </label>
              )) : <p>No students have registered yet. Students can create accounts from the student login page.</p>}
            </fieldset>
            <div className="admin-portal-actions">
              <button className="admin-button" disabled={busy}>{busy ? "Saving…" : classForm.id ? "Save class" : "Create class"}</button>
              {classForm.id && <button type="button" className="admin-button admin-button--quiet" onClick={() => setClassForm(newClass())}>Cancel edit</button>}
            </div>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-list-heading"><div><h2>Classes</h2><p>{classes.length} class{classes.length === 1 ? "" : "es"}</p></div></div>
          {classes.length ? classes.map((item) => (
            <article className="admin-page-row" key={item.id}>
              <div><h3>{item.title}</h3><span>{item.schedule} · {item.studentIds.length} enrolled · Mentor: {item.mentor}</span></div>
              <div className="admin-row-actions">
                <button className="admin-button admin-button--quiet" onClick={() => setClassForm({ ...item, studentIds: [...item.studentIds] })}>Edit / enroll</button>
                <button className="admin-button admin-button--danger" disabled={busy} onClick={() => {
                  if (window.confirm(`Delete "${item.title}" and its class chat?`)) {
                    void act({ action: "delete-class", id: item.id }).then((saved) => {
                      if (saved) setNotice(`${item.title} was deleted.`)
                    })
                  }
                }}>Delete</button>
              </div>
            </article>
          )) : <p className="admin-empty">Create a class to get started.</p>}
        </section>
        </>}

        {section === "announcements" && <section className="admin-card admin-announcement-manager">
          <h2>{editingAnnouncement ? "Edit announcement" : "Post an announcement"}</h2>
          <p className="admin-muted">Announcements are visible to every student on their dashboard.</p>
          <form className="admin-portal-form" onSubmit={saveAnnouncement}>
            <label>Announcement title<input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} maxLength={140} required /></label>
            <label>Message<textarea rows={4} value={announcementText} onChange={(event) => setAnnouncementText(event.target.value)} maxLength={3000} required /></label>
            <div className="admin-portal-actions">
              <button className="admin-button" disabled={busy}>{busy ? "Saving…" : editingAnnouncement ? "Save announcement" : "Post announcement"}</button>
              {editingAnnouncement && <button type="button" className="admin-button admin-button--quiet" onClick={() => { setEditingAnnouncement(""); setAnnouncementTitle(""); setAnnouncementText("") }}>Cancel edit</button>}
            </div>
          </form>
          <div className="portal-admin-announcements">
            {announcements.map((item) => (
              <article className="portal-announcement" key={item.id}>
                <div className="admin-list-heading"><h3>{item.title}</h3><div className="admin-row-actions">
                  <button className="admin-button admin-button--quiet" disabled={busy} onClick={() => { setEditingAnnouncement(item.id); setAnnouncementTitle(item.title); setAnnouncementText(item.message) }}>Edit</button>
                  <button className="admin-button admin-button--danger" disabled={busy} onClick={() => {
                    if (window.confirm(`Delete the announcement "${item.title}"?`)) {
                      void act({ action: "delete-announcement", id: item.id }).then((saved) => {
                        if (saved) setNotice("Announcement deleted from student dashboards.")
                      })
                    }
                  }}>Delete</button>
                </div></div>
                <p>{item.message}</p>
                <time>{new Date(item.createdAt).toLocaleString()}</time>
              </article>
            ))}
            {!announcements.length && <p className="admin-empty">No announcements yet. Publish one to notify every student.</p>}
          </div>
        </section>}

        {section === "students" && <>
        <section className="admin-card">
          <div className="admin-list-heading">
            <div><h2>Student roster</h2><p>{students.length} student account{students.length === 1 ? "" : "s"}</p></div>
          </div>
          <form className="admin-portal-form portal-add-student" onSubmit={addStudent}>
            <h3>Add a student</h3>
            <label>Full name<input value={studentName} onChange={(event) => setStudentName(event.target.value)} maxLength={80} required /></label>
            <label>Email address<input type="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} maxLength={254} required /></label>
            <div className="admin-form-grid">
              <label>Login username<input value={studentUsername} onChange={(event) => setStudentUsername(event.target.value)} minLength={3} maxLength={40} pattern="[a-zA-Z0-9._-]+" required /></label>
              <label>Temporary password<input type="password" value={studentPassword} onChange={(event) => setStudentPassword(event.target.value)} minLength={10} maxLength={128} required /><small>At least 10 characters</small></label>
            </div>
            <button className="admin-button" disabled={busy}>{busy ? "Adding…" : "Add student"}</button>
          </form>
          {students.length ? students.map((student) => (
            <article className="admin-page-row" key={student.id}>
              <div className="admin-student-row-info"><h3>{student.name}</h3><span>{student.email}</span><span>Username: {student.username} · {classes.filter((item) => item.studentIds.includes(student.id)).map((item) => item.title).join(", ") || "Not enrolled"}</span></div>
              <div className="admin-row-actions">
                <button className="admin-button admin-button--quiet" disabled={busy} onClick={() => startStudentEdit(student)}>Edit</button>
                <button className="admin-button admin-button--danger" disabled={busy} onClick={() => void removeStudent(student)}>Remove</button>
              </div>
              {editingStudent?.id === student.id && <form className="admin-student-edit-form" onSubmit={saveStudent}>
                <label>Full name<input value={editStudentName} onChange={(event) => setEditStudentName(event.target.value)} maxLength={80} required /></label>
                <label>Email address<input type="email" value={editStudentEmail} onChange={(event) => setEditStudentEmail(event.target.value)} maxLength={254} required /></label>
                <label>New temporary password <span className="admin-label-hint">Leave blank to keep the current password</span><input type="password" value={editStudentPassword} onChange={(event) => setEditStudentPassword(event.target.value)} minLength={10} maxLength={128} /></label>
                <div className="admin-portal-actions">
                  <button className="admin-button" disabled={busy}>{busy ? "Saving…" : "Save student"}</button>
                  <button type="button" className="admin-button admin-button--quiet" onClick={() => setEditingStudent(null)}>Cancel</button>
                </div>
              </form>}
            </article>
          )) : <p className="admin-empty">Students who register at /dashboard will appear here.</p>}
        </section>
        </>}

        {section === "chat" && 
        <section className="admin-card portal-chat">
          <div className="admin-list-heading">
            <div><h2>Classroom chat</h2><p>Post to a class as the mentor or learning team.</p></div>
            <label className="portal-class-select"><span className="sr-only">Choose a classroom</span>
              <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                {!classes.length && <option value="">No classes</option>}
                {classes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>
          </div>
          {selectedClass ? <>
            <div className="portal-chat-log" aria-live="polite">
              {classMessages.length ? classMessages.map((item) => (
                <article className="portal-chat-message" key={item.id}>
                  <div><strong>{item.userName}</strong><time>{new Date(item.createdAt).toLocaleString()}</time></div><p>{item.message}</p>
                </article>
              )) : <p className="admin-empty">No class messages yet.</p>}
            </div>
            <form className="portal-chat-form" onSubmit={sendMentorMessage}>
              <label className="sr-only" htmlFor="mentor-chat-message">Mentor message</label>
              <textarea id="mentor-chat-message" rows={2} maxLength={2000} value={mentorMessage} onChange={(event) => setMentorMessage(event.target.value)} placeholder="Message this class as the mentor…" required />
              <button className="admin-button" disabled={busy || !mentorMessage.trim()}>Send as mentor</button>
            </form>
          </> : <p className="admin-empty">Create a class before starting classroom chat.</p>}
        </section>
        }

        {section === "settings" && <section className="admin-card admin-settings-card">
          <div className="admin-list-heading"><div><h2>Portal configuration</h2><p>Current environment and account controls.</p></div></div>
          <div className="admin-settings-row"><div><strong>Student portal storage</strong><span>Local JSON file · no database connection</span></div><span className="admin-settings-badge">Development only</span></div>
          <div className="admin-settings-row"><div><strong>Student accounts</strong><span>{students.length} account{students.length === 1 ? "" : "s"} managed in the local portal</span></div><button className="admin-button admin-button--quiet" onClick={() => onBack()}>Manage website pages</button></div>
          <p className="admin-settings-warning">This file-based portal is intended for local development only. Do not enter real student or sensitive information, and do not deploy it publicly without private persistent storage and appropriate access controls.</p>
        </section>}
      </div>
    </section>
  )
}
