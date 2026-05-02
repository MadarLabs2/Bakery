import { dict } from "@/frontend/lib/i18n";

export function adminOrderStatusLabel(status: string, t: (key: keyof typeof dict) => string) {
  const k = `adminOrderStatus_${status}` as keyof typeof dict;
  return k in dict ? t(k) : status;
}
