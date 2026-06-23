import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment variable validation schema.
 *
 * This module validates all required environment variables at application startup,
 * preventing cryptic "undefined" errors in production. Missing or invalid variables
 * will cause the application to fail immediately with clear, actionable error messages.
 *
 * @see https://env.t3.gg/docs/nextjs for more information
 */
export const env = createEnv({
  /**
   * Server-side environment variables.
   * These are NOT exposed to the browser and are only available on the server.
   */
  server: {
    /**
     * Node environment (development, production, or test).
     * Defaults to 'development' if not set.
     */
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    /**
     * Database connection string using the transaction pooler.
     *
     * IMPORTANT: This URL must use port 6543 (PgBouncer in Transaction mode).
     * Use this for: Server Actions, API routes, and all application queries.
     *
     * Format: postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
     */
    DATABASE_URL: z.string().url(),

    /**
     * Direct database connection string.
     *
     * IMPORTANT: This URL must use port 5432 (direct PostgreSQL connection).
     * Use this for: Prisma migrations ONLY (npx prisma db push/reset).
     *
     * Format: postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
     */
    DIRECT_URL: z.string().url(),

    /**
     * GitHub webhook secret for signature verification.
     * Get from: GitHub Repository → Settings → Webhooks → Secret
     *
     * IMPORTANT: This must match the secret configured in your GitHub webhook.
     * The signature is sent as x-hub-signature-256 header.
     */
    GITHUB_WEBHOOK_SECRET: z.string().min(1),

    /**
     * Encryption key for sensitive data (GitHub tokens, etc.).
     *
     * Generate with: openssl rand -base64 32
     * Must be 32+ bytes for AES-256-GCM encryption.
     */
    ENCRYPTION_KEY: z.string().min(32),

    /**
     * Supabase service role key.
     * Get from: Supabase Dashboard → Settings → API
     *
     * IMPORTANT: This key bypasses RLS policies. Only use for trusted server-side
     * operations like webhooks and background jobs. NEVER expose to clients.
     */
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    /**
     * Google Gemini API key for AI features (Shift Brief).
     * Get from: Google AI Studio → Create API Key
     *
     * IMPORTANT: This key is optional. The app works without it, but Shift Brief
     * features will be disabled. Only used for server-side AI generation with
     * Gemini 2.5 Flash Lite model.
     */
    GEMINI_API_KEY: z.string().min(1).optional(),

    /**
     * Slack OAuth client ID.
     * Get from: Slack App Dashboard → Basic Information → App Credentials
     *
     * IMPORTANT: This is optional. The app works without Slack integration.
     */
    SLACK_CLIENT_ID: z.string().min(1).optional(),

    /**
     * Slack OAuth client secret.
     * Get from: Slack App Dashboard → Basic Information → App Credentials
     *
     * IMPORTANT: This is optional. The app works without Slack integration.
     */
    SLACK_CLIENT_SECRET: z.string().min(1).optional(),

    /**
     * Slack signing secret for request verification.
     * Get from: Slack App Dashboard → Basic Information → App Credentials
     *
     * IMPORTANT: This is optional. The app works without Slack integration.
     */
    SLACK_SIGNING_SECRET: z.string().min(1).optional(),
  },

  /**
   * Client-side environment variables.
   * These are exposed to the browser and must start with NEXT_PUBLIC_.
   */
  client: {
    /**
     * Supabase project URL.
     * Get from: Supabase Dashboard → Settings → API
     *
     * Format: https://your-project.supabase.co
     */
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

    /**
     * Supabase anonymous key.
     * Get from: Supabase Dashboard → Settings → API
     *
     * This key is safe to expose to the browser as it's subject to RLS policies.
     */
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    /**
     * Application URL for production deployments.
     * Defaults to 'http://localhost:3000' if not set.
     *
     * Used for: OAuth redirects, email links, and absolute URL generation
     */
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  },

  /**
   * Runtime validation.
   *
   * When true, environment variables are validated on every access.
   * When false, validation happens once at module load time.
   *
   * We set this to false for better performance since we validate at startup.
   */
  runtimeEnv: {
    // Server variables
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,

    // Client variables (also available on server)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Called when validation fails.
   * Formats the error message for better readability.
   */
  onValidationError: (error) => {
    console.error('❌ Invalid environment variables:');
    for (const issue of error) {
      console.error(`  ${issue.path?.join('.') || 'unknown'}: ${issue.message}`);
    }
    throw new Error('Environment variables validation failed. See above for details.');
  },
});


