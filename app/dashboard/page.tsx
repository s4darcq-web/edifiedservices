import type { Metadata } from "next";
import { DashboardPage } from "@/components/site-pages";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DashboardPage />;
}
