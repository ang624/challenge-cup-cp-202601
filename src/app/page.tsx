"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/strategic");
  }, [router]);
  return <main className="app-loading">正在进入战略总览… <Link href="/strategic">立即进入</Link></main>;
}
