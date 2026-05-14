-- Stripe customer mapping (user_id → stripe_customer_id)
CREATE TABLE IF NOT EXISTS stripe_customers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id  text NOT NULL UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Purchase log (source of truth for all transactions)
CREATE TABLE IF NOT EXISTS purchases (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id       text NOT NULL UNIQUE,
  stripe_payment_intent   text,
  amount_total            integer,   -- in cents
  currency                text,
  cohort_id               uuid REFERENCES cohorts(id) ON DELETE SET NULL,
  course_id               uuid REFERENCES courses(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases        ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "stripe_customers_own_read" ON stripe_customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "purchases_own_read"        ON purchases        FOR SELECT USING (auth.uid() = user_id);
