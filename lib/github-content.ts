import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { PageContent } from "@/lib/page-content"

const contentPath = "content/pages.json"

function localContentPath() {
  return path.join(process.cwd(), contentPath)
}

function repositoryConfig() {
  const token = process.env.GITHUB_TOKEN
  const repository = process.env.GITHUB_REPOSITORY
  const branch = process.env.GITHUB_BRANCH
  if (!token && !repository && !branch && process.env.NODE_ENV !== "production") {
    return null
  }
  if (!token || !repository || !branch) {
    throw new Error(
      "GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_BRANCH must be configured.",
    )
  }
  return { token, repository, branch }
}

async function getCurrentFile() {
  const config = repositoryConfig()
  if (!config) {
    const content = await readFile(localContentPath(), "utf8")
    return { sha: "", pages: JSON.parse(content) as PageContent[] }
  }
  const { token, repository, branch } = config
  const response = await fetch(
    `https://api.github.com/repos/${repository}/contents/${contentPath}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  )
  if (!response.ok) {
    throw new Error(`GitHub could not read ${contentPath} (${response.status}).`)
  }
  const file = (await response.json()) as { sha: string; content: string }
  const decoded = Buffer.from(file.content, "base64").toString("utf8")
  return { sha: file.sha, pages: JSON.parse(decoded) as PageContent[] }
}

export async function getRepositoryPages() {
  return (await getCurrentFile()).pages
}

export async function commitRepositoryPages(pages: PageContent[]) {
  const config = repositoryConfig()
  if (!config) {
    await writeFile(localContentPath(), `${JSON.stringify(pages, null, 2)}\n`, "utf8")
    return { commitUrl: null, local: true }
  }
  const { token, repository, branch } = config
  const { sha } = await getCurrentFile()
  const response = await fetch(
    `https://api.github.com/repos/${repository}/contents/${contentPath}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: "Update website page content",
        content: Buffer.from(`${JSON.stringify(pages, null, 2)}\n`).toString(
          "base64",
        ),
        sha,
        branch,
      }),
      cache: "no-store",
    },
  )
  if (!response.ok) {
    const message = await response.text()
    throw new Error(`GitHub could not commit page content: ${message}`)
  }
  const result = (await response.json()) as { commit: { html_url: string } }
  return { commitUrl: result.commit.html_url, local: false }
}
