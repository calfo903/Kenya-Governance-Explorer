import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '-1.2864');
  const lng = parseFloat(searchParams.get('lng') || '36.8172');
  const location = searchParams.get('location') || 'Nairobi';

  // Simulate weather based on location
  // Use lat/lng to determine general conditions
  const isCoastal = lat < -3.5;
  const isNorthern = lat < -0.5 && lng > 37;

  const conditions = isCoastal
    ? [{ temp: 29, cond: 'Partly Cloudy', hum: 78, wind: 15 }]
    : isNorthern
    ? [{ temp: 34, cond: 'Hot & Sunny', hum: 25, wind: 20 }]
    : [{ temp: 23, cond: 'Mostly Cloudy', hum: 55, wind: 10 }];

  const weather = conditions[0];

  return NextResponse.json({
    temperature: weather.temp,
    condition: weather.cond,
    humidity: weather.hum,
    windSpeed: weather.wind,
    location,
    icon: weather.temp > 30 ? 'sun' : weather.temp > 25 ? 'cloud-sun' : 'cloud',
    fetchedAt: new Date().toISOString(),
  });
}
