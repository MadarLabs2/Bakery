import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/backend/db/client";
import { useAuth } from "./auth";

/** Columns safe for customer UI (excludes internal stock_quantity). */
const PRODUCT_EMBED =
  "id, name, description, price, image_url, is_best_seller, is_available" as const;

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_best_seller: boolean;
    is_available: boolean;
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

async function getOrCreateActiveCartId(userId: string) {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("carts")
    .insert({ user_id: userId, status: "active" })
    .select("id")
    .maybeSingle();

  if (inserted?.id) return inserted.id;

  const { data: retry } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (retry?.id) return retry.id;

  throw new Error(insertError?.message ?? "Could not load or create your cart. Try signing in again.");
}

/** After a successful order: empty cart, archive it, open a new active cart. */
export async function rotateCartAfterOrder(userId: string) {
  const cartId = await getOrCreateActiveCartId(userId);
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  await supabase.from("carts").update({ status: "ordered" }).eq("id", cartId);
  const { error } = await supabase.from("carts").insert({ user_id: userId, status: "active" });
  if (error) throw new Error(error.message);
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
    const cartId = await getOrCreateActiveCartId(user.id);
    const { data } = await supabase
      .from("cart_items")
      .select(`id, product_id, quantity, product:products(${PRODUCT_EMBED})`)
      .eq("cart_id", cartId);
    setItems((data as CartItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart: CartCtx["addToCart"] = async (productId, qty = 1) => {
    if (!user) throw new Error("Not authenticated");
    const cartId = await getOrCreateActiveCartId(user.id);
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
    const cartId = await getOrCreateActiveCartId(user.id);
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
