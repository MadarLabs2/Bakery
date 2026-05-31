import { isValidEmail } from "@/frontend/lib/checkoutValidation";

export const MIN_PASSWORD_LENGTH = 8;

export function validateResetEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "emailRequired";
  if (!isValidEmail(trimmed)) return "invalidEmail";
  return null;
}

export function validateNewPassword(password: string, confirm: string): string | null {
  if (!password) return "passwordRequired";
  if (password.length < MIN_PASSWORD_LENGTH) return "passwordMinLength";
  if (!confirm) return "confirmPasswordRequired";
  if (password !== confirm) return "passwordsMustMatch";
  return null;
}

export function getPasswordResetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`;
}
