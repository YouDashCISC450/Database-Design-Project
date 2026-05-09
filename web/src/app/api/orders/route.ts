import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const orderSchema = z.object({
  userId: z.number(),
  restaurantId: z.number(),
  items: z
    .array(
      z.object({
        foodItemId: z.number(),
        quantity: z.number().min(1),
        itemPrice: z.number(),
        itemName: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { userId, restaurantId, items } = result.data;

  try {
    // Compute total
    const total = items.reduce(
      (sum, item) => sum + item.itemPrice * item.quantity,
      0
    );

    // Build order details string
    const orderDetails = items
      .map((item) => {
        const name = item.itemName ?? `Item #${item.foodItemId}`;
        return `${name} x${item.quantity}`;
      })
      .join('; ');

    // Get next Order_id
    const orderIdRows = await sql`
      SELECT COALESCE(MAX("Order_id"), 0) + 1 AS next_id FROM "Orders"
    `;
    const nextOrderId = Number(orderIdRows[0].next_id);

    // Today's date in YYYY-MM-DD
    const todayISO = new Date().toISOString().split('T')[0];

    // Insert order
    await sql`
      INSERT INTO "Orders"
        ("Order_id", "Restaurant_id", "User_id", "Order_date",
         "Order_details", "Order_status", "Order_price")
      VALUES (${nextOrderId}, ${restaurantId}, ${userId},
              ${todayISO}, ${orderDetails}, 'Placed', ${total})
    `;

    // Insert one OrderItem row using the first item
    // (order_item_id == Order_id due to schema constraint)
    const first = items[0];
    await sql`
      INSERT INTO "OrderItem"
        ("order_item_id", "Order_id", "Food_Item_id",
         "quantity", "item_price")
      VALUES (${nextOrderId}, ${nextOrderId}, ${first.foodItemId},
              ${first.quantity}, ${first.itemPrice})
    `;

    return NextResponse.json({ orderId: nextOrderId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
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
        o."Order_date",
        o."Order_status",
        o."Order_price",
        o."Order_details",
        r."Name" AS restaurant_name,
        o."User_id"
      FROM "Orders" o
      LEFT JOIN "Restaurants" r ON o."Restaurant_id" = r."Restaurant_id"
      WHERE o."User_id" = ${userId}
      ORDER BY o."Order_date" DESC, o."Order_id" DESC
    `;

    return NextResponse.json(rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}