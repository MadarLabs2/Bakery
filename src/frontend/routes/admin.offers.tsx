import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send, Mail } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/offers")({ component: AdminOffers });

function AdminOffers() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<{ id: string; email: string }[]>([]);
  const [past, setPast] = useState<
    { id: string; subject: string; message: string; discount_code: string | null; sent_at: string }[]
  >([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    supabase
      .from("email_subscribers")
      .select("id, email")
      .eq("is_active", true)
      .then(({ data }) => setSubscribers(data ?? []));
    supabase
      .from("email_campaigns")
      .select("id, subject, message, discount_code, sent_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPast(data ?? []));
  };
  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!subject || !body) return toast.error("Subject and body required");
    if (!user?.id) return toast.error("Not signed in");
    setSending(true);
    const { error } = await supabase.from("email_campaigns").insert({
      admin_id: user.id,
      subject,
      message: body,
      discount_code: discountCode.trim() || null,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success(
      `Campaign saved. ${subscribers.length} active subscriber(s) — connect an email provider to send.`,
    );
    setSubject("");
    setBody("");
    setDiscountCode("");
    load();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="font-display text-3xl font-bold">Email Offers</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2 rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Compose</h2>
          <div>
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="🥖 New gluten-free arrivals!"
            />
          </div>
          <div>
            <Label>Optional discount code (existing coupon code)</Label>
            <Input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="WELCOME10"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hello! This week..."
            />
          </div>
          <Button onClick={send} disabled={sending}>
            <Send className="h-4 w-4" /> Log campaign
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Mail className="h-5 w-5" /> Subscribers
          </h2>
          <div className="mt-4 max-h-72 space-y-1 overflow-auto text-sm">
            {subscribers.map((s) => (
              <div key={s.id} className="border-b py-1">
                {s.email}
              </div>
            ))}
            {subscribers.length === 0 && (
              <p className="text-muted-foreground">No subscribers yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-xl font-bold mb-3">Past campaigns</h2>
        <div className="space-y-2 text-sm">
          {past.map((o) => (
            <div key={o.id} className="border-b py-2 last:border-0">
              <div className="flex justify-between">
                <b>{o.subject}</b>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(o.sent_at), "PP")}
                  {o.discount_code ? ` · code: ${o.discount_code}` : ""}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2">{o.message}</p>
            </div>
          ))}
          {past.length === 0 && <p className="text-muted-foreground">No campaigns yet.</p>}
        </div>
      </div>
    </div>
  );
}
