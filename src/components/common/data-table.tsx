"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { csvCell, downloadBlob, safeText } from "@/lib/format";
import type { DataRecord } from "@/types/data";

export interface TableColumn {
  key: string;
  label: string;
  format?: (value: unknown, row: DataRecord) => string;
}

export function DataTable({ rows, columns, name, pageSize = 8 }: { rows: DataRecord[]; columns: TableColumn[]; name: string; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, rows]);
  const download = () => {
    const text = [columns.map((column) => csvCell(column.label)).join(","), ...rows.map((row) => columns.map((column) => csvCell(column.format ? column.format(row[column.key], row) : row[column.key])).join(","))].join("\r\n");
    downloadBlob(`${name}.csv`, `\ufeff${text}`, "text/csv;charset=utf-8");
  };
  return (
    <div className="table-block">
      <div className="table-toolbar"><span>共 {rows.length} 条记录</span><button type="button" onClick={download}><Download />下载数据</button></div>
      <div className="table-scroll"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{visible.map((row, rowIndex) => <tr key={`${page}-${rowIndex}`}>{columns.map((column) => <td key={column.key}>{column.format ? column.format(row[column.key], row) : safeText(row[column.key])}</td>)}</tr>)}</tbody></table></div>
      <div className="table-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft />上一页</button><span>{page} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>下一页<ChevronRight /></button></div>
    </div>
  );
}
