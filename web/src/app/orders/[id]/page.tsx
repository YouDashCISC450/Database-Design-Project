"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/contexts/UserContext";

type OrderDetail = {
  orderId: number;
  restaurantId: number;
  userId: number;
  orderDate: string;
  orderDetails: string | null;
  orderStatus: string;
  orderPrice: number | string;
  restaurantName: string | null;
};

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, loading: userLoading } = useCurrentUser();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !currentUser) return;

    setLoading(true);
    setNotFound(false);

    fetch(`/api/orders/${id}?userId=${currentUser.userId}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error("Failed to load order");
        return res.json();
      })
      .then((data) => {
        if (data) setOrder(data.order);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, currentUser, userLoading]);

  if (userLoading || !currentUser || loading) {
    return (
      <main className="min-h-screen bg-purple-50 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="min-h-screen bg-purple-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-purple-900">
            Order not found
          </h1>
          <p className="mt-2 text-gray-600">
            We could not find this order.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <div className="mb-6 rounded-lg bg-purple-100 p-4 text-purple-900">
          <h1 className="text-3xl font-bold">Order placed</h1>
          <p className="mt-1 text-sm">
            Your pickup order has been submitted successfully.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Order</p>
            <p className="text-xl font-semibold text-purple-900">
              #{order.orderId}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Restaurant</p>
            <p className="font-medium">
              {order.restaurantName || 'Unknown restaurant'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              {order.orderStatus}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Items</p>
            <p className="text-gray-700">
              {order.orderDetails || 'No item details available'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-purple-900">
              ${Number(order.orderPrice).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-gray-700">
              {new Date(order.orderDate).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}