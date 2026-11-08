import type { Metadata } from "next"
import { SupportPage } from "@/components/site-pages"

export const metadata: Metadata = {
  title: "Support Us",
  description:
    "Learn how to support the Edified School Fund and Edified Sports Team through awareness, partnerships, publicity and sponsorship.",
}

export default function Page() {
  return <SupportPage />
}
