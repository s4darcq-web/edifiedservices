"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Footer, Header } from "@/components/site-pages"

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      {children}
      {pathname !== "/dashboard" && <Footer />}
    </>
  )
}
