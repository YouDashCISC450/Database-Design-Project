import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await sql`SELECT COUNT(*) AS restaurant_count FROM "Restaurants"`;
    const restaurantCount = Number(rows[0].restaurant_count);

    return NextResponse.json({ status: 'ok', restaurantCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
