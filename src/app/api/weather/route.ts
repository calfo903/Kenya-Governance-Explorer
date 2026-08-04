/**
 * §2.1 + §5.1 — Weather API with Zod-validated query params and structured logging
 *
 * NOTE: This endpoint returns simulated weather data based on lat/lng.
 * It does NOT connect to a real weather service.
 */

import { NextResponse } from 'next/server';
import { WeatherQuerySchema, validateQuery } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/weather');

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, WeatherQuerySchema);
  if (!parsed.success) return parsed.response;

  const { lat, lng, location } = parsed.data;

  try {
    // Simulated weather based on geographic heuristics
    const isCoastal = lat < -3.5;
    const isNorthern = lat < -0.5 && lng > 37;

    const conditions = isCoastal
      ? { temp: 29, cond: 'Partly Cloudy', hum: 78, wind: 15 }
      : isNorthern
        ? { temp: 34, cond: 'Hot & Sunny', hum: 25, wind: 20 }
        : { temp: 23, cond: 'Mostly Cloudy', hum: 55, wind: 10 };

    const result = {
      temperature: conditions.temp,
      condition: conditions.cond,
      humidity: conditions.hum,
      windSpeed: conditions.wind,
      location,
      icon: conditions.temp > 30 ? 'sun' : conditions.temp > 25 ? 'cloud-sun' : 'cloud',
      fetchedAt: new Date().toISOString(),
      // §7.3 — Explicitly mark as simulated to avoid misleading users
      simulated: true,
      disclaimer: 'This is simulated data for demonstration purposes. Not from a real weather service.',
    };

    log.info('Weather data served', {
      location, lat, lng,
      temperature: conditions.temp,
      simulated: true,
      durationMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err) {
    log.error('Failed to serve weather data', { location, lat, lng }, Date.now() - start);
    return internalError('fetch weather');
  }
}
