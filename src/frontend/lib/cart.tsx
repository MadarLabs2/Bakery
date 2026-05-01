import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/backend/db/client";
import { useAuth } from "./auth";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name_en: string;
    name_he: string;
    name_ar: string;
    price: number;
    image_url: string | null;
  };
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<CartCtx | undefined>(undefined);

async function getOrCreateCartId(userId: string) {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .maybeSingle();

  if (inserted?.id) return inserted.id;

  // Trigger may have created the cart, or a concurrent insert won the unique(user_id) race.
  const { data: retry } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (retry?.id) return retry.id;

  throw new Error(insertError?.message ?? "Could not load or create your cart. Try signing in again.");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const cartId = await getOrCreateCartId(user.id);
    const { data } = await supabase
      .from("cart_items")
      .select(
        "id, product_id, quantity, product:products(id, name_en, name_he, name_ar, price, image_url)",
      )
      .eq("cart_id", cartId);
    setItems((data as any) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart: CartCtx["addToCart"] = async (productId, qty = 1) => {
    if (!user) throw new Error("Not authenticated");
    const cartId = await getOrCreateCartId(user.id);
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + qty })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, product_id: productId, quantity: qty });
    }
    await refresh();
  };

  const updateQty: CartCtx["updateQty"] = async (itemId, qty) => {
    if (qty <= 0) return remove(itemId);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
    await refresh();
  };

  const remove: CartCtx["remove"] = async (itemId) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    await refresh();
  };

  const clear: CartCtx["clear"] = async () => {
    if (!user) return;
    const cartId = await getOrCreateCartId(user.id);
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
    await refresh();
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * Number(i.product?.price ?? 0), 0);

  return (
    <Ctx.Provider
      value={{ items, count, subtotal, loading, addToCart, updateQty, remove, clear, refresh }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
