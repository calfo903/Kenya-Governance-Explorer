/**
 * §4.2 Testing — Unit tests for API validation schemas and error handlers
 *
 * Tests core logic and critical edge cases for:
 * - Zod validation schemas (§2.1)
 * - Error response builders (§3.1)
 * - Structured logger (§5.1)
 *
 * Run with: npx vitest run src/__tests__/api-validation.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  StoryCreateSchema,
  TipCreateSchema,
  StoryQuerySchema,
  CountiesQuerySchema,
  AuditsQuerySchema,
  BudgetQuerySchema,
  MzalendoQuerySchema,
  WeatherQuerySchema,
  CountyCodeSchema,
  CountyNameSchema,
  FinancialYearSchema,
  SectorSchema,
  TipCategorySchema,
  RATE_LIMITS,
} from '@/lib/api-validation';
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  tooManyRequests,
  internalError,
} from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

// ═══════════════════════════════════════════════════════════════════
// §2.1 — Zod Schema Validation Tests
// ═══════════════════════════════════════════════════════════════════

describe('CountyCodeSchema', () => {
  it('accepts valid 3-digit county codes', () => {
    expect(CountyCodeSchema.parse('001')).toBe('001');
    expect(CountyCodeSchema.parse('047')).toBe('047');
  });

  it('rejects non-3-digit codes', () => {
    expect(() => CountyCodeSchema.parse('1')).toThrow();
    expect(() => CountyCodeSchema.parse('0001')).toThrow();
    expect(() => CountyCodeSchema.parse('abc')).toThrow();
    expect(() => CountyCodeSchema.parse('')).toThrow();
  });
});

describe('CountyNameSchema', () => {
  it('accepts valid county names', () => {
    expect(CountyNameSchema.parse('Mombasa')).toBe('Mombasa');
    expect(CountyNameSchema.parse('Nairobi City')).toBe('Nairobi City');
  });

  it('trims whitespace', () => {
    expect(CountyNameSchema.parse('  Mombasa  ')).toBe('Mombasa');
  });

  it('rejects too-short names', () => {
    expect(() => CountyNameSchema.parse('A')).toThrow();
  });

  it('rejects too-long names', () => {
    expect(() => CountyNameSchema.parse('A'.repeat(51))).toThrow();
    expect(() => CountyNameSchema.parse('A'.repeat(50))).not.toThrow();
  });

  it('rejects empty string', () => {
    expect(() => CountyNameSchema.parse('')).toThrow();
  });
});

describe('FinancialYearSchema', () => {
  it('accepts valid FY format', () => {
    expect(FinancialYearSchema.parse('FY 2024/25')).toBe('FY 2024/25');
    expect(FinancialYearSchema.parse('FY 2022/23')).toBe('FY 2022/23');
  });

  it('rejects invalid formats', () => {
    expect(() => FinancialYearSchema.parse('2024/25')).toThrow();
    expect(() => FinancialYearSchema.parse('FY 24/25')).toThrow();
    expect(() => FinancialYearSchema.parse('FY-2024/25')).toThrow();
  });
});

describe('SectorSchema', () => {
  it('accepts all valid sectors', () => {
    const sectors = ['health', 'education', 'infrastructure', 'agriculture', 'water', 'roads', 'trade', 'youth', 'environment', 'other'];
    sectors.forEach(s => expect(SectorSchema.parse(s)).toBe(s));
  });

  it('rejects invalid sectors', () => {
    expect(() => SectorSchema.parse('mining')).toThrow();
    expect(() => SectorSchema.parse('defense')).toThrow();
  });
});

describe('TipCategorySchema', () => {
  it('accepts all valid categories', () => {
    const cats = ['corruption', 'embezzlement', 'procurement_irregularity', 'nepotism', 'misappropriation', 'fraud', 'bribery', 'conflict_of_interest', 'undue_influence', 'other'];
    cats.forEach(c => expect(TipCategorySchema.parse(c)).toBe(c));
  });

  it('rejects invalid categories', () => {
    expect(() => TipCategorySchema.parse('spam')).toThrow();
    expect(() => TipCategorySchema.parse('')).toThrow();
  });
});

describe('StoryCreateSchema', () => {
  const validStory = {
    countyName: 'Nairobi',
    sector: 'health',
    title: 'Poor service at county hospital',
    experience: 'I visited the county hospital and waited for 6 hours without being attended to. The staff were unresponsive and the facilities were in poor condition.',
    rating: 2,
    anonymous: true,
  };

  it('accepts a valid story with all fields', () => {
    const result = StoryCreateSchema.parse(validStory);
    expect(result.countyName).toBe('Nairobi');
    expect(result.rating).toBe(2);
    expect(result.anonymous).toBe(true);
  });

  it('applies defaults for missing optional fields', () => {
    const { rating, anonymous, ...withoutDefaults } = validStory;
    const result = StoryCreateSchema.parse(withoutDefaults);
    expect(result.rating).toBe(3);
    expect(result.anonymous).toBe(true);
  });

  it('rejects story with too-short title', () => {
    expect(() => StoryCreateSchema.parse({ ...validStory, title: 'Hi' })).toThrow();
  });

  it('rejects story with too-short experience', () => {
    expect(() => StoryCreateSchema.parse({ ...validStory, experience: 'Too short' })).toThrow();
  });

  it('rejects story with rating out of range', () => {
    expect(() => StoryCreateSchema.parse({ ...validStory, rating: 0 })).toThrow();
    expect(() => StoryCreateSchema.parse({ ...validStory, rating: 6 })).toThrow();
  });

  it('rejects story exceeding max experience length', () => {
    expect(() => StoryCreateSchema.parse({ ...validStory, experience: 'A'.repeat(RATE_LIMITS.MAX_STORY_LENGTH + 1) })).toThrow();
  });

  it('rejects story with missing required fields', () => {
    expect(() => StoryCreateSchema.parse({ title: 'Test' })).toThrow();
  });

  it('trims whitespace from string fields', () => {
    const result = StoryCreateSchema.parse({ ...validStory, countyName: '  Nairobi  ', title: '  Test title  ' });
    expect(result.countyName).toBe('Nairobi');
    expect(result.title).toBe('Test title');
  });
});

describe('TipCreateSchema', () => {
  const validTip = {
    countyName: 'Mombasa',
    category: 'corruption',
    description: 'I witnessed irregular procurement practices in the county roads department where contracts were awarded without competitive bidding.',
    anonymous: true,
  };

  it('accepts a valid tip', () => {
    const result = TipCreateSchema.parse(validTip);
    expect(result.countyName).toBe('Mombasa');
    expect(result.category).toBe('corruption');
  });

  it('rejects tip with too-short description', () => {
    expect(() => TipCreateSchema.parse({ ...validTip, description: 'Too short info' })).toThrow();
  });

  it('rejects tip exceeding max description length', () => {
    expect(() => TipCreateSchema.parse({ ...validTip, description: 'A'.repeat(RATE_LIMITS.MAX_TIP_LENGTH + 1) })).toThrow();
  });

  it('rejects invalid category', () => {
    expect(() => TipCreateSchema.parse({ ...validTip, category: 'noise_complaint' })).toThrow();
  });

  it('applies default anonymous=true', () => {
    const { anonymous, ...rest } = validTip;
    const result = TipCreateSchema.parse(rest);
    expect(result.anonymous).toBe(true);
  });
});

describe('CountiesQuerySchema', () => {
  it('accepts empty query (all defaults)', () => {
    const result = CountiesQuerySchema.parse({});
    expect(result.year).toBe('FY 2024/25');
    expect(result.code).toBeUndefined();
  });

  it('accepts valid filters', () => {
    const result = CountiesQuerySchema.parse({
      code: '001',
      region: 'Coast',
      coalition: 'Kenya Kwanza Alliance',
      year: 'FY 2023/24',
    });
    expect(result.code).toBe('001');
    expect(result.region).toBe('Coast');
  });

  it('rejects invalid region', () => {
    expect(() => CountiesQuerySchema.parse({ region: 'Sahara' })).toThrow();
  });

  it('rejects invalid coalition', () => {
    expect(() => CountiesQuerySchema.parse({ coalition: 'ANC' })).toThrow();
  });
});

describe('WeatherQuerySchema', () => {
  it('accepts valid coordinates for Kenya', () => {
    const result = WeatherQuerySchema.parse({ lat: '-1.2864', lng: '36.8172', location: 'Nairobi' });
    expect(result.lat).toBeCloseTo(-1.2864);
    expect(result.lng).toBeCloseTo(36.8172);
  });

  it('applies defaults when empty', () => {
    const result = WeatherQuerySchema.parse({});
    expect(result.lat).toBe(-1.2864);
    expect(result.lng).toBe(36.8172);
    expect(result.location).toBe('Nairobi');
  });

  it('rejects out-of-range coordinates', () => {
    expect(() => WeatherQuerySchema.parse({ lat: '-10' })).toThrow();
    expect(() => WeatherQuerySchema.parse({ lng: '50' })).toThrow();
  });
});

describe('MzalendoQuerySchema', () => {
  it('accepts gender filter', () => {
    expect(MzalendoQuerySchema.parse({ gender: 'female' }).gender).toBe('female');
    expect(MzalendoQuerySchema.parse({ gender: 'all' }).gender).toBe('all');
  });

  it('rejects invalid gender', () => {
    expect(() => MzalendoQuerySchema.parse({ gender: 'non-binary' })).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// §3.1 — Error Response Tests
// ═══════════════════════════════════════════════════════════════════

describe('Error Responses', () => {
  it('badRequest returns 400 with field and message', () => {
    const res = badRequest('title', 'Title is required');
    expect(res.status).toBe(400);
    const json = res.json();
    return json.then(data => {
      expect(data.error.code).toBe('BAD_REQUEST');
      expect(data.error.field).toBe('title');
      expect(data.error.action).toBeDefined();
      expect(data.error.timestamp).toBeDefined();
    });
  });

  it('unauthorized returns 401', () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    return res.json().then(data => {
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  it('forbidden returns 403', () => {
    const res = forbidden();
    expect(res.status).toBe(403);
  });

  it('notFound returns 404 with resource name', () => {
    const res = notFound('County', '999');
    expect(res.status).toBe(404);
    return res.json().then(data => {
      expect(data.error.message).toContain('County');
      expect(data.error.message).toContain('999');
    });
  });

  it('conflict returns 409', () => {
    const res = conflict('Story', 'Duplicate ID');
    expect(res.status).toBe(409);
  });

  it('tooManyRequests returns 429 with retry info', () => {
    const res = tooManyRequests(3600, '10 posts/hour');
    expect(res.status).toBe(429);
    return res.json().then(data => {
      expect(data.error.code).toBe('RATE_LIMITED');
      expect(data.error.message).toContain('3600');
    });
  });

  it('internalError returns 500 without leaking internals', () => {
    const res = internalError('database query');
    expect(res.status).toBe(500);
    return res.json().then(data => {
      expect(data.error.code).toBe('INTERNAL_ERROR');
      // Must NOT contain stack traces or internal details
      expect(data.error.message).not.toContain('stack');
      expect(data.error.message).not.toContain('at ');
    });
  });

  it('all errors include timestamp', async () => {
    const errors = [badRequest('x', 'y'), unauthorized(), forbidden(), notFound('T'), conflict('T', 'm'), tooManyRequests(60, 'l'), internalError('op')];
    for (const res of errors) {
      const data = await res.json();
      expect(data.error.timestamp).toBeDefined();
      expect(typeof data.error.timestamp).toBe('string');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// §5.1 — Logger Tests
// ═══════════════════════════════════════════════════════════════════

describe('Structured Logger', () => {
  it('creates route-scoped logger', () => {
    const logger = createLogger('/api/test');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');
  });

  it('logger.info produces structured JSON output', () => {
    const logs: string[] = [];
    const origInfo = console.info;
    console.info = (msg: string) => logs.push(msg);

    const logger = createLogger('/api/test');
    logger.info('Test message', { key: 'value' });

    console.info = origInfo;
    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.level).toBe('info');
    expect(parsed.route).toBe('/api/test');
    expect(parsed.message).toBe('Test message');
    expect(parsed.context.key).toBe('value');
    expect(parsed.timestamp).toBeDefined();
  });

  it('redacts sensitive fields from context', () => {
    const logs: string[] = [];
    const origInfo = console.info;
    console.info = (msg: string) => logs.push(msg);

    const logger = createLogger('/api/test');
    logger.info('Login attempt', {
      password: 'secret123',
      token: 'Bearer xyz',
      description: 'Sensitive whistleblower content',
      normalField: 'visible',
    });

    console.info = origInfo;
    const parsed = JSON.parse(logs[0]);
    expect(parsed.context.password).toBe('[REDACTED]');
    expect(parsed.context.token).toBe('[REDACTED]');
    expect(parsed.context.description).toBe('[REDACTED]');
    expect(parsed.context.normalField).toBe('visible');
  });

  it('logger.error includes durationMs when provided', () => {
    const logs: string[] = [];
    const origError = console.error;
    console.error = (msg: string) => logs.push(msg);

    const logger = createLogger('/api/test');
    logger.error('Operation failed', { key: 'value' }, 42);

    console.error = origError;
    const parsed = JSON.parse(logs[0]);
    expect(parsed.level).toBe('error');
    expect(parsed.durationMs).toBe(42);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Rate Limit Constants Tests
// ═══════════════════════════════════════════════════════════════════

describe('RATE_LIMITS constants', () => {
  it('defines all required rate limit constants', () => {
    expect(RATE_LIMITS.STORIES_POST).toBeDefined();
    expect(RATE_LIMITS.TIPS_POST).toBeDefined();
    expect(RATE_LIMITS.PUBLIC_READ).toBeDefined();
    expect(RATE_LIMITS.MAX_STORY_LENGTH).toBeDefined();
    expect(RATE_LIMITS.MAX_TIP_LENGTH).toBeDefined();
    expect(RATE_LIMITS.MAX_STORIES_STORED).toBeDefined();
    expect(RATE_LIMITS.MAX_TIPS_STORED).toBeDefined();
  });

  it('tips allow higher rate than stories (whistleblower priority)', () => {
    expect(RATE_LIMITS.TIPS_POST).toBeGreaterThan(RATE_LIMITS.STORIES_POST);
  });

  it('storage limits are reasonable', () => {
    expect(RATE_LIMITS.MAX_STORIES_STORED).toBeGreaterThan(0);
    expect(RATE_LIMITS.MAX_TIPS_STORED).toBeGreaterThan(0);
    expect(RATE_LIMITS.MAX_TIP_LENGTH).toBeGreaterThan(RATE_LIMITS.MAX_STORY_LENGTH);
  });
});
