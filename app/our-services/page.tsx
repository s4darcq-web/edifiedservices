import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicesPage } from "@/components/site-pages";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPageContent("our-services");
  return page
    ? { title: page.title, description: page.intro }
    : { title: "Page not found" };
}

export default function Page() {
  const page = getPageContent("our-services");
  if (!page) notFound();
  return <ServicesPage page={page} />;
}
