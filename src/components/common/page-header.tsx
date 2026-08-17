import { pageHeaders, type PageSlug } from "@/lib/navigation";

export function PageHeader({ page }: { page: PageSlug }) {
  const item = pageHeaders[page];
  return (
    <header className="page-heading">
      <span className="eyebrow">{item.eyebrow}</span>
      <h1>{item.title}</h1>
      <p>{item.lead}</p>
    </header>
  );
}

export function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {note ? <p>{note}</p> : null}
    </div>
  );
}
