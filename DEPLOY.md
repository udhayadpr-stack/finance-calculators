# Deploying Finance Calculators for Free

The app is built with **Vite + React**, which can be easily hosted on any static site hosting service.

## Option 1: Vercel (Recommended)
1.  **Sign Up/Login** to [Vercel](https://vercel.com).
2.  **Import Your Project** (Crucial Step!):
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click the **Add New...** button and select **Project**.
    *   **Do NOT** use the "Clone Template" or "Clone from GitHub" search bar at the top (this tries to create a *new* copy).
    *   **Look at the list** under "Import Git Repository". You should see `finance-calculators` there.
    *   Click the **Import** button next to `finance-calculators`.
3.  **Configure Project**:
    *   **Project Name**: Leave as `finance-calculators`.
    *   **Framework Preset**: It should auto-detect `Vite`.
    *   **Root Directory**: Leave as `./`.
    *   **Build Command**: Leave as `vite build` (or `npm run build`).
    *   **Output Directory**: Leave as `dist`.
    *   Click **Deploy**.
4.  **Success**: Wait for the build to finish (about 1 minute). You will get a live URL ending in `.vercel.app`.

## Option 2: Netlify
1.  **Sign Up** to [Netlify](https://netlify.com).
2.  **Drag and Drop**:
    *   Run `npm run build` locally.
    *   Drag the generated `dist` folder to the Netlify Drop area.
3.  **Or Connect Git**: Push code to GitHub/GitLab and connect Netlify for auto-deploys.

## Option 3: GitHub Pages
1.  Build the project: `npm run build`.
2.  You can use the `gh-pages` package to deploy the `dist` folder to a `gh-pages` branch.
    *   `npm install gh-pages --save-dev`
    *   Add script in `package.json`: `"deploy": "gh-pages -d dist"`
    *   Run `npm run deploy`
