/**
 * §2.1 Input Validation — Zod schemas for all API routes
 *
 * Every external input must be validated server-side using explicit schemas.
 * This module centralizes all validation schemas and helper functions.
 */

import { z } from 'zod';

// ─── Reusable Field Validators ──────────────────────────────────────

export const CountyCodeSchema = z
  .string()
  .regex(/^\d{3}$/, 'County code must be a 3-digit string (e.g. "001")');

export const CountyNameSchema = z
  .string()
  .min(2, 'County name must be at least 2 characters')
  .max(50, 'County name must not exceed 50 characters')
  .trim();

export const RegionSchema = z.enum([
  'Coast', 'North Eastern', 'Eastern', 'Central',
  'Rift Valley', 'Western', 'Nyanza', 'Nairobi',
]);

export const CoalitionSchema = z.enum([
  'Kenya Kwanza Alliance',
  'Azimio la Umoja One Kenya Coalition',
  'Independent',
]);

export const FinancialYearSchema = z
  .string()
  .regex(/^FY \d{4}\/\d{2}$/, 'Financial year must match "FY 2024/25" format');

export const GenderSchema = z.enum(['male', 'female', 'all']);

export const SectorSchema = z.enum([
  'health', 'education', 'infrastructure', 'agriculture',
  'water', 'roads', 'trade', 'youth', 'environment', 'other',
]);

export const TipCategorySchema = z.enum([
  'corruption', 'embezzlement', 'procurement_irregularity',
  'nepotism', 'misappropriation', 'fraud', 'bribery',
  'conflict_of_interest', 'undue_influence', 'other',
]);

// ─── Rate Limiting Constants ────────────────────────────────────────

export const RATE_LIMITS = {
  /** Max stories per IP per hour */
  STORIES_POST: 10,
  /** Max tips per IP per hour */
  TIPS_POST: 20,
  /** Max GET requests per IP per minute (shared across public routes) */
  PUBLIC_READ: 60,
  /** Max characters for a story experience */
  MAX_STORY_LENGTH: 5000,
  /** Max characters for a tip description */
  MAX_TIP_LENGTH: 10000,
  /** Max in-memory items before rejecting new entries */
  MAX_STORIES_STORED: 500,
  MAX_TIPS_STORED: 1000,
} as const;

// ─── API-Specific Schemas ──────────────────────────────────────────

/** POST /api/stories — Citizen experience story submission */
export const StoryCreateSchema = z.object({
  countyName: CountyNameSchema,
  sector: SectorSchema,
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  experience: z
    .string()
    .min(20, 'Experience description must be at least 20 characters')
    .max(RATE_LIMITS.MAX_STORY_LENGTH, `Experience must not exceed ${RATE_LIMITS.MAX_STORY_LENGTH} characters`)
    .trim(),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .default(3),
  anonymous: z.boolean().default(true),
});

/** GET /api/stories query params */
export const StoryQuerySchema = z.object({
  county: CountyNameSchema.optional(),
  sector: SectorSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/** POST /api/tips — Whistleblower tip submission */
export const TipCreateSchema = z.object({
  countyName: CountyNameSchema,
  category: TipCategorySchema,
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(RATE_LIMITS.MAX_TIP_LENGTH, `Description must not exceed ${RATE_LIMITS.MAX_TIP_LENGTH} characters`)
    .trim(),
  anonymous: z.boolean().default(true),
});

/** GET /api/counties query params */
export const CountiesQuerySchema = z.object({
  code: CountyCodeSchema.optional(),
  region: RegionSchema.optional(),
  coalition: CoalitionSchema.optional(),
  year: FinancialYearSchema.default('FY 2024/25'),
});

/** GET /api/audits query params */
export const AuditsQuerySchema = z.object({
  county: z.string().max(50).trim().optional(),
  year: FinancialYearSchema.optional(),
});

/** GET /api/budget query params */
export const BudgetQuerySchema = z.object({
  county: z.string().max(50).trim().optional(),
  year: FinancialYearSchema.optional(),
});

/** GET /api/scorecards query params */
export const ScorecardsQuerySchema = z.object({
  year: FinancialYearSchema.optional(),
});

/** GET /api/mzalendo query params */
export const MzalendoQuerySchema = z.object({
  gender: GenderSchema.optional(),
  county: z.string().max(50).trim().optional(),
  coalition: CoalitionSchema.optional(),
});

/** GET /api/weather query params */
export const WeatherQuerySchema = z.object({
  lat: z.coerce.number().min(-4.9).max(5.0).default(-1.2864),
  lng: z.coerce.number().min(33.9).max(42.0).default(36.8172),
  location: z.string().max(100).default('Nairobi'),
});

// ─── Validation Helpers ────────────────────────────────────────────

/**
 * Validate and parse request query parameters against a Zod schema.
 * Returns either the parsed data or a 400 NextResponse.
 */
export function validateQuery<T extends z.ZodType>(
  request: Request,
  schema: T,
): { success: true; data: z.infer<T> } | { success: false; response: Response } {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return {
      success: false,
      response: Response.json(
        { error: 'Invalid query parameters', details: errors },
        { status: 400 },
      ),
    };
  }
  return { success: true, data: result.data };
}

/**
 * Validate and parse request body against a Zod schema.
 * Returns either the parsed data or a 400 NextResponse.
 */
export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json(
        { error: 'Invalid JSON body — could not parse request' },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return {
      success: false,
      response: Response.json(
        { error: 'Invalid request body', details: errors },
        { status: 400 },
      ),
    };
  }
  return { success: true, data: result.data };
}
