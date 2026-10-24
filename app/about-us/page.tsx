import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/site-pages";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPageContent("about-us");
  return page
    ? { title: page.title, description: page.intro }
    : { title: "Page not found" };
}

export default function Page() {
  const page = getPageContent("about-us");
  if (!page) notFound();
  return <AboutPage page={page} />;
}
