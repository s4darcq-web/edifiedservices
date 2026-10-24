import { hasAdminSession } from "@/lib/admin-auth"
import { commitRepositoryPages, getRepositoryPages } from "@/lib/github-content"
import type { PageContent } from "@/lib/page-content"

function validPages(value: unknown): value is PageContent[] {
  if (!Array.isArray(value) || value.length > 100) return false
  const slugs = new Set<string>()
  return value.every((page) => {
    if (
      !page ||
      typeof page !== "object" ||
      typeof page.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug) ||
      typeof page.title !== "string" ||
      !page.title.trim() ||
      page.title.length > 160 ||
      typeof page.eyebrow !== "string" ||
      page.eyebrow.length > 100 ||
      typeof page.intro !== "string" ||
      page.intro.length > 1000 ||
      typeof page.body !== "string" ||
      page.body.length > 30000 ||
      typeof page.published !== "boolean" ||
      slugs.has(page.slug)
    ) {
      return false
    }
    slugs.add(page.slug)
    return true
  })
}

async function accessError() {
  try {
    return (await hasAdminSession())
      ? null
      : Response.json({ error: "Please sign in again." }, { status: 401 })
  } catch (error) {
    console.error("Admin session validation failed.", error)
    const message =
      error instanceof Error && error.message.includes("ADMIN_SESSION_SECRET")
        ? error.message
        : "Admin authentication is not configured correctly."
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const authError = await accessError()
  if (authError) return authError
  try {
    return Response.json({ pages: await getRepositoryPages() })
  } catch (error) {
    console.error("Could not load page content from GitHub.", error)
    const message =
      error instanceof Error && error.message.startsWith("GITHUB_TOKEN,")
        ? error.message
        : "Could not load page content from GitHub."
    return Response.json({ error: message }, { status: 502 })
  }
}

export async function PUT(request: Request) {
  const authError = await accessError()
  if (authError) return authError
  if (Number(request.headers.get("content-length")) > 1_000_000) {
    return Response.json({ error: "The submitted content is too large." }, { status: 413 })
  }
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 })
  }
  try {
    const { pages } = (await request.json()) as { pages?: unknown }
    if (!validPages(pages)) {
      return Response.json({ error: "The submitted page content is invalid." }, { status: 400 })
    }
    const result = await commitRepositoryPages(pages)
    return Response.json({ saved: true, ...result })
  } catch (error) {
    console.error("Could not save page content to GitHub.", error)
    return Response.json({ error: "Could not save changes to GitHub. Check the server configuration and try again." }, { status: 502 })
  }
}
