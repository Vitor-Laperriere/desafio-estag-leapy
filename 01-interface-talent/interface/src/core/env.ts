// src/core/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  DIRECTUS_URL: z.string().url(),
  DIRECTUS_TOKEN: z.string().min(1),
  DEFAULT_PAGE_SIZE: z.coerce.number().int().positive().default(10),
});

export const env = EnvSchema.parse({
  DIRECTUS_URL: process.env.DIRECTUS_URL ?? "http://localhost:8055",
  DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
  DEFAULT_PAGE_SIZE: process.env.DEFAULT_PAGE_SIZE,
});
