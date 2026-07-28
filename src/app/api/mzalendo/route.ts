import { NextResponse } from 'next/server';
import { mzalendoMembers } from '@/data/mzalendo-members';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender');
  const county = searchParams.get('county');
  const coalition = searchParams.get('coalition');

  let filtered = [...mzalendoMembers];

  if (gender && gender !== 'all') {
    filtered = filtered.filter(m => m.gender === gender);
  }
  if (county) {
    filtered = filtered.filter(m => m.county.toLowerCase().includes(county.toLowerCase()));
  }
  if (coalition && coalition !== 'all') {
    filtered = filtered.filter(m => m.coalition === coalition);
  }

  return NextResponse.json({ members: filtered, total: filtered.length });
}
