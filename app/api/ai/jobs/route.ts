import { NextRequest, NextResponse } from "next/server";
import { submitJobSchema } from "@/lib/ai-platform/contracts";
import { submitPlatformJob } from "@/lib/ai-platform/gateway";
import { checkRateLimit } from "@/lib/ai-platform/rate-limit";
import { getIdempotentResult, saveIdempotentResult } from "@/lib/ai-platform/idempotency";
import { platformLogger } from "@/lib/ai-platform/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getIdentity(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(getIdentity(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "LÃ­mite de solicitudes excedido.", resetAt: rate.resetAt },
      { status: 429 }
    );
  }

  try {
    const parsed = submitJobSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Entrada invÃ¡lida.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cacheKey = parsed.data.idempotencyKey
      ? "ai-job:" + parsed.data.idempotencyKey
      : null;

    if (cacheKey) {
      const cached = getIdempotentResult(cacheKey);
      if (cached) {
        return NextResponse.json({ ok: true, cached: true, job: cached }, { status: 200 });
      }
    }

    const job = await submitPlatformJob(parsed.data);
    if (cacheKey) saveIdempotentResult(cacheKey, job);

    platformLogger.info({ requestId: job.requestId, model: job.model }, "AI job submitted");

    return NextResponse.json(
      { ok: true, cached: false, job, rateLimit: rate },
      { status: 202 }
    );
  } catch (error) {
    platformLogger.error({ error }, "AI job submission failed");
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error interno." },
      { status: 500 }
    );
  }
}
