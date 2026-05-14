import { useEffect, useState } from "react";

type CheckoutResult = "success" | "cancelled" | null;

export function useCheckoutResult(): { result: CheckoutResult; clear: () => void } {
  const [result, setResult] = useState<CheckoutResult>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") setResult("success");
    else if (checkout === "cancelled") setResult("cancelled");
  }, []);

  function clear() {
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.toString());
  }

  return { result, clear };
}
