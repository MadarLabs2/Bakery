import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/frontend/components/ui/alert-dialog";
import { AdminBackNav } from "@/frontend/components/admin/AdminBackNav";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";
import { useI18n, pickName } from "@/frontend/lib/i18n";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

const empty = {
  name_en: "",
  name_he: "",
  name_ar: "",
  description: "",
  image_url: "",
};

function categoryToForm(c: Record<string, unknown>) {
  const legacy = typeof c.name === "string" ? c.name : "";
  return {
    ...c,
    name_en:
      typeof c.name_en === "string" && c.name_en.trim() ? (c.name_en as string) : legacy,
    name_he:
      typeof c.name_he === "string" && c.name_he.trim() ? (c.name_he as string) : legacy,
    name_ar:
      typeof c.name_ar === "string" && c.name_ar.trim() ? (c.name_ar as string) : legacy,
  };
}

function categoryCardSubtitle(c: {
  name?: string | null;
  name_en?: string | null;
  name_he?: string | null;
  name_ar?: string | null;
}) {
  const legacy = (c.name ?? "").trim();
  const parts = [
    (c.name_he ?? "").trim() || legacy,
    (c.name_en ?? "").trim() || legacy,
    (c.name_ar ?? "").trim() || legacy,
  ];
  return [...new Set(parts.filter(Boolean))].join(" / ");
}

function categoryUpperLine(c: { name?: string | null; name_en?: string | null }) {
  const raw = ((c.name_en ?? "").trim() || (c.name ?? "").trim()).toUpperCase();
  return raw || "—";
}

function AdminCategories() {
  const { t, lang } = useI18n();
  const [cats, setCats] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<any>(null);

  const load = () =>
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCats(data ?? []));

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `categories/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing((prev: any) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
    toast.success(t("imageUploaded"));
  };

  const save = async () => {
    const name_en = editing.name_en?.trim() || null;
    const name_he = editing.name_he?.trim() || null;
    const name_ar = editing.name_ar?.trim() || null;
    if (!name_en && !name_he && !name_ar) {
      toast.error(t("adminCategoryNamesRequired"));
      return;
    }

    const name = name_he?.trim() || name_en?.trim() || name_ar?.trim() || "—";

    const payload = {
      name,
      name_en,
      name_he,
      name_ar,
      description: editing.description?.trim() || null,
      image_url: editing.image_url?.trim() || null,
    };

    const op = editing.id
      ? supabase.from("categories").update(payload).eq("id", editing.id)
      : supabase.from("categories").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
    setOpen(false);
    setEditing(empty);
    load();
  };

  const performDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("deleted"));
      load();
    }
  };

  const filteredCats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter((c) => {
      const blob = [c.name, c.name_en, c.name_he, c.name_ar, c.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [cats, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <AdminBackNav />
      <h1 id="admin-categories-top" className="scroll-mt-24 font-display text-2xl font-bold md:text-3xl">
        {t("categories")}
      </h1>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditing(empty);
            setUploading(false);
          }
        }}
      >
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)] lg:items-start lg:gap-8">
          <aside className="shrink-0 space-y-3 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => setEditing(empty)}>
                <Plus className="h-4 w-4" /> {t("adminBtnNewCategory")}
              </Button>
            </DialogTrigger>
          </aside>

          <section className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("adminSearchCategories")}
              className="w-full max-w-full sm:max-w-md"
              aria-label={t("adminSearchCategories")}
            />

            <div className="flex flex-col gap-3">
              {filteredCats.length === 0 && (
                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  {cats.length === 0 ? t("noCategories") : t("adminNoMatchingCategoriesSearch")}
                </p>
              )}
              {filteredCats.map((c) => {
                const imgSrc = c.image_url ? resolveImage(c.image_url) : null;
                return (
                  <article
                    key={c.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                        <button
                          type="button"
                          className="relative mt-1 h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted ring-offset-background transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-24 sm:w-24"
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
                            {categoryUpperLine(c)}
                          </p>
                          <p className="break-words font-mono text-[11px] text-muted-foreground">
                            {t("adminProductIdLabel")}: {c.id}
                          </p>
                          <p className="text-base font-semibold leading-snug text-foreground sm:text-lg md:font-display">
                            {categoryCardSubtitle(c)}
                          </p>
                          {c.description?.trim() ? (
                            <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 flex-row gap-2 sm:w-auto sm:justify-end">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 border-primary/40 sm:flex-initial sm:min-w-[7rem]"
                          onClick={() => {
                            setEditing(categoryToForm(c));
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          {t("adminEditAction")}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 gap-2 sm:flex-initial sm:min-w-[7rem]"
                          onClick={() => setPendingDelete(c)}
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
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

        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing.id ? t("adminDialogCategoryEditTitle") : t("adminDialogCategoryNewTitle")}
            </DialogTitle>
            <DialogDescription className="sr-only">{t("adminDialogCategoryFormSr")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 [&_label]:text-sm [&_label]:!font-semibold [&_label]:text-foreground">
            <div className="space-y-2">
              <Label htmlFor="cat-name-en">{t("adminCategoryLangEn")}</Label>
              <Input
                id="cat-name-en"
                placeholder="English"
                value={editing.name_en ?? ""}
                onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-name-he">{t("adminCategoryLangHe")}</Label>
              <Input
                id="cat-name-he"
                placeholder="עברית"
                value={editing.name_he ?? ""}
                onChange={(e) => setEditing({ ...editing, name_he: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-name-ar">{t("adminCategoryLangAr")}</Label>
              <Input
                id="cat-name-ar"
                placeholder="العربية"
                dir="rtl"
                value={editing.name_ar ?? ""}
                onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="cat-desc">{t("adminThDescription")}</Label>
              <Textarea
                id="cat-desc"
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cat-image-url">{t("adminLabelImage")}</Label>
              <Input
                id="cat-image-url"
                type="url"
                value={editing.image_url ?? ""}
                placeholder={t("adminCategoryImageUrlPlaceholder")}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                className="mt-1"
              />
              <p className="mt-2 text-xs text-muted-foreground">{t("adminCategoryImageHint")}</p>
              <Input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                  e.target.value = "";
                }}
                disabled={uploading}
              />
              {uploading && (
                <p className="mt-1 text-xs text-muted-foreground">{t("adminUploading")}</p>
              )}
              {editing.image_url && (
                <div className="mt-3 flex items-start gap-3">
                  <img
                    src={resolveImage(editing.image_url)!}
                    alt=""
                    className="h-24 w-36 rounded-md border object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing({ ...editing, image_url: "" })}
                  >
                    {t("adminRemoveImage")}
                  </Button>
                </div>
              )}
            </div>
            <Button onClick={save} className="w-full" disabled={uploading}>
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

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adminDeleteCategoryTitle")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-muted-foreground">
                <p>{t("adminDeleteCategoryBody")}</p>
                {pendingDelete && (
                  <p className="font-medium text-foreground">{pickName(pendingDelete, lang)}</p>
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
