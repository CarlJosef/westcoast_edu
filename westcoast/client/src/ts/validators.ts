export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateEmail(email: string): ValidationResult {
  const value = email.trim().toLowerCase();
  if (!value) return { ok: false, message: "Email is required." };

  // Pragmatic email check (KISS)
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return isValid ? { ok: true } : { ok: false, message: "Email is invalid." };
}

export function validateSwedishMobile(mobile: string): ValidationResult {
  const value = mobile.trim();
  if (!value) return { ok: false, message: "Mobile number is required." };

  // Accept +46xxxxxxxxx or 07xxxxxxxx
  const normalized = value.replace(/\s+/g, "");
  const isValid = /^(\+46|0)7\d{8}$/.test(normalized);
  return isValid ? { ok: true } : { ok: false, message: "Mobile number is invalid." };
}
