# Going live — Vercel + your domain

Add `vercel.json` to the project root first. Your `public/_headers` file is read
by Cloudflare Pages and Netlify but **ignored by Vercel**, so without this the
site ships with no security headers and no cache policy.

Total time: about 30 minutes, most of it waiting for DNS.

---

## 1. Check the build passes locally

```bash
npm run build
npm run preview
```

Open the preview URL and click into a mission. If it works here it will work on
Vercel.

**`npm run build` takes 8–10 minutes** — it verifies all 100 missions before
building. That is deliberate: unverified content cannot be deployed. It is not a
hang.

---

## 2. Push to GitHub

Vercel deploys from a repository.

```bash
git init
git add .
git commit -m "CodeRealm"
git branch -M main
git remote add origin https://github.com/YOURNAME/code-runner.git
git push -u origin main
```

Confirm before pushing that `.env.local` is **not** in the commit — `.gitignore`
already excludes it, but check:

```bash
git ls-files | Select-String "env"
```

Only `.env.example` should appear.

---

## 3. Import into Vercel

1. [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project**
2. Import the repository.
3. Vercel reads `vercel.json`, so the settings should already be right:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Do not deploy yet.** Add the environment variables first (next step) — a
   build without them produces a site with no sign-in button.

---

## 4. Environment variables

Still on the import screen, expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://gabhksxkwnjyiimixfxh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your `anon public` key |
| `VITE_PISTON_URL` | `default` — only if you want C, C++, Java etc. |

Apply each to **Production, Preview and Development**.

> **Only the `anon` key.** The `service_role` key on the same Supabase page
> bypasses Row Level Security completely. Anything prefixed `VITE_` is compiled
> into the JavaScript bundle and is public by definition — treat every one of
> these as visible to the world. The anon key is designed for exactly that and is
> protected by the policies you already ran.

Now click **Deploy**. First build takes a few minutes because of content
verification. You get a `your-project.vercel.app` URL.

**Test that URL before touching DNS.** Sign up with a real address, clear level 1,
and confirm it appears in Supabase under Table Editor → `mission_progress`.

---

## 5. Connect your domain

**In Vercel:** Project → Settings → Domains → add `yourdomain.com`. Add
`www.yourdomain.com` too; Vercel will offer to redirect one to the other — point
`www` at the apex.

Vercel then shows the exact records to create. Typically:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

**Use the values Vercel shows you**, not these — they change.

**At your registrar:** open DNS management and add those records. If records
already exist for `@` or `www`, replace them rather than adding duplicates.

Propagation is usually 10–60 minutes, occasionally up to 48 hours. Vercel's
domain page shows a live status. HTTPS is issued automatically once DNS
resolves — nothing to configure.

---

## 6. Point Supabase at the real domain

**This is the step people forget.** Until it is done, sign-up confirmation emails
will send people back to `localhost`.

Supabase → Authentication → **URL Configuration**:

- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:** add `https://yourdomain.com/**` and
  `https://your-project.vercel.app/**`

Also check **Authentication → Providers → Email**: decide whether to require
email confirmation. With it on, new players must click a link before their first
sign-in. With it off, sign-up logs them straight in — less friction, more junk
accounts.

---

## 7. Verify on the live domain

- [ ] Landing page loads, **Begin at Sector 1** works
- [ ] Level 1 opens, **Run** passes, **Submit** clears it
- [ ] The save prompt appears after that first clear
- [ ] Sign up → the level-1 progress you already earned is still there
- [ ] Sign in on your phone → same progress, same XP
- [ ] Switch the language dropdown to Python — the runtime downloads and runs
- [ ] If `VITE_PISTON_URL` is set: submit one C++ solution and watch it pass
- [ ] Open DevTools → Console → no CSP violations in red

---

## Afterwards

**Every push to `main` redeploys automatically.** Pull requests get their own
preview URL, which is a good way to test content changes before they go live.

**Adding missions later is a content push, not a rebuild** — write the mission,
run `npm run content:verify`, commit, push.

**If a build fails on Vercel**, it is almost always content verification
rejecting a mission. The log names the level and the reason.

---

## Cost

| | |
|---|---|
| Vercel Hobby | Free — fine for this traffic |
| Supabase free tier | Free — this app stores a few kilobytes per player |
| Piston public API | Free, rate limited |
| Your domain | Whatever you already pay |

Nothing here costs money until you outgrow the free tiers. The first thing to hit
a limit will be the Piston rate limit if compiled languages get popular; the fix
is self-hosting Piston, or your own Judge0 instance for a few dollars a month.
