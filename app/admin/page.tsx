"use client"

import { useEffect, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import Link from "next/link"
import type { PageContent } from "@/lib/page-content"
import AdminPortal, { type AdminSection } from "@/components/admin-portal"

const blankPage = (): PageContent => ({
  slug: "",
  title: "",
  eyebrow: "",
  intro: "",
  body: "",
  published: true,
})

function pagePath(slug: string) {
  if (slug === "home") return "/"
  if (["courses", "about-us", "our-services"].includes(slug)) {
    return `/${slug}/`
  }
  return `/pages/${slug}`
}

export default function AdminPage() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [current, setCurrent] = useState<PageContent | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<AdminSection>("overview")
  const [signedIn, setSignedIn] = useState(false)
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void loadPages()
  }, [])

  async function loadPages() {
    try {
      const response = await fetch("/api/admin/content")
      if (response.status === 401) return
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not load pages.")
      setPages(result.pages)
      setSignedIn(true)
      setCurrent(null)
      setEditingSlug(null)
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load pages.")
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Sign-in failed.")
      setPassword("")
      window.dispatchEvent(new Event("portal-auth-change"))
      await loadPages()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign-in failed.")
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" })
      if (!response.ok) throw new Error("Could not sign out. Please try again.")
      window.dispatchEvent(new Event("portal-auth-change"))
      setSignedIn(false)
      setPages([])
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Could not sign out.")
    } finally {
      setBusy(false)
    }
  }

  async function savePages(nextPages: PageContent[]) {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: nextPages }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not save changes.")
      setPages(nextPages)
      setCurrent(null)
      setEditingSlug(null)
      setNotice(
        result.local
          ? "Saved to content/pages.json. Restart the dev server or refresh to see the updated site."
          : "Saved to GitHub. Your site will update after the deployment rebuild finishes.",
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save changes.")
    } finally {
      setBusy(false)
    }
  }

  function submitPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!current) return
    const slug = current.slug.trim().toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError("Use lowercase letters, numbers, and single hyphens for the URL slug.")
      return
    }
    if (
      pages.some((page) => page.slug === slug && page.slug !== editingSlug)
    ) {
      setError("That URL slug is already in use.")
      return
    }
    const updated = { ...current, slug }
    const nextPages = editingSlug
      ? pages.map((page) => (page.slug === editingSlug ? updated : page))
      : [...pages, updated]
    void savePages(nextPages)
  }

  function removePage(slug: string) {
    const page = pages.find((item) => item.slug === slug)
    if (!page || !window.confirm(`Delete "${page.title}"? This change will be committed to GitHub.`)) return
    void savePages(pages.filter((item) => item.slug !== slug))
  }

  const adminNavigation: { id: AdminSection; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Dashboard Overview", icon: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></> },
    { id: "pages", label: "Website Pages", icon: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M8 12h8m-8 4h8" /></> },
    { id: "classes", label: "Classes", icon: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4m8-4v4M3 10h18M8 14h3m-3 3h7" /></> },
    { id: "students", label: "Students", icon: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0m3-13a4 4 0 0 1 0 7m1 2a6 6 0 0 1 2 4" /></> },
    { id: "announcements", label: "Announcements", icon: <><path d="M4 11V7a2 2 0 0 1 2-2h2l9-3v20l-9-3H6a2 2 0 0 1-2-2v-4" /><path d="m8 19 2 3m10-15 2-2m-2 6h3" /></> },
    { id: "chat", label: "Classroom Chat", icon: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></> },
    { id: "settings", label: "Settings", icon: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-3l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.5-2.6 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.5-2.6 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h3l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.5 2.6-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1)" /></> },
  ]

  return (
    <main id="main" className={signedIn ? "admin-shell" : "admin-page"}>
      {!signedIn ? (
        <div className="admin-container admin-login-container">
          <header className="admin-heading">
            <div><span className="eyebrow">Edified Services</span><h1>Administrator sign in</h1><p>Manage your website and learning portal.</p></div>
          </header>
          {error && <div className="admin-alert" role="alert">{error}</div>}
          <form className="admin-card admin-login" onSubmit={login}>
            <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="admin-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
      ) : (
        <>
          <aside className="admin-sidebar">
            <Link className="admin-brand" href="/"><span className="admin-brand-mark">E</span><span><strong>EDIFIED</strong><small>ADMIN PORTAL</small></span></Link>
            <div className="admin-sidebar-label">MANAGEMENT</div>
            <nav className="admin-side-nav" aria-label="Administrator dashboard">
              {adminNavigation.map((item) => (
                <button key={item.id} className={activeSection === item.id ? "active" : ""} onClick={() => {
                  setActiveSection(item.id)
                  setCurrent(null)
                  setEditingSlug(null)
                  setError("")
                  setNotice("")
                }} aria-current={activeSection === item.id ? "page" : undefined}>
                  <span className="admin-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg></span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="admin-sidebar-bottom">
              <span className="admin-sidebar-avatar">A</span><span><strong>Administrator</strong><small>Management account</small></span>
            </div>
          </aside>
          <div className="admin-main">
            <header className="admin-topbar">
              <div><span>Edified Services</span><span aria-hidden="true">/</span><strong>{adminNavigation.find((item) => item.id === activeSection)?.label}</strong></div>
              <button className="admin-logout-button" onClick={() => void logout()} disabled={busy}>Logout</button>
            </header>
            <div className="admin-workspace">
              {error && <div className="admin-alert" role="alert">{error}</div>}
              {notice && <div className="admin-notice" role="status">{notice}</div>}
              {activeSection !== "pages" ? (
                <AdminPortal section={activeSection} onBack={() => setActiveSection("pages")} />
              ) : current ? (
          <form className="admin-card admin-editor" onSubmit={submitPage}>
            <div className="admin-editor__top">
              <div>
                <span className="eyebrow">{editingSlug ? "Edit page" : "New page"}</span>
                <h2>Page details</h2>
              </div>
              <div className="admin-editor__navigation">
                {current.published && current.slug && (
                  <a className="admin-button admin-button--quiet" href={pagePath(current.slug)} target="_blank" rel="noreferrer">
                    View page
                  </a>
                )}
                <button type="button" className="admin-button admin-button--quiet" onClick={() => { setCurrent(null); setEditingSlug(null) }}>
                  Back to pages
                </button>
              </div>
            </div>
            <div className="admin-form-grid">
              <label>
                URL slug
                <input value={current.slug} onChange={(event) => setCurrent({ ...current, slug: event.target.value })} placeholder="about-our-work" required readOnly={!!editingSlug && ["home", "courses", "about-us", "our-services"].includes(editingSlug)} />
                <small>{editingSlug && ["home", "courses", "about-us", "our-services"].includes(editingSlug) ? "This page uses a built-in URL." : "New pages are available at /pages/your-slug."}</small>
              </label>
              <label>
                Small heading
                <input value={current.eyebrow} onChange={(event) => setCurrent({ ...current, eyebrow: event.target.value })} maxLength={100} />
              </label>
            </div>
            <label>
              Page title
              <input value={current.title} onChange={(event) => setCurrent({ ...current, title: event.target.value })} maxLength={160} required />
            </label>
            <label>
              Introduction
              <textarea rows={3} value={current.intro} onChange={(event) => setCurrent({ ...current, intro: event.target.value })} maxLength={1000} />
            </label>
            <label>
              Page content <span className="admin-label-hint">Markdown supported: headings, paragraphs, and bullet lists</span>
              <textarea className="admin-markdown" rows={12} value={current.body} onChange={(event) => setCurrent({ ...current, body: event.target.value })} maxLength={30000} placeholder={"## A section heading\n\nWrite page content here…"} />
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" checked={current.published} onChange={(event) => setCurrent({ ...current, published: event.target.checked })} />
              Publish this page
            </label>
            <div className="admin-editor__actions">
              <button className="admin-button" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
              ) : (
          <section className="admin-card">
            <div className="admin-list-heading">
              <div><h2>Pages</h2><p>{pages.length} pages in your site content</p></div>
              <button className="admin-button" onClick={() => { setError(""); setEditingSlug(null); setCurrent(blankPage()) }}>Add a page</button>
            </div>
            <div className="admin-page-list">
              {pages.map((page) => (
                <article className="admin-page-row" key={page.slug}>
                  <div>
                    <h3>{page.title}</h3>
                    <span>{pagePath(page.slug)} · {page.published ? "Published" : "Draft"}</span>
                  </div>
                  <div className="admin-row-actions">
                    <button className="admin-button admin-button--quiet" onClick={() => { setError(""); setEditingSlug(page.slug); setCurrent({ ...page }) }}>Edit</button>
                    <button className="admin-button admin-button--danger" onClick={() => removePage(page.slug)}>Delete</button>
                  </div>
                </article>
              ))}
              {!pages.length && <p className="admin-empty">There are no content pages yet.</p>}
            </div>
          </section>
              )}
              {activeSection === "pages" && <p className="admin-footnote">Content is stored as JSON files in your Git repository—no database is used.</p>}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
