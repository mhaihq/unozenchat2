import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Webhook error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only act on paid sessions
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const userId = session.metadata?.user_id;
    const cohortId = session.metadata?.cohort_id || null;
    const courseId = session.metadata?.course_id || null;

    if (!userId) {
      console.error("No user_id in session metadata");
      return new Response(JSON.stringify({ error: "No user_id" }), { status: 400 });
    }

    // Persist the purchase record
    await supabase.from("purchases").insert({
      user_id: userId,
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      amount_total: session.amount_total,
      currency: session.currency,
      cohort_id: cohortId || null,
      course_id: courseId || null,
    });

    // Enroll the user
    if (cohortId) {
      // Live course: enroll in the specific cohort
      const { error } = await supabase
        .from("enrollments")
        .upsert({ user_id: userId, cohort_id: cohortId }, { onConflict: "user_id,cohort_id" });
      if (error) console.error("Enrollment error:", error.message);
    } else if (courseId) {
      // Recorded course: find or create a "self-paced" cohort for this course
      let { data: cohort } = await supabase
        .from("cohorts")
        .select("id")
        .eq("course_id", courseId)
        .eq("name", "Self-paced")
        .maybeSingle();

      if (!cohort) {
        const { data: newCohort, error: cohortErr } = await supabase
          .from("cohorts")
          .insert({ course_id: courseId, name: "Self-paced", is_active: true })
          .select("id")
          .single();
        if (cohortErr) { console.error("Cohort creation error:", cohortErr.message); }
        else cohort = newCohort;
      }

      if (cohort) {
        const { error } = await supabase
          .from("enrollments")
          .upsert({ user_id: userId, cohort_id: cohort.id }, { onConflict: "user_id,cohort_id" });
        if (error) console.error("Enrollment error:", error.message);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
