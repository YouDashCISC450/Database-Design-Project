"use client";

import { useEffect, useState } from "react";

type HealthResponse =
  | { status: "ok"; restaurantCount: number }
  | { status: "error"; message: string };

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) =>
        setHealth({ status: "error", message: (err as Error).message })
      );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {health === null ? (
          <p className="text-gray-500 text-lg animate-pulse">
            Checking database…
          </p>
        ) : health.status === "ok" ? (
          <div className="text-primary">
            <h1 className="text-5xl font-bold mb-3">YouDash</h1>
            <p className="text-lg mb-1">Database connected ✓</p>
            <p className="text-lg">
              Restaurants in DB:{" "}
              <span className="font-semibold">{health.restaurantCount}</span>
            </p>
          </div>
        ) : (
          <div className="text-red-600">
            <h1 className="text-3xl font-bold mb-3">Connection Error</h1>
            <p className="text-sm break-words">{health.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
