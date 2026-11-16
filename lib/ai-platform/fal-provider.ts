import "server-only";
import { fal } from "@fal-ai/client";
import type { PlatformJob } from "./contracts";

function configureFal() {
  const credentials = process.env.FAL_KEY;
  if (!credentials) {
    throw new Error("FAL_KEY no estÃ¡ configurada en el servidor.");
  }
  fal.config({ credentials });
}

export async function submitFalJob(options: {
  model: string;
  endpoint: string;
  input: Record<string, unknown>;
  webhookUrl?: string;
}): Promise<PlatformJob> {
  configureFal();
  const submitted = await fal.queue.submit(options.endpoint, {
    input: options.input,
    webhookUrl: options.webhookUrl
  });

  return {
    provider: "fal",
    model: options.model,
    endpoint: options.endpoint,
    requestId: submitted.request_id,
    status: submitted.status,
    statusUrl: submitted.status_url,
    responseUrl: submitted.response_url,
    cancelUrl: submitted.cancel_url
  };
}

export async function getFalJobStatus(endpoint: string, requestId: string) {
  configureFal();
  return fal.queue.status(endpoint, {
    requestId,
    logs: true
  });
}

export async function getFalJobResult(endpoint: string, requestId: string) {
  configureFal();
  return fal.queue.result(endpoint, { requestId });
}
