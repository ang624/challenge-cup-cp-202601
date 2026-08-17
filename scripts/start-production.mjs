import { spawn } from "node:child_process";
import path from "node:path";

const port = process.argv[2] ?? process.env.PORT ?? "3001";
const hostname = process.env.HOSTNAME ?? "127.0.0.1";
const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");

const child = spawn(process.execPath, [serverPath], {
  cwd: process.cwd(),
  env: { ...process.env, HOSTNAME: hostname, PORT: port },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
