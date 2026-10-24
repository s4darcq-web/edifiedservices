import type { Metadata } from "next"
import PortalDashboard from "@/components/portal-dashboard"

export const metadata: Metadata = {
  title: "Learning Portal",
  robots: { index: false, follow: false },
}

export default function Page() {
  return <PortalDashboard />
}
