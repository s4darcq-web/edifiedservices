import { notFound } from "next/navigation"
import { CmsPage } from "@/components/site-pages"
import { getPageContent, initialPages } from "@/lib/page-content"

type CmsRouteProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return initialPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: CmsRouteProps) {
  const { slug } = await params
  const page = getPageContent(slug)
  return page ? { title: page.title, description: page.intro } : { title: "Page not found" }
}

export default async function Page({ params }: CmsRouteProps) {
  const { slug } = await params
  const page = getPageContent(slug)
  if (!page) notFound()
  return <CmsPage page={page} />
}
