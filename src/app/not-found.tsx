import Link from "next/link";

export default function NotFound() {
  return <main className="route-error">
    <span>页面不存在</span>
    <h1>未找到对应的决策视图</h1>
    <p>一级导航固定为七项，请返回战略总览继续。</p>
    <Link href="/strategic">返回战略总览</Link>
  </main>;
}
