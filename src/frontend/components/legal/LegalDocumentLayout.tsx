import { Link } from "@tanstack/react-router";
import { Shield, Mail, Phone, MapPin, Globe } from "lucide-react";
import { LEGAL_PLACEHOLDERS } from "@/config/legalPlaceholders";
import { useI18n } from "@/frontend/lib/i18n";
import { legalSharedT } from "@/frontend/lib/legalShared.i18n";
import { cn } from "@/frontend/lib/utils";

export type LegalShellCopy = {
  legalBadge: string;
  questionsTitle: string;
  questionsBody: string;
};

type LegalDocumentLayoutProps = {
  title: string;
  subtitle: string;
  shell: LegalShellCopy;
  children: React.ReactNode;
  className?: string;
  effectiveDate?: string;
};

export function LegalDocumentLayout({
  title,
  subtitle,
  shell,
  children,
  className,
  effectiveDate: effectiveDateOverride,
}: LegalDocumentLayoutProps) {
  const { lang, t } = useI18n();
  const { email, phone, address, websiteUrl, effectiveDate } = LEGAL_PLACEHOLDERS;
  const displayEffectiveDate = effectiveDateOverride ?? effectiveDate;

  return (
    <div className={cn("bg-gradient-to-b from-secondary/30 to-background", className)}>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <header className="rounded-2xl border bg-card p-8 shadow-sm md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {shell.legalBadge}
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">{subtitle}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {legalSharedT("legalEffectiveDate", lang)}
                </span>{" "}
                {displayEffectiveDate}
              </p>
            </div>
          </div>
        </header>

        <article className="mt-10 space-y-10 rounded-2xl border bg-card p-8 shadow-sm md:p-10">
          {children}
        </article>

        <aside className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8">
          <h2 className="font-display text-lg font-semibold">{shell.questionsTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {shell.questionsBody}
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{phone}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{websiteUrl}</span>
            </li>
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link to="/" className="text-primary hover:underline">
              {legalSharedT("legalReturnHome", lang)}
            </Link>
            {" · "}
            <Link to="/contact" className="text-primary hover:underline">
              {t("contact")}
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 ps-5 marker:text-primary/70">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function PolicySubheading({ children }: { children: string }) {
  return <h3 className="text-lg font-semibold text-foreground">{children}</h3>;
}
