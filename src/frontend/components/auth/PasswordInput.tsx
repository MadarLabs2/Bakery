import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { useI18n } from "@/frontend/lib/i18n";

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  minLength,
  required,
  disabled,
  "aria-invalid": ariaInvalid,
}: PasswordInputProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className="pe-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute end-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </Button>
    </div>
  );
}
