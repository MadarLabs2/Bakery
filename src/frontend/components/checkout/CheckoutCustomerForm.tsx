import { User } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import type { ContactFieldErrors } from "@/frontend/lib/checkoutValidation";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { cn } from "@/frontend/lib/utils";
import { CheckoutSection } from "./CheckoutSection";

type CheckoutCustomerFormProps = {
  name: string;
  phone: string;
  email: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  errors?: ContactFieldErrors;
};

export function CheckoutCustomerForm({
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  errors,
}: CheckoutCustomerFormProps) {
  const { t } = useI18n();

  return (
    <CheckoutSection
      icon={<User className="h-5 w-5" />}
      title={t("checkoutCustomerSection")}
      description={t("checkoutCustomerDesc")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="checkout-name">{t("fullName")}</Label>
          <Input
            id="checkout-name"
            autoComplete="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={cn(errors?.name && "border-destructive")}
            aria-invalid={!!errors?.name}
          />
          {errors?.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
        </div>
        <div>
          <Label htmlFor="checkout-phone">{t("phone")}</Label>
          <Input
            id="checkout-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={cn(errors?.phone && "border-destructive")}
            aria-invalid={!!errors?.phone}
          />
          {errors?.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="checkout-email">{t("email")}</Label>
          <Input
            id="checkout-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={cn(errors?.email && "border-destructive")}
            aria-invalid={!!errors?.email}
          />
          {errors?.email ? <p className="mt-1 text-xs text-destructive">{errors.email}</p> : null}
        </div>
      </div>
    </CheckoutSection>
  );
}
