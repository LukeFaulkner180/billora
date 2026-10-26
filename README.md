# Billora

Billora is a mobile-friendly personal bill tracker and debt repayment planner (Version 0.1).

**Demo / prototype only.** This version runs entirely in your browser: it has no account system, no secure cloud database, and no device syncing. Data is saved to your current browser's local storage. Avoid entering sensitive real-world financial information in this public prototype, especially on a shared device. The sample figures are fictional.

## View on GitHub Pages

1. Open **Settings > Pages** for this repository.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose **main**, folder **/(root)**, and tap **Save**.
4. The GitHub Pages URL is expected to be https://lukefaulkner180.github.io/billora/

## Included

- Overview dashboard with monthly incoming / outgoing figures and visualisations
- Recurring bill tracking and manual payment status
- Debt balances, repayments, interest estimates and progress
- Snowball and avalanche repayment comparison
- Income frequency support (weekly, four-weekly, monthly)
- Local export/import and reset of demo data
- Responsive phone and desktop layout

## Architecture

The website is a single static `index.html` that includes its CSS and JavaScript and requires no build step. This is intentional for the GitHub Pages preview. The next stage is a separately provisioned database, user authentication, proper privacy/security and account-based persistence. Do **not** connect this app to the existing DayRidge database.
