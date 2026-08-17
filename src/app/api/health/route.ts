export async function GET() {
  return Response.json({
    status: "ok",
    service: "cp-202601-research-platform",
    version: process.env.DEPLOYMENT_VERSION ?? "local",
    dataMode: "server-private-reviewed-snapshot",
    checkedAt: new Date().toISOString(),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
