import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Accessibility } from "lucide-react";
import {
  accessibilityGuideEn,
  accessibilityGuideHe,
  type AccessibilityGuideContent,
  type GuideBlock,
} from "@/frontend/lib/enableAccessibilityGuide.content";
import { cn } from "@/frontend/lib/utils";

export const Route = createFileRoute("/accessibility-guide")({
  component: AccessibilityGuidePage,
  head: () => ({
    meta: [
      { title: "Accessibility Guide | Al-Nour Gluten-Free Bakery" },
      {
        name: "description",
        content:
          "Hebrew and English accessibility guide for Al-Nour Gluten-Free Bakery — Enable plugin instructions and coordinator contact.",
      },
    ],
  }),
});

function GuideSection({ block }: { block: GuideBlock }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {block.title}
      </h2>
      <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
        {block.paragraphs?.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {block.listItems ? (
          <ul className="list-disc space-y-2 ps-5 marker:text-primary/70">
            {block.listItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function GuideArticle({
  content,
  dir,
  lang,
  className,
}: {
  content: AccessibilityGuideContent;
  dir: "rtl" | "ltr";
  lang: "he" | "en";
  className?: string;
}) {
  return (
    <article dir={dir} lang={lang} className={cn("space-y-10", className)}>
      <header className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Accessibility className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {lang === "he" ? "נגישות · Enable" : "Accessibility · Enable"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {content.pageTitle}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{content.lastUpdatedLabel}</span>{" "}
              {content.lastUpdated}
            </p>
            <p className="mt-2 text-sm">
              {content.statementLinkLabel}{" "}
              <Link to="/accessibility" className="text-primary font-medium hover:underline">
                {content.statementLinkUrl}
              </Link>
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-10 rounded-2xl border bg-card p-8 shadow-sm md:p-10">
        {content.blocks.map((block) => (
          <GuideSection key={`${lang}-${block.title}`} block={block} />
        ))}
      </div>
    </article>
  );
}

function AccessibilityGuidePage() {
  useEffect(() => {
    document.title = "Accessibility Guide | Al-Nour Gluten-Free Bakery";
  }, []);

  return (
    <div className="bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto max-w-4xl space-y-16 px-4 py-12 md:py-16">
        <GuideArticle content={accessibilityGuideHe} dir="rtl" lang="he" />

        <div className="flex items-center gap-4" aria-hidden>
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            English
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GuideArticle content={accessibilityGuideEn} dir="ltr" lang="en" />

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            {accessibilityGuideHe.blocks[0] ? "← חזרה לדף הבית" : "Home"}
          </Link>
          <span className="mx-3 text-border">·</span>
          <Link to="/" className="text-primary hover:underline">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
