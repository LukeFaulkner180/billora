# Billora Free & Premium implementation

## Plans — proposed, not yet on sale
- **Free:** bills, debt planning, income, manual daily spending and savings goals.
- **Premium:** weekly spending limits, category budgets, receipt OCR and advanced alerts.
- Subscription price and billing cadence remain to be approved. No payment or subscription is created from the preview.

## Security and persistence
- The `premium_entitlements` table in the **Billora-only** Supabase project is readable by the account owner, but not writable from browser credentials.
- `premium_budgets` is stored in a separate table with RLS requiring verified active or trialing Premium entitlement and an unexpired subscription period.
- Free users can review their recorded spending but cannot save premium budgets via the protected database table.
- Receipt scanning uses on-device JavaScript OCR, which cannot be technically secured against someone running their own local copy of the public browser code. UI access checks provide normal-product gating only, not absolute tamper resistance.
- The normal `finance_snapshots` payload excludes premium-only limits; premium budget settings are stored separately.
- Screens do **not** take payments yet. Checkout requires a server-side Stripe Checkout Session, verified webhooks, and a customer portal. Never trust client-reported payment completion.
- Current Stripe connection is a **sandbox**. No real payment acceptance has been enabled.

## Next steps
1. Confirm monthly/annual GBP prices and refund policy.
2. Complete Billora-only Supabase Auth and Google/Microsoft OAuth redirects, privacy policy, deletion/export flows.
3. Build secure Stripe Checkout session and webhook endpoints in Billora Supabase Edge Functions.
4. Test entitlement state through cancellations, failed payments, retries and chargebacks in Stripe test mode.
5. Verify mobile UX and accessibility before public paid launch. Keep DayRidge untouched.
