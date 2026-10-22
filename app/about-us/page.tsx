import type { Metadata } from "next";
import { AboutPage } from "@/components/site-pages";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Edified Services and its people-centred approach to learning and development.",
};

export default function Page() {
  return <AboutPage />;
}
