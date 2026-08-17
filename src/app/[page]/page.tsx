import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/layout/platform-shell";
import { validPageSlugs, type PageSlug } from "@/lib/navigation";

export default async function PlatformPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!validPageSlugs.has(page as PageSlug)) notFound();
  return <PlatformShell page={page as PageSlug} />;
}
