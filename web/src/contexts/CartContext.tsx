"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUser } from "@/contexts/UserContext";

function cartKey(userId: number) {
  return `youdash.cart.${userId}`;
}

export type CartItem = {
  foodItemId: number;
  itemName: string;
  price: number;
  quantity: number;
};

export type Cart = {
  restaurantId: number | null;
  restaurantName: string | null;
  items: CartItem[];
};

const EMPTY_CART: Cart = {
  restaurantId: null,
  restaurantName: null,
  items: [],
};

type CartContextValue = {
  cart: Cart;
  itemCount: number;
  subtotal: number;
  addItem: (
    item: { foodItemId: number; itemName: string; price: number },
    restaurantId: number,
    restaurantName: string
  ) => void;
  removeItem: (foodItemId: number) => void;
  updateQuantity: (foodItemId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue>({
  cart: EMPTY_CART,
  itemCount: 0,
  subtotal: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

function persistCart(userId: number, cart: Cart) {
  try {
    localStorage.setItem(cartKey(userId), JSON.stringify(cart));
  } catch {
    // localStorage unavailable
  }
}

function loadCart(userId: number): Cart {
  try {
    const stored = localStorage.getItem(cartKey(userId));
    if (stored) {
      const parsed = JSON.parse(stored) as Cart;
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return EMPTY_CART;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useCurrentUser();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const userIdRef = useRef<number | null>(null);

  const currentUserId = currentUser?.userId ?? null;

  // When currentUser changes, load that user's cart from localStorage
  useEffect(() => {
    if (currentUserId === null) {
      setCart(EMPTY_CART);
      userIdRef.current = null;
      return;
    }

    userIdRef.current = currentUserId;
    setCart(loadCart(currentUserId));
  }, [currentUserId]);

  // Persist whenever cart changes (only when we have a user)
  useEffect(() => {
    if (userIdRef.current !== null) {
      persistCart(userIdRef.current, cart);
    }
  }, [cart]);

  const addItem = useCallback(
    (
      item: { foodItemId: number; itemName: string; price: number },
      restaurantId: number,
      restaurantName: string
    ) => {
      setCart((prev) => {
        // Different restaurant — ask to switch
        if (
          prev.restaurantId !== null &&
          prev.restaurantId !== restaurantId
        ) {
          const ok = window.confirm(
            "Switching restaurants will clear your cart. Continue?"
          );
          if (!ok) return prev;

          // Clear and start fresh with new item
          return {
            restaurantId,
            restaurantName,
            items: [{ ...item, quantity: 1 }],
          };
        }

        // Same restaurant (or empty cart) — add/increment
        const existing = prev.items.find(
          (i) => i.foodItemId === item.foodItemId
        );
        if (existing) {
          return {
            ...prev,
            restaurantId,
            restaurantName,
            items: prev.items.map((i) =>
              i.foodItemId === item.foodItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          };
        }

        return {
          ...prev,
          restaurantId,
          restaurantName,
          items: [...prev.items, { ...item, quantity: 1 }],
        };
      });
    },
    []
  );

  const removeItem = useCallback((foodItemId: number) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.foodItemId !== foodItemId);
      if (newItems.length === 0) return EMPTY_CART;
      return { ...prev, items: newItems };
    });
  }, []);

  const updateQuantity = useCallback(
    (foodItemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(foodItemId);
        return;
      }
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.foodItemId === foodItemId ? { ...i, quantity } : i
        ),
      }));
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, i) => sum + i.quantity, 0),
    [cart.items]
  );

  const subtotal = useMemo(
    () => cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart.items]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
