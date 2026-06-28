import { isValidEmail } from "@/frontend/lib/checkoutValidation";

export const MIN_PASSWORD_LENGTH = 8;

const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_DIGIT = /\d/;

export function validatePasswordStrength(password: string): string | null {
  if (!password) return "passwordRequired";
  if (password.length < MIN_PASSWORD_LENGTH) return "passwordMinLength";
  if (!HAS_UPPERCASE.test(password)) return "passwordNeedsUppercase";
  if (!HAS_LOWERCASE.test(password)) return "passwordNeedsLowercase";
  if (!HAS_DIGIT.test(password)) return "passwordNeedsDigit";
  return null;
}

export function validateResetEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "emailRequired";
  if (!isValidEmail(trimmed)) return "invalidEmail";
  return null;
}

export function validateNewPassword(password: string, confirm: string): string | null {
  const strengthErr = validatePasswordStrength(password);
  if (strengthErr) return strengthErr;
  if (!confirm) return "confirmPasswordRequired";
  if (password !== confirm) return "passwordsMustMatch";
  return null;
}

export function getPasswordResetRedirectUrl(): string {
  return `${window.location.origin}/reset-password`;
}
