"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("page_render_failed", error);
  }, [error]);

  return <main className="route-error">
    <span>发布数据读取异常</span>
    <h1>当前页面暂时无法显示</h1>
    <p>已保留当前筛选条件，可重新读取服务端已审核结果。</p>
    <button type="button" onClick={reset}>重新读取</button>
  </main>;
}
