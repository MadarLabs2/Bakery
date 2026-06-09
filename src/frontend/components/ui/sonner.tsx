import { type ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";
import { useI18n } from "@/frontend/lib/i18n";

type ToasterProps = ComponentProps<typeof Sonner>;

/** Top-center on all screens; respects document `dir` via i18n. */
function ResponsiveToaster({ ...props }: ToasterProps) {
  const { dir } = useI18n();

  return (
    <Sonner
      dir={dir}
      position="top-center"
      closeButton
      offset="1rem"
      gap={8}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "!rounded-2xl !border !border-[oklch(0.88_0.02_75)] !bg-[oklch(0.99_0.008_85)] !text-[oklch(0.28_0.04_60)] !shadow-xl !shadow-black/10 !px-4 !py-3.5 !gap-3 !items-start !text-sm",
          title:
            "!text-sm !font-semibold !leading-snug !text-[oklch(0.28_0.04_60)]",
          description:
            "!text-xs !text-[oklch(0.48_0.04_60)] !leading-relaxed !mt-0.5",
          success:
            "![border-inline-start:3px_solid_oklch(0.42_0.09_145)]",
          error:
            "![border-inline-start:3px_solid_oklch(0.55_0.22_28)]",
          warning:
            "![border-inline-start:3px_solid_oklch(0.78_0.11_75)]",
          info:
            "![border-inline-start:3px_solid_oklch(0.55_0.09_230)]",
          closeButton:
            "!rounded-lg !border !border-[oklch(0.88_0.02_75)] !bg-[oklch(0.99_0.008_85)] !text-[oklch(0.48_0.04_60)]",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-lg !text-xs !font-medium",
          cancelButton:
            "!bg-muted !text-muted-foreground !rounded-lg !text-xs !font-medium",
        },
      }}
      {...props}
    />
  );
}

export { ResponsiveToaster, ResponsiveToaster as Toaster };
