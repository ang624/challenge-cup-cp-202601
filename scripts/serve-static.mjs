import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT || 3002);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const root = path.join(process.cwd(), "out");
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".geojson", "application/geo+json; charset=utf-8"],
  [".gz", "application/gzip"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (basePath && pathname.startsWith(basePath)) pathname = pathname.slice(basePath.length) || "/";
    let filePath = path.join(root, pathname);
    const info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) filePath = path.join(filePath, "index.html");
    if (!info && !path.extname(filePath)) filePath = path.join(filePath, "index.html");
    const payload = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes.get(path.extname(filePath)) || "application/octet-stream" });
    response.end(payload);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static site: http://127.0.0.1:${port}${basePath}/`);
});
