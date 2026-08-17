import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function sameSecret(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function unauthorized(): NextResponse {
  return new NextResponse("需要访问凭据", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CP-202601 Research Preview", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const requireAccess = process.env.REQUIRE_ACCESS_CONTROL === "true";
  if (!requireAccess || request.nextUrl.pathname === "/api/health") return NextResponse.next();

  const username = process.env.APP_ACCESS_USERNAME;
  const password = process.env.APP_ACCESS_PASSWORD;
  if (!username || !password) return unauthorized();

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    const actualUsername = separator >= 0 ? decoded.slice(0, separator) : "";
    const actualPassword = separator >= 0 ? decoded.slice(separator + 1) : "";
    if (!sameSecret(actualUsername, username) || !sameSecret(actualPassword, password)) return unauthorized();
    return NextResponse.next();
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
