import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const rawUserId = searchParams.get('userId');
  const userId = Number(rawUserId);

  if (!rawUserId || !Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT
        o."Order_id",
        o."Restaurant_id",
        o."User_id",
        o."Order_date",
        o."Order_details",
        o."Order_status",
        o."Order_price",
        r."Name" AS restaurant_name
      FROM "Orders" o
      LEFT JOIN "Restaurants" r ON o."Restaurant_id" = r."Restaurant_id"
      WHERE o."Order_id" = ${id} AND o."User_id" = ${userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      order: {
        orderId: row.Order_id,
        restaurantId: row.Restaurant_id,
        userId: row.User_id,
        orderDate: row.Order_date,
        orderDetails: row.Order_details,
        orderStatus: row.Order_status,
        orderPrice: row.Order_price,
        restaurantName: row.restaurant_name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
