/**
 * Replace placeholders before production launch.
 * Used by legal pages (Privacy Policy, Terms, etc.).
 */
export const LEGAL_PLACEHOLDERS = {
  bakeryName: "[Your Bakery Name]",
  email: "[privacy@yourbakery.com]",
  phone: "[+1 (000) 000-0000]",
  address: "[Street Address, City, State/Region, Country]",
  websiteUrl: "[https://www.yourbakery.com]",
  /** Shown at top of legal documents */
  effectiveDate: "May 24, 2026",
  /** Governing law section — set to your jurisdiction */
  jurisdiction: "[Israel / your jurisdiction]",
} as const;
