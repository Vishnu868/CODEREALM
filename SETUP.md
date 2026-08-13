# Setup & Deployment

Everything here is free. There is no server to pay for, because player code runs in the
player's own browser.

---

## 1. Requirements

- **Node.js 18 or newer** (check with `node -v`) — [nodejs.org](https://nodejs.org)
- Any modern browser

That is the whole list. No Docker, no database, no API keys.

---

## 2. Run it locally

```bash
npm install     # once, ~30 seconds
npm run dev
```

Vite prints a local URL, normally `http://localhost:5173`. Open it.

To try the loop end to end:

1. Click node **1** on the map → **Accept mission**
2. Write the solution in the editor
3. **Run** (or `Ctrl+Enter`) — checks the visible tests, costs nothing
4. **Submit** (or `Ctrl+Shift+Enter`) — hidden tests, rating, XP, unlock
5. Clear levels 1, 2 and 3 without a failed submission → **Energy Cell** at streak 3

Switch the language dropdown to Python and the ~6 MB runtime downloads once, in the
background, with a status message. It is cached by the browser after that.

### Available commands

| Command | Does |
|---|---|
| `npm run dev` | Builds content, then starts the dev server with hot reload |
| `npm run build` | Verifies content, builds it, then builds the app into `dist/` |
| `npm run preview` | Serve the production build locally at `:4173` |
| `npm run content:new -- 6 "Title"` | Scaffold a new mission folder |
| `npm run content:verify` | Validate every mission. Exits non-zero on failure. |
| `npm run content:measure` | Measure reference timings and the Python weight |
| `npm run content:build` | Emit `public/content/` for the game to fetch |

`npm run build` will not produce a bundle if any mission fails verification. That is
deliberate — see [CONTENT.md](CONTENT.md).

Always run `npm run preview` before deploying — it is the only way to confirm the workers
and code-splitting behave in a production build.

---

## 3. Environment variables

**None are required.** With no credentials the game runs fully offline — browser-local
progress, no login button, and none of the Supabase SDK downloaded.

To turn accounts on:

```bash
cp .env.example .env.local     # .env.local is gitignored
```

Rules that do not bend:

- Never commit `.env` or `.env.local`. `.gitignore` already excludes them.
- Only `VITE_`-prefixed variables reach the browser, and **anything with that prefix is
  public** — it ships inside the JavaScript bundle. A Supabase *anon* key is designed for
  this. A Supabase *service role* key is not, and must never appear in this project.
- Set production values in your host's dashboard, never in the repository.

---

## 4. Accounts (optional, free tier)

Skip this section entirely if you want a single-device game.

1. Create a project at [supabase.com](https://supabase.com). The free tier is ample: this
   app stores a few kilobytes per player.
2. **SQL Editor → New query**, paste all of `supabase/001_schema.sql`, and run it. It
   creates the tables, the Row Level Security policies, and two triggers — one that creates
   a profile on signup, one that rejects a cleared level whose predecessors are not
   cleared. It is safe to re-run.
3. **Project Settings → API**, copy the **Project URL** and the **anon public** key into
   `.env.local`:

   ```
   VITE_SUPABASE_URL=https://yourproject.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Authentication → Providers**, confirm Email is enabled. Decide whether you want email
   confirmation on; with it off, sign-up logs the player straight in.
5. **Authentication → URL Configuration**, add your production domain to the redirect
   allow-list.
6. Restart the dev server. A **Sign in** button appears in the HUD.

> **Only ever use the `anon` key here.** It is designed to be public and is protected by
> the RLS policies in the schema. The `service_role` key bypasses RLS entirely and must
> never appear in a browser application. See [SECURITY.md](SECURITY.md).

Set the same two variables in your host's dashboard for production.

### What syncing does and does not guarantee

Progress is written locally first and pushed in the background, so gameplay never waits on
the network, and a dropped connection loses nothing. Progress earned before signing up is
merged into the cloud save on first login — the higher value wins on every field.

This is **not** server-side verification. Progression is computed in the browser because
execution is. The database enforces ownership and level ordering, which stops casual
tampering; it cannot stop a determined one. SECURITY.md explains why that is the right
trade for this product.

---

## 5. Deploy to Cloudflare Pages (recommended, free)

Cloudflare Pages has no bandwidth cap on the free tier, which matters if the site gets
popular.

1. Push this repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repository and set:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy.** You get a `*.pages.dev` URL in a minute or two.

Every push to your main branch redeploys automatically.

### Netlify or Vercel instead

Same three settings — build command `npm run build`, output directory `dist`, framework
Vite. All three free tiers are fine for a static site of this size.

---

## 6. Connect your own domain

### On Cloudflare Pages

1. Open your Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `yourdomain.com`. Repeat for `www.yourdomain.com` if you want both.
3. If your domain's nameservers are already at Cloudflare, records are created for you.
   Otherwise Cloudflare shows the exact record to add at your registrar:
   - apex `yourdomain.com` → **CNAME** to `your-project.pages.dev`
     (Cloudflare flattens the CNAME at the apex; on other hosts you may be given an **A**
     record instead)
   - `www` → **CNAME** to `your-project.pages.dev`
4. Wait for DNS to propagate — usually minutes, occasionally a few hours.

### HTTPS

Certificates are issued and renewed automatically on all three hosts. Nothing to
configure. Once the certificate is live, turn on **Always Use HTTPS** so `http://` visits
redirect.

### CORS

Not applicable in Phase 1 — the app makes no cross-origin API calls of its own. The only
external request is Pyodide from `cdn.jsdelivr.net`, which serves permissive CORS headers.

If you add a backend in Phase 3, its allowed-origins list must contain your production
domain (and `http://localhost:5173` **only** in your development environment).

---

## 7. Optional: self-host Pyodide

By default Python is fetched from jsDelivr. To remove that third-party dependency:

1. Download the Pyodide release matching `PYODIDE_VERSION` in
   `public/py-runner.worker.js` from the Pyodide GitHub releases page.
2. Unpack it to `public/pyodide/`.
3. Change `PYODIDE_URL` in that file to `/pyodide/`.

Cost: your build output grows by several hundred MB and deploys get slow. Benefit: no
external CDN, and Python works offline. The CDN is the better default for most people.

---

## 8. Security headers

**Already configured.** `public/_headers` ships a CSP plus nosniff, frame-deny, referrer
and permissions policies, and a cache policy (immutable hashed assets, short-lived
revalidated content). Cloudflare Pages and Netlify both apply it automatically; on Vercel,
translate it into `vercel.json` headers.

`'wasm-unsafe-eval'` is required and cannot be removed — Pyodide is WebAssembly, and the
JavaScript runner evaluates player code by design. Read [SECURITY.md](SECURITY.md) to
understand what that means before deploying.

If you enable accounts, the `connect-src` directive already allows `https://*.supabase.co`.

---

## 9. Troubleshooting

**Python never finishes loading.** The jsDelivr CDN is blocked or offline. JavaScript
missions are unaffected. Check the browser console; consider self-hosting Pyodide (§6).

**"No function named … was found."** The entry function was renamed. Keep the name from
the starter template — that is what the test harness calls. **Reset code** restores it.

**Progress vanished.** Without an account, progress lives in this browser's localStorage —
clearing site data, private browsing, or a different browser all mean a fresh save. Sign in
to sync it across devices (§4).

**"level N cannot be cleared before levels 1..N-1".** The database trigger rejected a
progress write because earlier levels are not marked cleared for that account. This is the
integrity guard doing its job; it usually means local and cloud progress diverged. Clearing
the earlier level resolves it.

**Sign-in works but nothing syncs.** Check that `001_schema.sql` ran completely — if the
RLS policies exist but the tables were created in a different schema, reads return empty.
The Profile panel surfaces the last sync error.

**"Could not load campaign content".** `public/content/` has not been generated. Run
`npm run content:build`. It is gitignored on purpose: it is a build artifact of
`content/`, which is the source of truth.

**Worker fails to load in production.** The workers must be served from the site root as
static files. They live in `public/`, which Vite copies to `dist/` verbatim — do not move
them into `src/`.

**Timeout on a solution you believe is correct.** The wall-clock limit is 5 s (×4 for
Python). At 200,000 elements, a nested loop will not finish. That is the performance gate
doing its job.
