# Billora

Consumer-first personal finance app. **Version 0.5 public preview**: React + TypeScript + Vite, modern UI, animated summaries, responsive layouts, and an authentication UI prepared for email/password, Google and Microsoft.

## Visitor experience and current status

- **New visitors** see the branded marketing/welcome screen with the real approved Billora symbol, Sign in / Create account entry points and a Try Demo button.
- **Demo route:** `https://lukefaulkner180.github.io/billora/?demo=1` opens the existing example-money workspace.
- **Account routes:** `?auth=login` and `?auth=signup` show the branded account interface, but cannot create accounts until the dedicated Billora Supabase project and OAuth providers are configured.
- The original full-colour source logo is bundled for design reference as `web/public/billora-original-logo.svg`; `web/public/billora-symbol.svg` contains the approved icon optimised for dark backgrounds.

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for the production launch blockers. This version is a public **preview**, not a consumer-finance production release.

## What is live in the demo?

- Modern overview with animated monthly figures, category chart, upcoming bills and payoff progress
- Bills, debts, incomes, payment history and repayment simulations
- Mobile navigation, forms and import/export
- Account UI with Google/Microsoft and email signup, **not yet active until a NEW Billora Supabase project is provisioned**

**Do not enter genuine sensitive information into the unauthenticated local demo.** In demo mode data lives in browser localStorage and is not synchronised. Google/Microsoft logins are *not* simulated — the buttons provide an honest setup message until configured.

## Local setup

```bash
cd web   # source lives in the web/ directory in the GitHub repository
npm install
npm run dev
npm run build
```

The repository contains a GitHub Pages Action that builds `web/` and deploys the compiled `web/dist` folder.

## Turn on real accounts (requires owner configuration)

1. Create a **new separate Supabase project named Billora**. NEVER reuse the DayRidge/ClockLio project.
2. In that new project's SQL editor, review and run `supabase/001_finance_snapshots.sql` from this repository. Its RLS policies limit every row by `auth.uid()`.
3. Configure **Authentication → URL Configuration**: Site URL and Redirect URLs must include `https://lukefaulkner180.github.io/billora/`. For local testing allow `http://localhost:5173/billora/` too.
4. **Google:** create a Google Cloud OAuth web client; use `https://<BILLORA_PROJECT_REF>.supabase.co/auth/v1/callback` as authorised redirect URI, and place the Google client ID and secret in **Supabase → Authentication → Providers → Google**. Only the email/profile/openid scopes are needed.
5. **Microsoft:** register a Microsoft Entra application. For consumer use choose an account type including personal Microsoft accounts. Add the same Supabase callback as a Web Redirect URI. Place its client ID and **client secret value** (not secret ID) into **Supabase → Authentication → Providers → Azure**. Request email scope in the app (already implemented). Configure the `xms_edov` optional claim as recommended by Supabase for verified-email handling.
6. **Email/password:** enable email signups, decide whether confirmation is mandatory and configure a production email service if necessary.
7. In the *Billora* GitHub repository **Settings → Secrets and variables → Actions → Variables**, set `VITE_SUPABASE_URL` to the new project's API URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its **publishable** public key. Do not put service-role keys or OAuth client secrets in the repository or GitHub Pages build.
8. Trigger **Actions → Build and deploy Billora → Run workflow** to rebuild with those two values.
9. Test email signup/confirmation, Google and Microsoft callback, two separate accounts (verify no cross-account access), sign-out, import/export and error conditions before inviting real users.

**The initial GitHub Pages deployment intentionally runs without Supabase credentials. Account buttons cannot really authenticate until steps 1–8 are complete.** Secure cloud data is not wired to DayRidge.

## Project structure

```text
web/
├── index.html               # React entry page
├── package.json             # Exact dependency versions
├── src/
│   ├── App.tsx              # Navigation, account state, CRUD operations
│   ├── auth/
│   │   ├── client.ts        # Supabase public client, optional until configured
│   │   ├── cloud.ts         # User-owned finance snapshots
│   │   └── AccountDialog.tsx # Sign-in, sign-up and social login UI
│   ├── components/          # Reusable forms, buttons, animated figures
│   ├── pages/               # Overview, Bills, Debts, Planner, Settings
│   ├── lib/                 # Finance calculations, data validation, local storage
│   ├── premium.css          # Design system, layout, animation, accessibility
│   ├── types.ts             # Shared TypeScript models
│   └── main.tsx             # App startup and stylesheets
supabase/
└── 001_finance_snapshots.sql # Run only in the new Billora project
PROJECT_BUDGET.md            # Proposed allocation, £0 actual spend
.github/workflows/deploy.yml
```

### Further work before inviting real users

Review authentication redirects, password recovery, API rate limiting, privacy notices, error telemetry, account deletion, cloud data retention and data backups. The interest models are estimates, not regulated financial advice.

## Open the account screens

- [Sign in](https://lukefaulkner180.github.io/billora/?auth=login)
- [Create an account](https://lukefaulkner180.github.io/billora/?auth=signup)

On mobile, use the **Sign up** or **Sign in** buttons at the top of the dashboard. Account screens currently show a setup notice until a dedicated Billora Supabase project and the Google/Microsoft OAuth providers are configured. Do not enter real financial information yet.


## Brand assets

- `web/public/billora-symbol.svg`: approved icon asset for web UI and favicon
- `web/public/billora-original-logo.svg`: original, approved full lockup (best against a light background)
- `web/src/components/Brand.tsx`: accessible, high-contrast wordmark + approved icon for dark UI
- `web/src/pages/Welcome.tsx` and `web/src/welcome.css`: first-time visitor website and launch-preview information
