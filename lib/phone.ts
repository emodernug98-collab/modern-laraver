const DEFAULT_COUNTRY_CODE = "+256";

export function normalizePhoneNumber(phone: string) {
  const compact = phone.trim().replace(/[\s()-]+/g, "");

  if (!compact) {
    return "";
  }

  if (compact.startsWith("+")) {
    const digits = compact.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }

  const digits = compact.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `${DEFAULT_COUNTRY_CODE}${digits.slice(1)}`;
  }

  if (digits.startsWith("256")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function isValidE164Phone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
