import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "avatares-ai-platform",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    providers: {
      fal: Boolean(process.env.FAL_KEY)
    }
  });
}
