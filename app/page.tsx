import { notFound } from "next/navigation";
import { HomePage } from "@/components/site-pages";
import { getPageContent } from "@/lib/page-content";

export default function Page() {
  const page = getPageContent("home");
  if (!page) notFound();
  return <HomePage page={page} />;
}
