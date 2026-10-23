# Finance Calculators & OrbitCalc

Two client-side projects. Calculations run locally; there is no application backend.

| Project | Purpose | Stack |
| --- | --- | --- |
| [Finance Web](./finance_web) | Indian salary/tax comparison, EPF, gratuity, EMI, SIP/lumpsum and foreclosure estimates | React 19, Vite 7, Tailwind CSS 4 |
| [OrbitCalc](./orbit_calc) | Math worksheet with variables, functions, units and locally saved lines | React Native, Expo SDK 54, TypeScript, mathjs |

Use Node.js **22.12 or later** (CI uses Node 24) and npm. Run commands from the relevant project directory:

```sh
cd finance_web
npm ci
npm run dev
```

```sh
cd orbit_calc
npm ci
npm start
```

Both projects provide `npm test` and `npm run lint`. Finance Web builds with `npm run build`; OrbitCalc additionally provides `npm run typecheck` and `npm run build:web`.

For Vercel, the root `vercel.json` installs and builds Finance Web from this repository's root. Setting Vercel's Root Directory to `finance_web` is also supported by its app-level configuration. See [deployment details](finance_web/README.md#deployment).

Read [calculation assumptions and official references](docs/CALCULATION_METHODS.md) before relying on estimates, and [the review record](docs/AUDIT.md) for validation and remaining limitations. The salary model is explicitly scoped to FY 2025–26 / AY 2026–27; rates are not updated from an external feed.

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under [MIT](LICENSE).
