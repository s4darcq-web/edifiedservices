import type { Metadata } from "next";
import SiteShell from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Edified Services | Purpose-led growth",
    template: "%s | Edified Services",
  },
  description:
    "Thoughtful coaching, counselling, training and mentorship for young people, families and organisations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
