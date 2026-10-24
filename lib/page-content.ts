import pages from "@/content/pages.json"

export type PageContent = {
  slug: string
  title: string
  eyebrow: string
  intro: string
  body: string
  published: boolean
}

export const initialPages = pages as PageContent[]

export function getPageContent(slug: string) {
  return initialPages.find((page) => page.slug === slug && page.published)
}
