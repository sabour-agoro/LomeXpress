"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  itemsCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  isHydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "lomexpress.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (error) {
      console.warn("Cart hydration failed", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const nextQty = Math.min(existing.stock || existing.quantity + quantity, existing.quantity + quantity);
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { ...item, quantity: Math.max(1, quantity) }];
    });
  }, []);

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>((id, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, Math.min(item.stock || quantity, quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback<CartContextValue["removeItem"]>((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, total, itemsCount, addItem, updateQuantity, removeItem, clear, isHydrated };
  }, [items, addItem, updateQuantity, removeItem, clear, isHydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
