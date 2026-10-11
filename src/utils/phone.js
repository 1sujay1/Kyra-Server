/**
 * Indian phone number validation and normalization utilities.
 */

export function normalisePhone(phone) {
  if (!phone) return "";
  let digits = String(phone).replace(/\D/g, "");
  // If prefixed with 91 and 12 digits total
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // If prefixed with 0 (STD/trunk prefix) and 11 digits total
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

export function validateIndianPhoneNumber(phone) {
  const cleanDigits = normalisePhone(phone);
  // Valid Indian mobile: starts with 6, 7, 8, or 9 and has exactly 10 digits
  const isValid = /^[6-9]\d{9}$/.test(cleanDigits);

  return {
    isValid,
    cleanDigits,
    formatted: cleanDigits ? `+91 ${cleanDigits}` : phone || "",
  };
}
