# Billora — launch readiness

## Current state: public preview, not a production consumer-finance release

- [x] New visitor sees a distinct, mobile-responsive marketing/welcome page before any demo data.
- [x] Sign in, sign up and interactive demo have visible routes and working navigation.
- [x] Approved logo artwork is packaged with the website and a high-contrast logo lockup is used on dark surfaces.
- [x] React + TypeScript + Vite, compiled by GitHub Actions into GitHub Pages.
- [x] Distinct midnight/graphite/mint brand colours throughout website, dashboard and account screens.
- [x] Demo remains clearly identified as sample data, with local-only storage.
- [x] Dedicated Billora Supabase project and publishable client configured separately from DayRidge.
- [x] Provision finance_snapshots and verify RLS policies are present. Two-account end-to-end RLS testing remains outstanding.
- [x] Connect dedicated Billora project using its browser-safe publishable key with optional GitHub variables as overrides. Never expose provider secrets or service_role keys to the frontend.
- [ ] Connect Google OAuth and Microsoft Entra including personal Microsoft accounts, verified-email claims, authorised redirect URLs and consent screen configuration.
- [x] Add email/password sign-in, registration and branded password reset UI.
- [ ] Configure Supabase Auth production redirect URLs, test real email delivery and confirmation/reset end to end; configure custom SMTP for wider release.
- [ ] Google/Microsoft OAuth provider setup and verification (postponed).
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
