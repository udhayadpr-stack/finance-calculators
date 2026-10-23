# Calculation methods and scope

Reviewed 23 October 2026. No live tax/rate feed is used. Defaults are assumptions and should be matched to payroll, scheme membership and lender documents. Monetary calculations retain precision internally; displayed figures round to rupees and CSV rows to paise, so sums of rounded display rows can differ slightly.

## Salary / tax

FY 2025–26 (AY 2026–27), resident individuals below 60, ordinary salary income only. New slabs: 0/5/10/15/20/25/30% at 4/8/12/16/20/24 lakh boundaries. Old slabs use the under-60 basic exemption. Standard deductions are ₹75,000 new and ₹50,000 old. The model includes applicable rebate, new-regime rebate marginal relief, surcharge relief and 4% cess.

80C input is the eligible total including employee EPF, capped at ₹1.5 lakh and at least the qualifying EPF amount within that cap. Additional NPS is capped at ₹50,000. 80D is an **eligible aggregate input**: users must apply their family/age sublimits; the engine only enforces the overall ₹1 lakh maximum. HRA and professional-tax deductions are old-regime only. The ₹208 monthly PT default is an editable annual-average assumption; it does not determine state liability. Employer overhead and gratuity provision percentages are CTC assumptions, not statutory employee deductions. Bonus is included in annual tax but excluded from regular monthly gross; tax is averaged over 12 months.

Not modeled: special-rate income, capital gains, senior-citizen slabs, nonresident treatment, other income/losses, all Chapter VI-A deductions, tax-return rounding or individual payroll timing. Manual components can exceed entered CTC; the UI reports the variance.

Sources: [Income Tax Department AY 2026–27 rates, deductions, surcharge and relief](https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1); [Income Tax Department Budget 2025 rebate/marginal-relief FAQ](https://www.incometaxmumbai.gov.in/wp-content/uploads/2025/02/faqs-on-personal-income-tax-reforms-with-special-focus-on-middle-class.pdf).

## EPF

Monthly contributions are added after calculating interest on the opening balance. Accrued interest is added at March end and at the projection end; it does not compound within the financial year. The start-month selector handles partial financial years. Wage increments occur after each 12 months from the projection start. The entered opening balance is separate from projected employee contributions.

EPS defaults to membership with a configurable ₹15,000 wage ceiling, 8.33% rounded to rupees, limited to the actual employer contribution. The remainder goes to employer EPF. Nonmembers and modeled months at/after age 58 put all employer contributions into EPF. The ceiling is an assumption, not a claim of current eligibility; confirm applicable limits with payroll. Interest remains fixed at the entered rate. The estimate retains fractional rupees internally; official posting rounds credits. Withdrawals, historical uncredited interest, higher-pension elections and tax on high employee contributions are excluded.

Source: [EPF Scheme, paragraphs 29 and 60](https://pmvbry.epfindia.gov.in/employees-provident-funds-scheme/); [EPS Scheme](https://pmvbry.epfindia.gov.in/eps-scheme/).

## Gratuity

Covered private employment uses employer-confirmed qualifying monthly wages. An optional 50% floor uses **qualifying remuneration**, not total CTC. Check the composition with payroll, including statutory employer PF/pension/bonus and excluding gratuity, ESI and other retirement benefits.

Ordinary eligibility is five actual years. Count completed years plus one only when the remainder exceeds six months. Fixed-term eligibility is one actual year, with pro-rata service thereafter. The private statutory estimate is wages × 15/26 × counted service, capped at ₹20 lakh. An actual-payout override supports better contractual awards. Exemption is the least of actual receipt, formula entitlement and the remaining ₹20 lakh lifetime allowance after prior exemption.

The central-government option is a retirement estimate using a quarter month's basic plus DA for completed half-years, limited to 16.5 months and ₹25 lakh. Eligible government gratuity is treated as exempt. State government, PSU, uncovered establishments, death/disability, seasonal work, disputed continuity and exact payroll tax interpretations require separate treatment.

Sources: [Ministry of Labour January 2026 FAQ](https://www.labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf); [March 2026 clarification](https://www.labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf); [Pensioners' Portal retirement formula](https://pensionersportal.gov.in/retire-benefit.aspx); [PIB ₹25 lakh ceiling update](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2022470). The older ₹20 lakh government limit on the portal is superseded by that PIB notification.

## Loans and investment growth

EMI is a fixed-rate, reducing-balance monthly annuity. Years are rounded to the nearest whole month; the final principal payment clears residual floating-point balance. No intermediate rounding is imposed.

Foreclosure applies the entered fee to outstanding principal and GST to that fee, even if remaining tenure is zero. Zero months means immediate principal repayment for the continuation comparison. The result compares nominal totals; it omits accrued daily interest, other charges, time value, opportunity cost and liquidity. It does not determine bank eligibility or recommend closing a loan.

SIP uses annual nominal return / 12 and either beginning- or end-of-month deposits. Lumpsum uses annual compounding. At zero duration a lumpsum retains its principal; SIP has no deposits. Projections exclude taxes, fees and inflation and do not promise returns.

Amounts are bounded to ₹1 trillion; rates/durations are bounded to prevent overflow or unbounded loops. Invalid inputs return an explicit error alongside empty result fields.
