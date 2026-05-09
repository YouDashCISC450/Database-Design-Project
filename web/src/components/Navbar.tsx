"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { href: "/restaurants", label: "Restaurants" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { users, currentUser, setCurrentUserId, loading } = useCurrentUser();
  const { itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          YouDash
        </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors flex items-center gap-1 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {link.label}
                {link.href === "/cart" && itemCount > 0 && (
                  <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User picker */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">Signed in as:</span>
            <select
              value={currentUser?.userId ?? 1}
              onChange={(e) => setCurrentUserId(Number(e.target.value))}
              disabled={loading}
              className="border border-primary-100 rounded-md px-3 py-1.5 bg-white text-sm text-gray-700 cursor-pointer hover:border-primary transition-colors"
            >
              {loading ? (
                <option>Loading…</option>
              ) : (
                users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* YouPass badge */}
          {currentUser?.youPassStatus && (
            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
              YouPass ✓
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
