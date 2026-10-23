# OrbitCalc

A math worksheet for Android, iOS and web, built with Expo SDK 54. Enter expressions on separate lines, define variables/functions, and work with units. Earlier lines supply variables to later lines.

```sh
npm ci
npm start
```

Requires Node.js 22.12+. Use `npm run android`, `npm run ios`, or `npm run web` for the respective development target.

```sh
npm test
npm run typecheck
npm run lint
npm run build:web
npx playwright install chromium
npm run test:e2e
```

The browser suite checks the actual exported app, including startup, persistence and deletion. The Babel configuration enables the Expo SDK 54 `import.meta` transform required by Zustand’s ESM middleware.

The worksheet is saved in local device/browser storage. Deleting a line recalculates dependents; deleting the last line leaves a blank worksheet. Saved data is validated on load, and a storage error leaves an editable session. Share opens the device share interface.

A failed expression does not commit its partial assignments. Engine mutation helpers are blocked and each expression has a length limit. This is still a local, interactive math engine, **not an isolation boundary for untrusted remote workloads**; expensive expressions can consume substantial CPU/memory.

Native Android/iOS device validation remains required before a mobile release. See [the audit record](../docs/AUDIT.md) for remaining Expo dependency advisories. Do not run `npm audit fix --force` without a planned SDK migration and native validation.

The legacy `reset-project` command is a destructive development helper; it is not part of normal application use.
