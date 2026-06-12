import { createServerFn } from "@tanstack/react-start";
import { isCardcomEnabled } from "@/backend/config/cardcom";

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(async () => ({
  cardPaymentAvailable: isCardcomEnabled(),
}));
