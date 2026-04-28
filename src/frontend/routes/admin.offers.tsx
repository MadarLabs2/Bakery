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
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    supabase
      .from("email_subscribers")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => setSubscribers(data ?? []));
    supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPast(data ?? []));
  };
  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!subject || !body) return toast.error("Subject and body required");
    setSending(true);
    // Log the offer (real email sending requires email infrastructure; this records the campaign)
    const { error } = await supabase.from("offers").insert({
      subject,
      body,
      sent_count: subscribers.length,
      created_by: user?.id ?? null,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success(
      `Offer logged for ${subscribers.length} subscriber(s). Connect email service to actually send.`,
    );
    setSubject("");
    setBody("");
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
            <Label>Body</Label>
            <Textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hello! This week..."
            />
          </div>
          <Button onClick={send} disabled={sending || subscribers.length === 0}>
            <Send className="h-4 w-4" /> Send to {subscribers.length} subscriber(s)
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
        <h2 className="font-display text-xl font-bold mb-3">Past offers</h2>
        <div className="space-y-2 text-sm">
          {past.map((o) => (
            <div key={o.id} className="border-b py-2 last:border-0">
              <div className="flex justify-between">
                <b>{o.subject}</b>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(o.created_at), "PP")} · {o.sent_count} sent
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2">{o.body}</p>
            </div>
          ))}
          {past.length === 0 && <p className="text-muted-foreground">No campaigns sent.</p>}
        </div>
      </div>
    </div>
  );
}
