"use client";

import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  useEffect(() => {
    window.location.replace(`${basePath}/strategic/${window.location.search}`);
  }, []);
  return <main className="app-loading">正在进入战略总览… <a href={`${basePath}/strategic/`}>立即进入</a></main>;
}
