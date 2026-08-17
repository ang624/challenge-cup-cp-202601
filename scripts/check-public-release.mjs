import { access, readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const root = process.cwd();
const forbiddenDirectories = new Set([
  ".next", ".vercel", "node_modules", "output", "private-data", "reference",
  "screenshots", "test-results", "video-production", "video-production-90s",
  "video-production-90s-final",
]);
const forbiddenExtensions = new Set([
  ".csv", ".db", ".docx", ".dwg", ".opju", ".pdf", ".sqlite", ".sqlite3", ".xlsx",
]);
const textExtensions = new Set([
  ".css", ".html", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".txt", ".yml", ".yaml",
]);
const forbiddenText = [
  /C:\\Users\\ang/iu,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/u,
  /BLOB_READ_WRITE_TOKEN\s*=\s*(?!replace-with-vercel-managed-token\b)[^\s#]+/u,
];
const forbiddenRuntimeFields = [
  "approval_file",
  "knowledge_base_version",
  "parameter_hash",
  "reviewer_agent_id",
  "run_id",
  "sourceDatabaseSha256",
  "test_report_sha256",
];

const violations = [];
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (forbiddenDirectories.has(entry.name)) {
        continue;
      }
      await walk(absolute);
      continue;
    }
    files.push(relative);
  }
}

function trackedFiles() {
  try {
    const tracked = execFileSync("git", ["ls-files", "-z"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\0")
      .filter(Boolean);
    return [...new Set([...tracked, ...files])];
  } catch {
    return files;
  }
}

async function inspect(relative) {
  const absolute = path.join(root, relative);
  try {
    await access(absolute);
  } catch {
    return;
  }
  const segments = relative.split("/");
  const forbiddenDirectory = segments.slice(0, -1).find((segment) => forbiddenDirectories.has(segment));
  if (forbiddenDirectory) violations.push(`禁止发布目录: ${relative}`);
  const filename = path.basename(relative);
  const extension = path.extname(filename).toLowerCase();
  if (forbiddenExtensions.has(extension)) violations.push(`禁止发布文件: ${relative}`);
  if (filename.startsWith(".env") && filename !== ".env.example") {
    violations.push(`环境变量文件不得发布: ${relative}`);
  }
  if (textExtensions.has(extension) || filename === ".env.example") {
    const content = await readFile(absolute, "utf8");
    for (const pattern of forbiddenText) {
      if (pattern.test(content)) violations.push(`敏感内容命中 ${pattern}: ${relative}`);
      pattern.lastIndex = 0;
    }
  }
  if (relative === "public/data/v4-public-runtime.json.gz") {
    const content = gunzipSync(await readFile(absolute)).toString("utf8");
    for (const field of forbiddenRuntimeFields) {
      if (content.includes(`"${field}"`)) violations.push(`公开运行数据包含内部字段 ${field}`);
    }
    if (content.includes("C:\\Users\\ang") || content.includes("private-data")) {
      violations.push("公开运行数据包含本机路径或私有目录标识");
    }
  }
}

await walk(root);
for (const relative of trackedFiles()) await inspect(relative);
if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("公开发布审计通过：未发现私有研究数据、凭据或禁止文件。");
