import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase, EDGE_FUNCTION_URL } from "../lib/supabase";

interface Props {
  priceId: string;
  cohortId?: string;
  courseId?: string;
  label?: string;
  className?: string;
}

export function CheckoutButton({ priceId, cohortId, courseId, label = "Acquista ora", className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${EDGE_FUNCTION_URL.replace("/course-chat", "")}/stripe-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId, cohortId, courseId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il checkout");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={className ?? "flex items-center justify-center gap-2 px-6 py-3 bg-[#C8E976] text-[#1A1A1A] font-semibold rounded-full border border-[#1A1A1A] hover:bg-[#A8D14F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Reindirizzamento…" : label}
      </button>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}
