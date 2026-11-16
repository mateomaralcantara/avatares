import { NextResponse } from "next/server";
import { getEnabledModels } from "@/lib/ai-platform/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    models: getEnabledModels().map(({ endpoint, ...model }) => model)
  });
}
