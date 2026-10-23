# FinCalc

Six financial planning calculators: salary, EPF, gratuity, EMI, mutual funds, and loan foreclosure. All calculations run in the browser. Values use Indian rupee formatting.

## Development

From this directory, with Node.js 22.12+:

```sh
npm ci
npm run dev
```

## Checks

```sh
npm run lint
npm test
npm run build
npm audit
npx playwright install chromium
npm run test:e2e
```

The browser suite uses the production preview and checks desktop, phone and tablet viewports. Build before running it. `npm run test:watch` starts interactive unit tests.

## Features and assumptions

- Compare old and new regime salary tax for FY 2025–26, including rebate, marginal relief, surcharge and cess. Manual salary components remain available, with reconciliation warnings.
- EPF projections separate opening funds, future employee deposits, employer EPF and interest. EPS membership, wage ceiling and contributions are editable.
- Gratuity uses actual service eligibility, completed months, an optional qualifying-remuneration wage floor, central-government retirement rules, actual employer payout and prior exemption inputs.
- EMI includes a yearly summary and monthly CSV export.
- SIP supports beginning/end-of-month contributions. Lumpsum uses annual compounding.
- Foreclosure compares nominal payment totals and displays charges inclusive of configurable GST.

The calculators are estimates with explicit scope, not payroll or lender settlement quotations. See [methods and sources](../docs/CALCULATION_METHODS.md).

## Deployment

Set Vercel's **Root Directory** to `finance_web`, build command to `npm run build`, and output directory to `dist`. `vercel.json` rewrites app routes so `/emi`, `/pf`, etc. work when opened directly or refreshed. Other static hosts need an equivalent fallback to `index.html`.

`npm run preview` serves the production build locally.
