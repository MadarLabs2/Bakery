import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Star, StarOff, Pencil, ChevronUp } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { AdminBackNav } from "@/frontend/components/admin/AdminBackNav";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/frontend/components/ui/alert-dialog";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { cn } from "@/frontend/lib/utils";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const empty = {
  category_id: "",
  name: "",
  description: "",
  ingredients: "",
  allergens: "",
  price: 0,
  image_url: "",
  is_best_seller: false,
  is_available: true,
};

function AdminProducts() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilterId, setCategoryFilterId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<any>(null);

  const load = () => {
    supabase
      .from("products")
      .select("*, category:categories(name, name_en, name_he, name_ar)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts(data ?? []));
  };
  useEffect(() => {
    load();
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const save = async () => {
    const payload = {
      name: editing.name,
      description: editing.description || null,
      ingredients: editing.ingredients || null,
      allergens: editing.allergens || null,
      price: Number(editing.price),
      image_url: editing.image_url || null,
      category_id: editing.category_id || null,
      is_best_seller: !!editing.is_best_seller,
      is_available: !!editing.is_available,
      stock_quantity:
        editing.stock_quantity === "" || editing.stock_quantity == null
          ? null
          : Number(editing.stock_quantity),
    };
    if (editing.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success(t("saved"));
    setOpen(false);
    setEditing(empty);
    load();
  };

  const performDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("deleted"));
      load();
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (categoryFilterId) {
      list = list.filter((p) => p.category_id === categoryFilterId);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const cat = [
        p.category?.name,
        p.category?.name_en,
        p.category?.name_he,
        p.category?.name_ar,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        String(p.name).toLowerCase().includes(q) ||
        cat.includes(q) ||
        String(p.id).toLowerCase().includes(q) ||
        String(p.price).includes(q)
      );
    });
  }, [products, search, categoryFilterId]);

  const emptyListMessage = () => {
    if (products.length === 0) return t("noProducts");
    const hasSearch = search.trim().length > 0;
    const hasCategory = categoryFilterId != null;
    if (hasSearch && hasCategory) return t("adminNoMatchingFilters");
    if (hasSearch) return t("adminNoMatchingProducts");
    if (hasCategory) return t("adminNoProductsInCategory");
    return t("noProducts");
  };

  const scrollToTop = () => {
    document.getElementById("admin-products-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleBest = async (p: any) => {
    await supabase.from("products").update({ is_best_seller: !p.is_best_seller }).eq("id", p.id);
    load();
  };

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
    setUploading(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <AdminBackNav />
      <h1 id="admin-products-top" tabIndex={-1} className="scroll-mt-24 font-display text-2xl font-bold outline-none md:text-3xl">
        {t("products")}
      </h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)] lg:items-start lg:gap-8">
          <aside className="shrink-0 space-y-3 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => setEditing(empty)}>
                <Plus className="h-4 w-4" /> {t("adminBtnNewProduct")}
              </Button>
            </DialogTrigger>
          </aside>

          <section className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchProducts")}
              className="w-full max-w-full sm:max-w-md"
              aria-label={t("searchProducts")}
            />

            <div className="w-full max-w-full space-y-2 sm:max-w-md">
              <Label htmlFor="admin-product-category-filter" className="text-muted-foreground">
                {t("adminFilterByCategory")}
              </Label>
              <Select
                value={categoryFilterId ?? "all"}
                onValueChange={(v) => setCategoryFilterId(v === "all" ? null : v)}
              >
                <SelectTrigger id="admin-product-category-filter" className="w-full">
                  <SelectValue placeholder={t("adminAllCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminAllCategories")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {pickName(c, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              {filteredProducts.length === 0 && (
                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  {emptyListMessage()}
                </p>
              )}
              {filteredProducts.map((p) => {
                const imgSrc = p.image_url ? resolveImage(p.image_url) : null;
                return (
                  <article
                    key={p.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                        <button
                          type="button"
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted ring-offset-background transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-24 sm:w-24"
                          onClick={() => imgSrc && setLightboxUrl(imgSrc)}
                          disabled={!imgSrc}
                          aria-label={t("adminExpandImageHint")}
                        >
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                              {t("adminThImage")}
                            </span>
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1 text-start">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {p.category ? pickName(p.category, lang) : "—"}
                          </p>
                          <p className="break-all font-mono text-[11px] text-muted-foreground">
                            {t("adminProductIdLabel")}: {p.id}
                          </p>
                          <p className="font-display text-base font-semibold leading-snug sm:text-lg">
                            {p.name}
                          </p>
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <p className="text-lg font-bold text-primary sm:text-xl">
                              ₪{Number(p.price).toFixed(2)}
                            </p>
                            {p.stock_quantity != null && p.stock_quantity !== "" && (
                              <p className="text-sm text-muted-foreground">
                                {t("adminStockShort")}: {p.stock_quantity}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span
                              className={
                                p.is_available
                                  ? "inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                  : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              }
                            >
                              {p.is_available ? t("adminStatusAvailable") : t("adminStatusHidden")}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleBest(p)}
                              aria-label={t("adminBestSellerLabel")}
                            >
                              {p.is_best_seller ? (
                                <Star className="h-4 w-4 fill-primary text-primary" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 flex-row gap-2 sm:w-auto sm:justify-end">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 border-primary/40 sm:flex-initial sm:min-w-[7rem]"
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          {t("adminEditAction")}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 gap-2 sm:flex-initial sm:min-w-[7rem]"
                          onClick={() => setPendingDelete(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("adminDeleteAction")}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing.id ? t("adminDialogProductEditTitle") : t("adminDialogProductNewTitle")}
              </DialogTitle>
              <DialogDescription className="sr-only">{t("adminDialogProductFormSr")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("adminLabelCategory")}</Label>
                <Select
                  value={editing.category_id ?? ""}
                  onValueChange={(v) => setEditing({ ...editing, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("adminSelectCategoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {pickName(c, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("adminThName")}</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("adminThDescription")}</Label>
                <Textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("ingredients")}</Label>
                <Textarea
                  value={editing.ingredients ?? ""}
                  onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("allergens")}</Label>
                <Textarea
                  value={editing.allergens ?? ""}
                  onChange={(e) => setEditing({ ...editing, allergens: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t("adminLabelPriceNis")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("adminLabelImage")}</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                    disabled={uploading}
                  />
                  {editing.image_url && (
                    <img
                      src={resolveImage(editing.image_url)!}
                      alt=""
                      className="mt-2 h-20 w-20 rounded object-cover"
                    />
                  )}
                </div>
              </div>
              <div>
                <Label>{t("adminLabelStockInternal")}</Label>
                <Input
                  type="number"
                  value={editing.stock_quantity ?? ""}
                  placeholder={t("adminOptionalPlaceholder")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      stock_quantity: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.is_best_seller}
                    onChange={(e) => setEditing({ ...editing, is_best_seller: e.target.checked })}
                  />{" "}
                  {t("adminBestSellerLabel")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.is_available}
                    onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })}
                  />{" "}
                  {t("adminAvailableLabel")}
                </label>
              </div>
              <Button onClick={save} className="w-full">
                {t("adminSave")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      <Dialog open={!!lightboxUrl} onOpenChange={(o) => !o && setLightboxUrl(null)}>
        <DialogContent className="max-h-[90vh] max-w-[min(96vw,56rem)] border-0 bg-transparent p-0 shadow-none sm:rounded-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("adminExpandImageHint")}</DialogTitle>
            <DialogDescription>{t("adminExpandImageHint")}</DialogDescription>
          </DialogHeader>
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className={cn(
          "fixed bottom-6 z-40 size-11 rounded-full border border-border shadow-lg shadow-black/10 transition-[opacity,transform] duration-200 end-6 motion-reduce:transition-none sm:bottom-8 sm:size-12 sm:end-8",
          showBackToTop ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-label={t("adminBackToTop")}
        title={t("adminBackToTop")}
        onClick={scrollToTop}
      >
        <ChevronUp className="size-5" aria-hidden />
      </Button>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adminDeleteProductTitle")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-muted-foreground">
                <p>{t("adminDeleteProductBody")}</p>
                {pendingDelete && (
                  <p className="font-medium text-foreground">{pendingDelete.name}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                const id = pendingDelete?.id;
                setPendingDelete(null);
                if (id) void performDelete(id);
              }}
            >
              {t("adminDeleteAction")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
