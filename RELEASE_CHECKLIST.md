# Billora — launch readiness

## Current state: public preview, not a production consumer-finance release

- [x] New visitor sees a distinct, mobile-responsive marketing/welcome page before any demo data.
- [x] Sign in, sign up and interactive demo have visible routes and working navigation.
- [x] Approved logo artwork is packaged with the website and a high-contrast logo lockup is used on dark surfaces.
- [x] React + TypeScript + Vite, compiled by GitHub Actions into GitHub Pages.
- [x] Distinct midnight/graphite/mint brand colours throughout website, dashboard and account screens.
- [x] Demo remains clearly identified as sample data, with local-only storage.
- [ ] Dedicated Billora Supabase project and separate authentication configured (must not reuse DayRidge).
- [ ] Provision finance_snapshots SQL and verify RLS with two different user accounts (both API access and database ownership).
- [ ] Set verified `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Billora GitHub Actions Variables. Never expose OAuth provider secrets or service_role keys to the frontend.
- [ ] Connect Google OAuth and Microsoft Entra including personal Microsoft accounts, verified-email claims, authorised redirect URLs and consent screen configuration.
- [ ] Complete email delivery, email confirmations, reset-password page/flow, OAuth callback tests, provider failure states and sign-out validation.
- [ ] Implement a real account deletion flow with associated finance data erasure.
- [ ] Publish privacy notice and terms, with accurate controller name and business contact details, retention, backups and GDPR rights.
- [ ] Verify rate limiting, audit logging, dependency scans, backup/restore and incident response.
- [ ] Validate repayment calculations, interest rate assumptions and payment frequency logic against realistic scenarios. Present as estimates, not financial advice.
- [ ] Test across iPhone, Android, desktop, keyboard navigation, VoiceOver/TalkBack and reduced motion.
- [ ] Configure release-domain, SEO, social sharing and production monitoring.

## Owner decisions needed to activate accounts

1. Confirm which Supabase organisation to use for the **new separate Billora** project (potential additional charge must be approved).
2. Configure Google Cloud OAuth project and Microsoft Entra app, providing **credentials directly to Supabase provider settings, not in chat or this repository**.
3. Supply the legal/privacy controller name and contact address for public notices.

The site should not accept real financial information from public users until the unfinished checks above are closed.
