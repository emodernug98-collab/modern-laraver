import { CreditCard, Smartphone, Banknote } from "lucide-react";

/**
 * Recognizable, self-contained brand marks for the payment methods we
 * support. Each returns an SVG sized to sit inside a ~46×30 white tile.
 * Matching is done on the gateway name so backend-driven gateways still
 * render a real logo even when they ship without a `logo` image.
 */

function Visa() {
  return (
    <svg viewBox="0 0 48 16" className="h-4 w-auto" role="img" aria-label="Visa">
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="15"
        fontWeight="700"
        fontStyle="italic"
        fill="#1A1F71"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 48 30" className="h-6 w-auto" role="img" aria-label="Mastercard">
      <circle cx="19" cy="15" r="11" fill="#EB001B" />
      <circle cx="29" cy="15" r="11" fill="#F79E1B" />
      <path
        d="M24 6.6a11 11 0 0 0 0 16.8 11 11 0 0 0 0-16.8Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function Mtn() {
  return (
    <svg viewBox="0 0 48 30" className="h-6 w-auto" role="img" aria-label="MTN Mobile Money">
      <rect width="48" height="30" rx="5" fill="#FFCB05" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="#004F9F"
      >
        MoMo
      </text>
    </svg>
  );
}

function Airtel() {
  return (
    <svg viewBox="0 0 48 30" className="h-6 w-auto" role="img" aria-label="Airtel Money">
      <rect width="48" height="30" rx="5" fill="#ED1C24" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="11"
        fontWeight="800"
        fill="#ffffff"
      >
        airtel
      </text>
    </svg>
  );
}

function PayPal() {
  return (
    <svg viewBox="0 0 60 16" className="h-4 w-auto" role="img" aria-label="PayPal">
      <text x="0" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="800" fontStyle="italic" fill="#003087">Pay</text>
      <text x="27" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="800" fontStyle="italic" fill="#009CDE">Pal</text>
    </svg>
  );
}

/** Returns a brand mark for a gateway name, or null if none matches. */
export function PaymentBrand({ name }: { name: string }) {
  const key = name.toLowerCase();

  if (key.includes("visa")) return <Visa />;
  if (key.includes("master")) return <Mastercard />;
  if (key.includes("mtn") || key.includes("momo")) return <Mtn />;
  if (key.includes("airtel")) return <Airtel />;
  if (key.includes("paypal")) return <PayPal />;

  // Generic fallbacks by category.
  if (key.includes("mobile") || key.includes("money") || key.includes("ussd"))
    return <Smartphone className="h-5 w-5 text-gray-700" aria-label={name} />;
  if (key.includes("cash") || key.includes("delivery") || key.includes("bank"))
    return <Banknote className="h-5 w-5 text-gray-700" aria-label={name} />;

  return <CreditCard className="h-5 w-5 text-gray-700" aria-label={name} />;
}
