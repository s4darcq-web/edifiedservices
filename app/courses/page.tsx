import type { Metadata } from "next";
import { CoursesPage } from "@/components/site-pages";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore Edified Services learning programmes for young people, caregivers and professionals.",
};

export default function Page() {
  return <CoursesPage />;
}
