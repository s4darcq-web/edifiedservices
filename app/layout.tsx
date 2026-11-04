import type { Metadata } from "next";
import SiteShell from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Edified Services | The Hub for Children and Youth Wellness",
    template: "%s | Edified Services",
  },
  description:
    "Raising an edified generation living out its purpose. Services for families of children and youth aged 8–25 years.",
  icons: {
    icon: "/images/edifiedlogo.jpg",
    apple: "/images/edifiedlogo.jpg",
  },
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
