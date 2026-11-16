import "server-only";
import { getModel } from "./models";
import { submitFalJob } from "./fal-provider";
import type { SubmitJobInput } from "./contracts";

export async function submitPlatformJob(payload: SubmitJobInput) {
  const model = getModel(payload.model);
  if (!model) {
    throw new Error("Modelo no permitido o deshabilitado.");
  }

  if (model.provider === "fal") {
    return submitFalJob({
      model: model.key,
      endpoint: model.endpoint,
      input: payload.input,
      webhookUrl: payload.webhookUrl
    });
  }

  throw new Error("Proveedor no soportado.");
}
