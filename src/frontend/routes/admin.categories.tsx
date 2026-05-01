import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

const empty = { name: "", description: "", image_url: "" };

function AdminCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);

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
    toast.success("Image uploaded");
  };

  const save = async () => {
    const payload = {
      name: editing.name,
      description: editing.description || null,
      image_url: editing.image_url || null,
    };
    const op = editing.id
      ? supabase.from("categories").update(payload).eq("id", editing.id)
      : supabase.from("categories").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    setEditing(empty);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
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
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(empty)}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit" : "New"} category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Image</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Choose a file from your computer (JPEG, PNG, WebP). It is stored in your Supabase
                  bucket and the public link is saved on this category.
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                    e.target.value = "";
                  }}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-xs text-muted-foreground mt-1">Uploading…</p>
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
                      Remove image
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={save} className="w-full" disabled={uploading}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 w-20">Image</th>
              <th>Name</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">
                  <div className="h-12 w-16 overflow-hidden rounded border bg-muted">
                    {c.image_url ? (
                      <img
                        src={resolveImage(c.image_url)!}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground px-1 text-center">
                        None
                      </div>
                    )}
                  </div>
                </td>
                <td className="font-medium">{c.name}</td>
                <td className="max-w-md truncate text-muted-foreground">{c.description ?? "—"}</td>
                <td className="text-right pr-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(c);
                      setOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
