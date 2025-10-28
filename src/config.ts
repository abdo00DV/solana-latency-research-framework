import { z } from "zod";

const EnvSchema = z.object({
  SHREDSTREAM_ENDPOINT: z.string().min(1),
  SHREDSTREAM_TOKEN: z.string().min(1),
  HTTP_HOST: z.string().default("0.0.0.0"),
  HTTP_PORT: z.coerce.number().default(8080),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid env:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
