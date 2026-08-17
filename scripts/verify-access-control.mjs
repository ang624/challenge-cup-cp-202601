import { spawn } from "node:child_process";
import path from "node:path";

const port = 3099;
const username = "verification-user";
const password = "verification-password";
const baseUrl = `http://127.0.0.1:${port}`;
const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");
const server = spawn(process.execPath, [serverPath], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    HOSTNAME: "127.0.0.1",
    PORT: String(port),
    REQUIRE_ACCESS_CONTROL: "true",
    APP_ACCESS_USERNAME: username,
    APP_ACCESS_PASSWORD: password,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // The standalone process may still be binding its port.
    }
    await sleep(250);
  }
  throw new Error("受控访问测试服务器未在10秒内启动");
}

function assertStatus(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}应返回${expected}，实际返回${actual}`);
}

try {
  await waitUntilReady();
  const unauthorized = await fetch(`${baseUrl}/strategic`, { redirect: "manual" });
  assertStatus(unauthorized.status, 401, "未授权请求");
  if (!unauthorized.headers.get("www-authenticate")?.startsWith("Basic ")) {
    throw new Error("未授权响应缺少Basic认证挑战头");
  }

  const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const authorized = await fetch(`${baseUrl}/strategic`, { headers: { authorization } });
  assertStatus(authorized.status, 200, "授权页面请求");
  const data = await fetch(`${baseUrl}/api/platform/snapshot?page=strategic&region=${encodeURIComponent("云南省")}&year=2047&technology=PSC_T&scene=${encodeURIComponent("全部场景")}&scenario=${encodeURIComponent("基准转型")}&quantile=P50`, {
    headers: { authorization },
  });
  assertStatus(data.status, 200, "授权数据请求");
  const health = await fetch(`${baseUrl}/api/health`);
  assertStatus(health.status, 200, "免认证健康检查");
  console.log("访问控制验证通过：未授权401，授权页面与数据200，健康检查200");
} finally {
  server.kill();
}
