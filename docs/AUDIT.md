# Repository review — 23 October 2026

Reviewed the tracked application code, calculation utilities, UI flows, configs, tests and project documentation in both projects. Base commit: `a016a83275bea213683779c378a304ad9059deef`.

## Issues corrected

- Salary tests used obsolete slabs; the engine omitted rebate marginal relief and surcharge. Deductions were uncapped, string deductions could concatenate, and default basic ratios differed between UI and engine. PT was incorrectly displayed as a new-regime tax deduction.
- EPF compounded interest monthly on newly deposited contributions, overstating projected balances. It attributed all starting funds to the employee, could subtract more EPS than the employer contributed, and labeled year-end age incorrectly.
- Gratuity rounded service into eligibility, treated total CTC as qualifying remuneration, and used the private-sector formula for government staff. Statutory payout limits and prior tax exemption were not modeled.
- Invalid, negative, non-finite or extreme inputs could produce misleading results or unbounded loops. Empty chart denominators displayed `NaN`. Numeric focus formatting could lose select-all selection during replacement; browser tests now cover this.
- Loan arithmetic lost precision at tiny interest rates; zero-tenure foreclosure omitted charges and GST fields. A zero-duration lumpsum disappeared.
- Theme storage exceptions could crash the app and two independent toggle instances could disagree. Tailwind v4 primary tokens were not registered. Unknown routes had no recovery screen; no deployment rewrite was tracked.
- OrbitCalc imported undeclared UUID/random-value modules, exposed no delete control despite having delete logic, accepted corrupt persisted cells, and could leak partial variable assignments from failed expressions. Function scope identity and storage-write failures are now covered by tests. The Expo export also crashed on startup because Zustand’s ESM `import.meta` was not transformed; the SDK 54 Babel setting is now enabled. Initial cell IDs no longer require browser crypto during server rendering. Both startup fixes are tested in a real browser.

## Enhancements

Tax-regime comparison, marginal-relief details, monthly EMI CSV export, SIP deposit timing, editable EPF/EPS assumptions, gratuity month/payout/exemption inputs, input accessibility, reduced-motion support, and a GitHub Actions workflow. Financial assumptions and primary references are in [CALCULATION_METHODS.md](CALCULATION_METHODS.md).

## Validation

- Finance: 110 unit/component tests, lint and production build pass.
- Finance: 12 Playwright scenarios pass across desktop, phone and tablet viewports, including all six calculator routes, direct loads/reloads, valid/invalid inputs, CSV download, service boundaries, theme persistence and navigation recovery.
- OrbitCalc: 13 engine/store tests, TypeScript, lint and Expo static web export pass.
- OrbitCalc: 2 Playwright scenarios pass against the exported web app, covering initial rendering, variable-dependent edits, persisted reloads, cell deletion and corrupt-storage recovery.
- Native Android/iOS builds and physical-device behavior have not been verified.

Local browser checks used Playwright with an alternate packaged Chromium executable because the standard browser download returned invalid archives in this environment. CI uses the standard Playwright-managed Chromium.

## Dependency status and remaining work

`npm audit` after compatible updates:

| Project | Before | After |
| --- | --- | --- |
| Finance Web | 20 findings, including 1 critical | 0 findings |
| OrbitCalc | 50 findings, including 2 critical | 25 findings: 22 high, 3 moderate; no critical |

These are dependency-tree counts, including indirect packages, not 25 distinct exploitable app bugs. Remaining Expo/RN chains involve `braces`/`micromatch`/Metro/Jest, `node-forge`/Expo signing, `image-size`, and `decode-uri-component`/routing. The audit reports no patched range for some underlying packages and incompatible framework replacements for others. Compatible lockfile updates and narrowly scoped PostCSS, ws and brace-expansion overrides were applied; no forced Expo/RN major migration was performed.

The mobile dependency audit step in CI is explicitly nonblocking and still emits its findings. A reviewed Expo/RN upgrade plus native build/device testing is required before claiming the mobile app is security-clean. The finance audit is a blocking CI check.

Financial estimates remain bounded models, with a clearly stated FY 2025–26 salary scope. They do not cover every employment category, state tax rule, bank policy or tax situation. The math worksheet is local-use software, not a sandbox for hostile remote expressions.
