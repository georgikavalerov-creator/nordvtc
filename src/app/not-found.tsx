import type { Metadata } from "next";
import NotFoundFun from "@/components/NotFoundFun";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false, follow: true } };

export default function NotFound() {
  return <NotFoundFun />;
}
