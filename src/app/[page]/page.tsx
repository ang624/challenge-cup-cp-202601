import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/layout/platform-shell";
import { navigationGroups, validPageSlugs, type PageSlug } from "@/lib/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return navigationGroups.flatMap((group) => group.items.map((item) => ({ page: item.slug })));
}

export default async function PlatformPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!validPageSlugs.has(page as PageSlug)) notFound();
  return <PlatformShell page={page as PageSlug} />;
}
