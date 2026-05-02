import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  getInstagramUrl,
  getWhatsAppChatUrl,
  hasInstagramLink,
  hasWhatsAppLink,
  SOCIAL_TOOLTIPS,
} from "@/config/socialLinks";
import { cn } from "@/frontend/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";

const linkBase =
  "inline-flex shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-200 ease-out hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type SocialLinksProps = {
  className?: string;
  /** Smaller icons for footer rows; larger for contact section */
  size?: "sm" | "md";
};

export function SocialLinks({ className, size = "md" }: SocialLinksProps) {
  const dim = size === "sm" ? 22 : 26;
  const pad = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const waUrl = getWhatsAppChatUrl();
  const igUrl = getInstagramUrl();

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn("flex flex-wrap items-center gap-3", className)}
        role="group"
        aria-label="Social links"
      >
        {hasWhatsAppLink() && waUrl ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(linkBase, pad, "bg-[#25D366] text-white")}
                aria-label={SOCIAL_TOOLTIPS.whatsapp}
              >
                <FaWhatsapp size={dim} aria-hidden />
              </a>
            </TooltipTrigger>
            <TooltipContent side="top">{SOCIAL_TOOLTIPS.whatsapp}</TooltipContent>
          </Tooltip>
        ) : null}

        {hasInstagramLink() ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  linkBase,
                  pad,
                  "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white",
                )}
                aria-label={SOCIAL_TOOLTIPS.instagram}
              >
                <FaInstagram size={dim} aria-hidden />
              </a>
            </TooltipTrigger>
            <TooltipContent side="top">{SOCIAL_TOOLTIPS.instagram}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
