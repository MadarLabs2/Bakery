/**
 * Replace placeholders before production launch.
 * Used by legal pages (Privacy Policy, Terms, etc.).
 */
export const LEGAL_PLACEHOLDERS = {
  bakeryName: "Al-Nour Gluten-Free Bakery",
  email: "hello@alnour-bakery.com",
  phone: "053-7636011",
  address: "Israel",
  websiteUrl: "https://al-nour-bakery.com",
  /** Shown at top of legal documents */
  effectiveDate: "May 24, 2026",
  /** Accessibility statement last updated */
  accessibilityEffectiveDate: "June 2026",
  /** Governing law section — set to your jurisdiction */
  jurisdiction: "Israel",
} as const;
