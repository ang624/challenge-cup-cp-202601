import Image from "next/image";
import { cn } from "@/lib/utils";

export function AssetImage({ src, alt, className, priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return <div className={cn("asset-image", className)}><Image src={src} alt={alt} fill sizes="(max-width: 1100px) 100vw, 75vw" priority={priority} /></div>;
}
