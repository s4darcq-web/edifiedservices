import type { Metadata } from "next";
import { ServicesPage } from "@/components/site-pages";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore coaching, counselling, mentorship, training and consultancy services from Edified Services.",
};

export default function Page() {
  return <ServicesPage />;
}
