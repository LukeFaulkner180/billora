
# Billora Premium payments — setup and release checklist

## Current pricing and access
- Free: bills, debt planning, income, manual spending and savings goals. No payment method required.
- Premium monthly: GBP 3.99 per month, 399 pence.
- Premium annual: GBP 32.99 per year, 3299 pence, saving GBP 14.89 (31%) over 12 monthly charges.
- Paid features: weekly spending limits, category budgets and receipt-image scanning.
- Marketing prices need clear consistent tax/VAT treatment.

## Current state — test only
- Billora React app: https://lukefaulkner180.github.io/billora/
- Separate Billora Supabase project gqzwtxiltlguqkactgmh; never reuse DayRidge credentials.
- Stripe sandbox account contains a Billora Premium test product and recurring GBP 3.99 monthly and GBP 32.99 annual test prices.
- Live Checkout, verified webhook subscription activation and customer billing portal are not connected. Real customers cannot purchase Premium yet.

## Owner actions in Stripe
1. Open https://dashboard.stripe.com/ and complete business/sole-trader details, identity checks, payout bank account, business address, support contact and account activation.
2. Configure public merchant name, statement descriptor, support email and customer payment receipts.
3. Review VAT/tax treatment, subscription terms, consumer cancellation and refund policy. Obtain appropriate UK legal/tax advice.
4. Configure Stripe Billing Customer Portal and cancellation behaviour (cancel at the end of the paid period unless your published terms differ).
5. After your live account is enabled, create separate LIVE recurring Premium prices for GBP 3.99 monthly and GBP 32.99 annual; sandbox price IDs will not charge customers.
6. Connect the correct live Stripe account for the Billora development work, or place sensitive keys in the appropriate server-side secret manager. NEVER paste secret keys into messages or public repositories.

## Technical work before charging
1. Finish and test email / Google / Microsoft sign-in with the dedicated Billora Supabase Auth project and production site redirects.
2. Add a Supabase Edge Function for authenticated Stripe-hosted Checkout Session creation, using only allowlisted live price IDs. Associate the Stripe customer with the verified Supabase user ID on the server.
3. Add server-side webhook processing with signature verification and idempotent handling of subscription creation, updates, renewals, failed charges, cancellations and deletion. NEVER grant Premium access based on a browser success URL.
4. Update the read-only premium_entitlements table only from trusted server code after Stripe confirmation; leave the existing RLS rules in place.
5. Add a secure Stripe Customer Portal launcher for customers to update payment details, see invoices and cancel.
6. Test in sandbox: success, failure, renewal, cancellation at period end, payment retries, duplicate webhooks, two-user isolation, account deletion and export.
7. Publish privacy policy, terms of service and paid subscription terms before public checkout.
8. Switch to live Stripe only when authentication, backend, permissions, receipt feature and billing lifecycle checks pass.

## Security boundaries
- No Stripe secret API key, signing secret or Supabase service-role key in web/, VITE_* client variables or GitHub Pages.
- No client-controlled subscription status, localStorage entitlement or URL-based paid unlock.
- Never modify the DayRidge Supabase project.
