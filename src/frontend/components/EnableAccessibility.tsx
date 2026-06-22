import { useEffect } from "react";
import {
  ENABLE_A11Y_SCRIPT_ID,
  ENABLE_A11Y_SCRIPT_SRC,
} from "@/config/enableAccessibility";

/** Loads the Enable.co.il accessibility toolbar on the customer site. */
export function EnableAccessibility() {
  useEffect(() => {
    if (document.getElementById(ENABLE_A11Y_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ENABLE_A11Y_SCRIPT_ID;
    script.src = ENABLE_A11Y_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
