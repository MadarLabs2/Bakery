import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      full_name: fullName,
      email,
      phone: phone.trim() || null,
      message,
    });
    setSending(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("thanks"));
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-5xl font-bold">{t("contact")}</h1>
      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-8">
        <p className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" /> 050-8588985
        </p>
        <p className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" /> hello@alnour-bakery.com
        </p>
        <p className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" /> Israel
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-4 rounded-2xl border bg-card p-8">
        <h2 className="font-display text-xl font-semibold">Send a message</h2>
        <div>
          <Label htmlFor="cname">{t("fullName")}</Label>
          <Input
            id="cname"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cemail">{t("email")}</Label>
          <Input
            id="cemail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cphone">{t("phone")}</Label>
          <Input id="cphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cmsg">Message</Label>
          <Textarea
            id="cmsg"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
