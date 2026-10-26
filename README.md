# Billora

**Billora** is a consumer-focused bill tracker and debt-free planning web app. This is Version 0.2, now structured with React, TypeScript and Vite.

> **Demo only.** No accounts, bank connections or secure cloud database yet. Information stays in browser storage on your device, is not synced, and may be lost when you clear browsing data. Do not enter bank account numbers or other sensitive details. Examples are fictional. Calculations are illustrations, not financial advice.

## Run it locally

You need Node.js 22.12+ and npm.

```bash
cd web
npm install
npm run dev
```

Open the local Vite URL. Validate the production site with `npm run build` and `npm run preview`.

## File structure

```text
billora/
├── index.html                # Original v0.1 fallback until Pages source changes
├── web/                      # React + TypeScript + Vite source
│   ├── package.json              # Libraries & commands
│   ├── vite.config.ts            # Build and GitHub Pages URL base
│   ├── src/
│   ├── main.tsx              # Starts React
│   ├── App.tsx               # Navigation, state and user actions
│   ├── types.ts              # Shared TypeScript shapes
│   ├── styles.css            # Original Billora design styles
│   ├── react-tweaks.css      # React interface refinements
│   ├── components/
│   │   ├── Icons.tsx         # Reusable icons
│   │   ├── Ui.tsx            # Buttons, headings, modal
│   │   └── FinanceForm.tsx   # Add/edit bill, debt, income, repayment
│   ├── pages/
│   │   ├── Overview.tsx      # Charts, summary and upcoming bills
│   │   ├── Bills.tsx         # Recurring bills
│   │   ├── Debts.tsx         # Credit cards / loans
│   │   ├── Planner.tsx       # Interactive debt-free plan
│   │   └── Settings.tsx      # Income, backups and reset
│   └── lib/
│       ├── money.ts          # Formatting, dates & recurrence
│       ├── planner.ts        # Debt calculation engine
│       └── storage.ts        # Example data, import/export & migration
│   └── public/icon.svg          # Site icon
└── .github/workflows/deploy.yml # Automated Pages build
```

## What works

- Monthly income and outgoing figures, bill category chart and upcoming payments.
- Add, edit, delete and mark recurring bills paid; weekly, four-weekly, monthly, quarterly, annually.
- Add/edit/delete debts, record repayments, see paid-off progress.
- Snowball vs avalanche simulator, APR and optional 0% offer end date.
- Multiple income sources and payment frequencies.
- Optional JSON import/export and reset. Recognises locally saved data from Version 0.1.
- Responsive screens for phones and desktops.

## Deploy to GitHub Pages

The root legacy `index.html` remains available while GitHub Pages uses *Deploy from a branch*. The repo includes a workflow to build the Vite app and deploy `dist/` on each push to `main`.

1. Go to **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment → Source**, select **GitHub Actions** (not *Deploy from a branch*).
3. Trigger or watch **Actions → Build and deploy Billora**.
4. Open `https://lukefaulkner180.github.io/billora/` once the Pages deployment is reported successful.

Vite's `base` is `/billora/`, so assets load correctly from a GitHub project Pages URL.

## Next stage: separate secure backend

For real users, create a **new Supabase project**, not the existing DayRidge project. Integrate authentication, PostgreSQL Row Level Security, data export/deletion, and user-owned records before allowing real personal finance storage. This demo has no Supabase connection, service key or bank link.

## Notes on projections

The planner assumes a constant budget of the sum of entered minimums plus extra monthly contributions. It accrues approximate interest monthly and directs excess payments toward the chosen debt. It doesn't simulate new charges, fees, changing lender minimums or all 0% offer terms. Users should always verify lender statements.
