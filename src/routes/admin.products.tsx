import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Star, StarOff, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { resolveImage } from "@/lib/images";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const empty = {
  category_id: "", name_en: "", name_he: "", name_ar: "",
  description_en: "", description_he: "", description_ar: "",
  price: 0, image_url: "", is_best_seller: false, is_active: true,
};

function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    supabase.from("products").select("*, category:categories(name_en)").order("created_at", { ascending: false })
      .then(({ data }) => setProducts(data ?? []));
  };
  useEffect(() => {
    load();
    supabase.from("categories").select("*").order("display_order").then(({ data }) => setCategories(data ?? []));
  }, []);

  const save = async () => {
    const payload = { ...editing, price: Number(editing.price) };
    if (!payload.category_id) payload.category_id = null;
    if (editing.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
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
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
    setUploading(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setEditing(empty)}><Plus className="h-4 w-4" /> New product</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "Edit" : "New"} product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={editing.category_id ?? ""} onValueChange={v => setEditing({ ...editing, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label>Name (EN)</Label><Input value={editing.name_en} onChange={e => setEditing({ ...editing, name_en: e.target.value })} /></div>
                <div><Label>שם (HE)</Label><Input value={editing.name_he} onChange={e => setEditing({ ...editing, name_he: e.target.value })} /></div>
                <div><Label>اسم (AR)</Label><Input value={editing.name_ar} onChange={e => setEditing({ ...editing, name_ar: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label>Desc (EN)</Label><Textarea value={editing.description_en ?? ""} onChange={e => setEditing({ ...editing, description_en: e.target.value })} /></div>
                <div><Label>תיאור (HE)</Label><Textarea value={editing.description_he ?? ""} onChange={e => setEditing({ ...editing, description_he: e.target.value })} /></div>
                <div><Label>وصف (AR)</Label><Textarea value={editing.description_ar ?? ""} onChange={e => setEditing({ ...editing, description_ar: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Price (₪)</Label><Input type="number" step="0.01" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} /></div>
                <div>
                  <Label>Image</Label>
                  <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} />
                  {editing.image_url && <img src={resolveImage(editing.image_url)!} alt="" className="mt-2 h-20 w-20 rounded object-cover" />}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_best_seller} onChange={e => setEditing({ ...editing, is_best_seller: e.target.checked })} /> Best seller</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
              </div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3"><div className="h-12 w-12 overflow-hidden rounded bg-secondary">{p.image_url && <img src={resolveImage(p.image_url)!} className="h-full w-full object-cover" alt="" />}</div></td>
                <td>{p.name_en}</td>
                <td>{p.category?.name_en ?? "—"}</td>
                <td>₪{Number(p.price).toFixed(2)}</td>
                <td>{p.is_active ? "Active" : "Hidden"}</td>
                <td className="text-right pr-3">
                  <Button variant="ghost" size="icon" onClick={() => toggleBest(p)}>{p.is_best_seller ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}</Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
