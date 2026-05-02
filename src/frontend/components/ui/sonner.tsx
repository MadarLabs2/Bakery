import { useSyncExternalStore, type ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";
import { useI18n } from "@/frontend/lib/i18n";

type ToasterProps = ComponentProps<typeof Sonner>;

const NARROW_MQ = "(max-width: 639px)";

function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia(NARROW_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getNarrowSnapshot() {
  return window.matchMedia(NARROW_MQ).matches;
}

function getNarrowServerSnapshot() {
  return false;
}

/** Bottom-right on desktop, bottom-center on small screens; respects document `dir` via i18n. */
function ResponsiveToaster({ ...props }: ToasterProps) {
  const isNarrow = useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, getNarrowServerSnapshot);
  const { dir } = useI18n();
  const position = isNarrow ? "bottom-center" : "bottom-right";

  return (
    <Sonner
      dir={dir}
      className="toaster group"
      position={position}
      richColors
      expand
      closeButton
      offset={isNarrow ? "1rem" : "1.5rem"}
      gap={10}
      toastOptions={{
        duration: 3800,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { ResponsiveToaster, ResponsiveToaster as Toaster };
