export type PlatformModel = {
  key: string;
  provider: "fal";
  endpoint: string;
  category: "image" | "video" | "audio" | "text";
  title: string;
  enabled: boolean;
};

export const MODEL_REGISTRY: Record<string, PlatformModel> = {
  "image-fast": {
    key: "image-fast",
    provider: "fal",
    endpoint: process.env.FAL_IMAGE_FAST_MODEL || "fal-ai/flux/schnell",
    category: "image",
    title: "Imagen rÃ¡pida",
    enabled: true
  },
  "image-quality": {
    key: "image-quality",
    provider: "fal",
    endpoint: process.env.FAL_IMAGE_QUALITY_MODEL || "fal-ai/flux/dev",
    category: "image",
    title: "Imagen de alta calidad",
    enabled: true
  }
};

export function getEnabledModels() {
  return Object.values(MODEL_REGISTRY).filter((model) => model.enabled);
}

export function getModel(modelKey: string) {
  const model = MODEL_REGISTRY[modelKey];
  return model?.enabled ? model : null;
}
