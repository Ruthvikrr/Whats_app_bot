import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
if (!process.env.WHATSAPP_ACCESS_TOKEN) {
  dotenv.config({ path: 'example.env' });
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  META_VERIFY_TOKEN: z.string().min(1, 'META_VERIFY_TOKEN is required and must not be empty'),
  WHATSAPP_ACCESS_TOKEN: z
    .string()
    .min(1, 'WHATSAPP_ACCESS_TOKEN is required and must not be empty'),
  WHATSAPP_PHONE_NUMBER_ID: z
    .string()
    .min(1, 'WHATSAPP_PHONE_NUMBER_ID is required and must not be empty'),
  META_APP_ID: z.string().optional().default(''),
  META_APP_SECRET: z.string().optional().default(''),
  META_GRAPH_API_VERSION: z
    .string()
    .regex(/^v\d+\.\d+$/, 'META_GRAPH_API_VERSION must be in format vXX.X (e.g. v21.0)')
    .default('v21.0'),
  PUBLIC_APP_URL: z.string().optional().default('https://crawling-pouncing-docile.ngrok-free.dev'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.errors
    .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
    .join('\n');

  console.error('\n❌ Environment variable validation error:\n' + formattedErrors + '\n');
  console.error('Please ensure all required variables are set in your .env file.\n');

  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      PORT: 3000,
      NODE_ENV: 'test' as const,
      META_VERIFY_TOKEN: 'test_verify_token',
      WHATSAPP_ACCESS_TOKEN: 'test_access_token',
      WHATSAPP_PHONE_NUMBER_ID: 'test_phone_number_id',
      META_APP_ID: 'test_app_id',
      META_APP_SECRET: 'test_app_secret',
      META_GRAPH_API_VERSION: 'v21.0',
      PUBLIC_APP_URL: 'https://crawling-pouncing-docile.ngrok-free.dev',
    };

export type Env = z.infer<typeof envSchema>;
