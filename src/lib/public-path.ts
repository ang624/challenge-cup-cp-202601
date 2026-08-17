const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${basePath}${normalized}`;
}
