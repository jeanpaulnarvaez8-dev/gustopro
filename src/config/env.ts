import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  DIRECT_URL: z.string().url().optional(),

  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.string().url().optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z
    .string()
    .email()
    .default("noreply@gustopro.it"),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${errors?.join(", ")}`)
      .join("\n");

    throw new Error(
      `\n❌ Invalid environment variables:\n${message}\n`
    );
  }

  return parsed.data;
}

export const env = validateEnv();
