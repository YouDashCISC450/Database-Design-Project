import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbInfo = await sql`SELECT current_database() as db, current_user as usr, inet_server_addr() as host`;
    const restaurants = await sql`SELECT "Restaurant_id", "Name" FROM "Restaurants" ORDER BY "Restaurant_id"`;
    const count = await sql`SELECT COUNT(*) as count FROM "Restaurants"`;

    return NextResponse.json({
      connection: dbInfo[0],
      restaurantCount: count[0].count,
      restaurants: restaurants,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
