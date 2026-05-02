import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  getInstagramUrl,
  getWhatsAppChatUrl,
  hasAnySocialLink,
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

const fab =
  "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ease-out hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 sm:h-[3.75rem] sm:w-[3.75rem]";

/**
 * Fixed bottom-right WhatsApp + Instagram (customer site only; omit on /admin).
 */
export function FloatingSocialLinks() {
  const waUrl = getWhatsAppChatUrl();
  const igUrl = getInstagramUrl();
  if (!hasAnySocialLink()) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "pointer-events-none fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6",
        )}
        aria-label="Quick contact"
      >
        <div className="pointer-events-auto flex flex-col gap-3">
          {hasWhatsAppLink() && waUrl ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(fab, "bg-[#25D366] text-white")}
                  aria-label={SOCIAL_TOOLTIPS.whatsapp}
                >
                  <FaWhatsapp className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
                </a>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[220px]">
                {SOCIAL_TOOLTIPS.whatsapp}
              </TooltipContent>
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
                    fab,
                    "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white",
                  )}
                  aria-label={SOCIAL_TOOLTIPS.instagram}
                >
                  <FaInstagram className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
                </a>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[220px]">
                {SOCIAL_TOOLTIPS.instagram}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}
