import { z } from "zod";

export const submitJobSchema = z.object({
  model: z.string().min(1).max(100),
  input: z.record(z.string(), z.unknown()),
  webhookUrl: z.string().url().optional(),
  idempotencyKey: z.string().min(8).max(200).optional()
});

export type SubmitJobInput = z.infer<typeof submitJobSchema>;

export type PlatformJob = {
  provider: "fal";
  model: string;
  endpoint: string;
  requestId: string;
  status: string;
  statusUrl?: string;
  responseUrl?: string;
  cancelUrl?: string;
};
