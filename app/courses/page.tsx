import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursesPage } from "@/components/site-pages";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPageContent("courses");
  return page
    ? { title: page.title, description: page.intro }
    : { title: "Page not found" };
}

export default function Page() {
  const page = getPageContent("courses");
  if (!page) notFound();
  return <CoursesPage page={page} />;
}
