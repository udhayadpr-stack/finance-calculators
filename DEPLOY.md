# Deploying Finance Calculators for Free

The app is built with **Vite + React**, which can be easily hosted on any static site hosting service.

## Option 1: Vercel (Recommended)
1.  **Sign Up/Login** to [Vercel](https://vercel.com).
2.  **Import Porject**:
    *   If you have the code on GitHub: Connect GitHub and select the repo.
    *   Manual: Install Vercel CLI (`npm i -g vercel`) and run `vercel` in the project folder.
3.  **Settings**:
    *   Framework Preset: `Vite`
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
4.  **Deploy**: Click deploy. It's free forever for personal use.

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
