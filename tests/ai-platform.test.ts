import { describe, expect, it } from "vitest";
import { submitJobSchema } from "../lib/ai-platform/contracts";
import { getEnabledModels, getModel } from "../lib/ai-platform/models";

 describe("AI platform core", () => {
  it("expone modelos permitidos", () => {
    expect(getEnabledModels().length).toBeGreaterThan(0);
    expect(getModel("image-fast")?.provider).toBe("fal");
  });

  it("rechaza solicitudes sin modelo", () => {
    const result = submitJobSchema.safeParse({ input: {} });
    expect(result.success).toBe(false);
  });

  it("acepta una solicitud vÃ¡lida", () => {
    const result = submitJobSchema.safeParse({
      model: "image-fast",
      input: { prompt: "un leÃ³n futurista" },
      idempotencyKey: "request-12345678"
    });
    expect(result.success).toBe(true);
  });
});
