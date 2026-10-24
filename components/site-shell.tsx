"use client"

import type { ReactNode } from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { Footer, Header } from "@/components/site-pages"

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const isStudentPortal = pathname === "/dashboard"
  const isAdminPortal = pathname === "/admin"

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!isStudentPortal && !isAdminPortal && (
        <Suspense fallback={<div className="site-header site-header--loading" aria-hidden="true" />}>
          <Header />
        </Suspense>
      )}
      {children}
      {!isAdmin && !isStudentPortal && <Footer />}
    </>
  )
}
