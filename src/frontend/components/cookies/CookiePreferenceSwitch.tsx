import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/frontend/lib/utils";

type CookiePreferenceSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-label": string;
};

export function CookiePreferenceSwitch({
  checked,
  onCheckedChange,
  "aria-label": ariaLabel,
}: CookiePreferenceSwitchProps) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
      className={cn(
        "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "border-primary/15 bg-muted/80 data-[state=checked]:border-primary data-[state=checked]:bg-primary",
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/5",
          "transition-transform duration-200 ease-out",
          "translate-x-0.5 group-data-[state=checked]:translate-x-[1.35rem]",
          "rtl:-translate-x-0.5 rtl:group-data-[state=checked]:-translate-x-[1.35rem]",
        )}
      />
    </SwitchPrimitives.Root>
  );
}
