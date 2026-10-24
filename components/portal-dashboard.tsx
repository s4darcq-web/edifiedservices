"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type PortalUser = { id: string; name: string; email?: string; username?: string; role: string }
type Classroom = {
  id: string
  title: string
  description: string
  mentor: string
  schedule: string
  members: string[]
}
type Announcement = { id: string; title: string; message: string; createdAt: string }
type ChatMessage = {
  id: string
  classId: string
  userId: string
  userName: string
  message: string
  createdAt: string
}
type Section = "home" | "classes" | "announcements" | "chat" | "profile"

const navigation: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "home", label: "Home", icon: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /> },
  { id: "classes", label: "My Classes", icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4m8-4v4M3 10h18M8 14h3m-3 3h7" /></> },
  { id: "announcements", label: "Announcements", icon: <><path d="M4 11V7a2 2 0 0 1 2-2h2l9-3v20l-9-3H6a2 2 0 0 1-2-2v-4" /><path d="m8 19 2 3m10-15 2-2m-2 6h3" /></> },
  { id: "chat", label: "Classroom Chat", icon: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></> },
  { id: "profile", label: "Profile", icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></> },
]

function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function PortalDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<PortalUser | null>(null)
  const [classes, setClasses] = useState<Classroom[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [section, setSection] = useState<Section>("home")
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [chatText, setChatText] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const loadPortal = useCallback(async () => {
    const response = await fetch("/api/portal/data", { cache: "no-store" })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Could not load your classes.")
    setClasses(result.classes)
    setAnnouncements(result.announcements)
    setMessages(result.messages)
    setSelectedClass((current: string) =>
      result.classes.some((item: Classroom) => item.id === current)
        ? current
        : result.classes[0]?.id ?? "",
    )
  }, [])

  useEffect(() => {
    async function initialize() {
      try {
        const response = await fetch("/api/portal/auth", { cache: "no-store" })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Portal is not available.")
        setUser(result.user)
        if (result.user?.role === "student") await loadPortal()
        if (result.user?.role === "admin") window.location.replace("/admin")
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Portal is not available.")
      }
    }
    void initialize()
  }, [loadPortal])

  useEffect(() => {
    if (user?.role !== "student") return
    const interval = window.setInterval(() => {
      void loadPortal().catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not refresh classroom chat."),
      )
    }, 8000)
    return () => window.clearInterval(interval)
  }, [user, loadPortal])

  const selectedMessages = useMemo(
    () => messages.filter((message) => message.classId === selectedClass),
    [messages, selectedClass],
  )
  const activeItem = navigation.find((item) => item.id === section)

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          ...(mode === "register" ? { name, email, password } : { username: email, password }),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not sign in.")
      setUser(result.user)
      setPassword("")
      window.dispatchEvent(new Event("portal-auth-change"))
      if (result.user.role === "admin") {
        window.location.replace("/admin")
        return
      }
      await loadPortal()
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not sign in.")
    } finally {
      setBusy(false)
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedClass || !chatText.trim()) return
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/portal/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-message",
          classId: selectedClass,
          message: chatText,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not send your message.")
      setChatText("")
      await loadPortal()
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send your message.")
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
      if (!response.ok) throw new Error("Could not sign out. Please try again.")
      window.dispatchEvent(new Event("portal-auth-change"))
      router.replace("/dashboard")
      setUser(null)
      setClasses([])
      setAnnouncements([])
      setMessages([])
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Could not sign out.")
    } finally {
      setBusy(false)
    }
  }

  function openChat(classId?: string) {
    if (classId) setSelectedClass(classId)
    setError("")
    setSection("chat")
  }

  function renderLogin() {
    return (
      <main id="main" className="portal-login-shell">
        <div className="portal-login-brand">
          <span className="portal-brand-mark">E</span>
          <span><strong>EDIFIED</strong><small>LEARNING PORTAL</small></span>
        </div>
        <form className="admin-card admin-login portal-login-card" onSubmit={authenticate}>
          <div>
            <span className="eyebrow">{mode === "login" ? "Welcome back" : "Join the learning community"}</span>
            <h1>{mode === "login" ? "Student sign in" : "Create your account"}</h1>
            <p className="portal-login-description">Access your classes, announcements, and classroom conversations.</p>
          </div>
          {mode === "register" && (
            <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>
          )}
          <label>
            {mode === "login" ? "Username or email" : "Email"}
            <input type={mode === "login" ? "text" : "email"} autoComplete={mode === "login" ? "username" : "email"} value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={mode === "register" ? 10 : undefined} maxLength={128} />
            {mode === "register" && <small>Use at least 10 characters.</small>}
          </label>
          <button className="admin-button" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
          <button type="button" className="portal-switch" onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login") }}>
            {mode === "login" ? "New student? Create an account" : "Already registered? Sign in"}
          </button>
          <a className="portal-admin-link" href="/admin">Administrator? Go to admin sign in</a>
        </form>
        {error && <div className="admin-alert portal-login-error" role="alert">{error}</div>}
      </main>
    )
  }

  function renderHome() {
    return (
      <div className="portal-section-content portal-fade-in">
        <div className="portal-welcome">
          <div>
            <span className="eyebrow">Your learning space</span>
            <h1>Welcome back, {user?.name.split(" ")[0]}</h1>
            <p>Here’s what’s happening in your learning community.</p>
          </div>
          <button className="portal-primary-action" onClick={() => openChat()}>
            <Icon size={18}>{navigation[3].icon}</Icon> Open classroom chat
          </button>
        </div>
        <div className="portal-overview-cards">
          <button className="portal-overview-card" onClick={() => setSection("classes")}>
            <span className="portal-overview-icon portal-overview-icon--magenta"><Icon>{navigation[1].icon}</Icon></span>
            <span><strong>{classes.length}</strong><small>Enrolled classes</small></span>
            <span className="portal-overview-arrow">→</span>
          </button>
          <button className="portal-overview-card" onClick={() => setSection("announcements")}>
            <span className="portal-overview-icon portal-overview-icon--teal"><Icon>{navigation[2].icon}</Icon></span>
            <span><strong>{announcements.length}</strong><small>Announcements</small></span>
            <span className="portal-overview-arrow">→</span>
          </button>
          <button className="portal-overview-card" onClick={() => openChat()}>
            <span className="portal-overview-icon portal-overview-icon--gold"><Icon>{navigation[3].icon}</Icon></span>
            <span><strong>{messages.length}</strong><small>Class messages</small></span>
            <span className="portal-overview-arrow">→</span>
          </button>
        </div>
        <div className="portal-home-columns">
          <section className="portal-panel">
            <div className="portal-panel-heading"><div><h2>My classes</h2><p>Your current learning groups</p></div><button onClick={() => setSection("classes")}>View all <span>→</span></button></div>
            {classes.length ? (
              <div className="portal-home-class-list">
                {classes.slice(0, 3).map((item) => (
                  <button key={item.id} className="portal-home-class" onClick={() => openChat(item.id)}>
                    <span className="portal-class-avatar">{item.title.slice(0, 1).toUpperCase()}</span>
                    <span><strong>{item.title}</strong><small>{item.schedule} · {item.mentor}</small></span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            ) : <EmptyState title="Your classes will show up here" text="Once your administrator enrolls you, class details and classmates will appear in this space." />}
          </section>
          <section className="portal-panel">
            <div className="portal-panel-heading"><div><h2>Latest announcements</h2><p>Updates from your learning team</p></div><button onClick={() => setSection("announcements")}>View all <span>→</span></button></div>
            {announcements.length ? announcements.slice(0, 3).map((item) => (
              <article className="portal-home-announcement" key={item.id}>
                <span className="portal-announcement-dot" />
                <div><h3>{item.title}</h3><p>{item.message}</p><time>{formatDate(item.createdAt)}</time></div>
              </article>
            )) : <EmptyState title="No announcements yet" text="When your learning team shares an update, you’ll find it here." />}
          </section>
        </div>
      </div>
    )
  }

  function renderClasses() {
    return (
      <div className="portal-section-content portal-fade-in">
        <SectionTitle eyebrow="Your learning" title="My Classes" text="View your class schedule, mentor, and fellow learners." />
        {classes.length ? (
          <div className="portal-class-grid">
            {classes.map((item) => (
              <article className="portal-class-detail" key={item.id}>
                <div className="portal-class-detail-banner"><span className="portal-class-avatar">{item.title.slice(0, 1).toUpperCase()}</span><span className="portal-class-active">Enrolled</span></div>
                <div className="portal-class-detail-body">
                  <h2>{item.title}</h2>
                  <p>{item.description || "Your mentor will share more information about this class."}</p>
                  <div className="portal-class-meta">
                    <div><span>Mentor</span><strong>{item.mentor}</strong></div>
                    <div><span>Schedule</span><strong>{item.schedule}</strong></div>
                    <div><span>Classmates</span><strong>{item.members.length}</strong></div>
                  </div>
                  {item.members.length > 0 && <p className="portal-classmates"><strong>Learning together:</strong> {item.members.join(", ")}</p>}
                  <button className="portal-primary-action" onClick={() => openChat(item.id)}><Icon size={17}>{navigation[3].icon}</Icon> Open class chat</button>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="You’re not enrolled in a class yet" text="Your classes will appear here after the learning team enrolls you. Check back soon or contact your administrator." action={<span>Classes assigned to you will appear here automatically.</span>} />}
      </div>
    )
  }

  function renderAnnouncements() {
    return (
      <div className="portal-section-content portal-fade-in">
        <SectionTitle eyebrow="Stay in the loop" title="Announcements" text="Important news and updates from your learning team." />
        {announcements.length ? (
          <div className="portal-announcement-list">
            {announcements.map((item) => (
              <article className="portal-announcement-card" key={item.id}>
                <span className="portal-announcement-card-icon"><Icon>{navigation[2].icon}</Icon></span>
                <div><time>{formatDate(item.createdAt)}</time><h2>{item.title}</h2><p>{item.message}</p></div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="You’re all caught up" text="There are no announcements at the moment. New updates from your learning team will appear here." />}
      </div>
    )
  }

  function renderChat() {
    return (
      <div className="portal-section-content portal-fade-in">
        <SectionTitle eyebrow="Learn together" title="Classroom Chat" text="Ask questions and stay connected with your classmates and mentor." />
        {classes.length ? (
          <section className="portal-chat-panel">
            <div className="portal-chat-toolbar">
              <label><span>Classroom</span><select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>{classes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
              <div className="portal-chat-class-info"><span className="portal-chat-online-dot" /> {classes.find((item) => item.id === selectedClass)?.members.length ?? 0} classmates</div>
            </div>
            <div className="portal-chat-log portal-chat-log--page" aria-live="polite">
              {selectedMessages.length ? selectedMessages.map((item) => (
                <article className={`portal-chat-message ${item.userId === user?.id ? "portal-chat-message--mine" : ""}`} key={item.id}>
                  <div><strong>{item.userName}</strong><time>{formatDate(item.createdAt)}</time></div>
                  <p>{item.message}</p>
                </article>
              )) : <EmptyState title="Start the conversation" text="There are no messages in this classroom yet. Say hello to your classmates and mentor." />}
            </div>
            <form className="portal-chat-form" onSubmit={sendMessage}>
              <label className="sr-only" htmlFor="portal-chat-input">Write a class message</label>
              <textarea id="portal-chat-input" rows={2} maxLength={2000} value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Write a message to your class and mentor…" required />
              <button className="portal-primary-action" disabled={busy || !chatText.trim()} aria-label="Send message"><span>{busy ? "Sending…" : "Send message"}</span><Icon size={17}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></Icon></button>
            </form>
          </section>
        ) : <EmptyState title="Chat unlocks when you join a class" text="Once your administrator enrolls you in a class, you can chat with classmates and mentors here." action={<button className="portal-secondary-action" onClick={() => setSection("classes")}>View my classes</button>} />}
      </div>
    )
  }

  function renderProfile() {
    return (
      <div className="portal-section-content portal-fade-in">
        <SectionTitle eyebrow="Your account" title="Profile" text="Your student account details." />
        <section className="portal-profile-card">
          <div className="portal-profile-avatar">{user?.name.slice(0, 1).toUpperCase()}</div>
          <div className="portal-profile-info">
            <h2>{user?.name}</h2>
            <span className="portal-profile-role">Student</span>
            <dl>
              <div><dt>Username</dt><dd>{user?.username || "—"}</dd></div>
              <div><dt>Email address</dt><dd>{user?.email || "—"}</dd></div>
              <div><dt>Enrolled classes</dt><dd>{classes.length}</dd></div>
            </dl>
          </div>
        </section>
        <p className="portal-profile-help">Need to update your account details? Contact your administrator for help.</p>
      </div>
    )
  }

  if (!user) return renderLogin()

  return (
    <main id="main" className="student-portal">
      <aside className="student-sidebar">
        <Link href="/" className="portal-brand">
          <span className="portal-brand-mark">E</span>
          <span><strong>EDIFIED</strong><small>LEARNING PORTAL</small></span>
        </Link>
        <div className="student-sidebar-label">LEARNING SPACE</div>
        <nav className="student-side-nav" aria-label="Student dashboard">
          {navigation.map((item) => (
            <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => { setError(""); setSection(item.id) }} aria-current={section === item.id ? "page" : undefined}>
              <Icon>{item.icon}</Icon><span>{item.label}</span>
              {item.id === "announcements" && announcements.length > 0 && <span className="student-nav-count">{announcements.length}</span>}
            </button>
          ))}
        </nav>
        <div className="student-sidebar-bottom">
          <div className="student-sidebar-user">
            <span className="student-user-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span><strong>{user.name}</strong><small>Student account</small></span>
          </div>
          <p>Learn with purpose. Grow together.</p>
        </div>
      </aside>

      <div className="student-portal-main">
        <header className="student-portal-topbar">
          <div className="student-topbar-title"><span>Learning portal</span><span aria-hidden="true">/</span><strong>{activeItem?.label}</strong></div>
          <div className="student-topbar-actions">
            <button className={`student-chat-shortcut ${section === "chat" ? "active" : ""}`} aria-label="Open classroom chat" title="Open classroom chat" onClick={() => openChat()}>
              <Icon>{navigation[3].icon}</Icon>
              {messages.length > 0 && <span>{messages.length > 9 ? "9+" : messages.length}</span>}
            </button>
            <button className="student-topbar-profile" onClick={() => setSection("profile")}><span className="student-user-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span>{user.name}</span><Icon size={16}><path d="m7 10 5 5 5-5" /></Icon></button>
            <button className="student-logout-button" onClick={() => void logout()} disabled={busy}>Logout</button>
          </div>
        </header>
        <div className="student-portal-content">
          {error && <div className="admin-alert" role="alert">{error}</div>}
          {section === "home" && renderHome()}
          {section === "classes" && renderClasses()}
          {section === "announcements" && renderAnnouncements()}
          {section === "chat" && renderChat()}
          {section === "profile" && renderProfile()}
        </div>
      </div>
    </main>
  )
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="portal-section-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="portal-empty-state">
      <span className="portal-empty-icon"><Icon size={25}><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M8 12h8m-4-4v8" /></Icon></span>
      <h3>{title}</h3><p>{text}</p>{action && <div className="portal-empty-action">{action}</div>}
    </div>
  )
}
