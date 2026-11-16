import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/ai-platform/models";
import { getFalJobResult, getFalJobStatus } from "@/lib/ai-platform/fal-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ requestId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { requestId } = await params;
    const modelKey = request.nextUrl.searchParams.get("model") || "";
    const includeResult = request.nextUrl.searchParams.get("result") === "1";
    const model = getModel(modelKey);

    if (!model) {
      return NextResponse.json({ ok: false, error: "Modelo invÃ¡lido." }, { status: 400 });
    }

    const status = await getFalJobStatus(model.endpoint, requestId);
    const normalizedStatus = String(status.status || "UNKNOWN");

    if (includeResult && normalizedStatus === "COMPLETED") {
      const result = await getFalJobResult(model.endpoint, requestId);
      return NextResponse.json({ ok: true, status, result });
    }

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error interno." },
      { status: 500 }
    );
  }
}
