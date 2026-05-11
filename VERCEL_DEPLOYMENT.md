# Vercel Deployment

This project was migrated from Cloudflare Workers to Vercel (custom Node SSR adapter).
**Lovable Publish no longer works for this project.** Deploy via Vercel only.

## How it works

- `vite build` produces:
  - `dist/client/` — static assets (HTML shell, JS, CSS, images)
  - `dist/server/server-entry.js` — TanStack Start SSR fetch handler
- `api/index.ts` is a Vercel serverless function (Node 20.x) that:
  1. Receives the Node `IncomingMessage` from Vercel
  2. Converts it to a Web `Request` (with streaming body)
  3. Calls `serverEntry.fetch(request, process.env, ctx)`
  4. Streams the Web `Response` back to the Node `ServerResponse`
- `vercel.json` rewrites all non-static URLs to `/api/index`, so every page
  request goes through SSR.

## Deploy

```bash
# First time
bunx vercel link
bunx vercel env pull .env.production.local

# Deploy preview
bunx vercel

# Deploy production
bunx vercel --prod
```

## Required env vars on Vercel

Set in Vercel Project Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL` (server-side)
- `SUPABASE_PUBLISHABLE_KEY` (server-side)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side, for `client.server.ts`)

## Known caveats

- Cold starts: each Vercel function invocation may pay an SSR import cost.
- The Node runtime cannot use Cloudflare-specific APIs (`env` bindings, KV, etc.)
  — none are used in this project, so this is fine.
- If `tanstackStart()` changes its build output path, update the import in
  `api/index.ts` and `includeFiles` in `vercel.json`.
- Edge runtime is not used; if you need it, swap `runtime: "nodejs20.x"` for
  `"edge"` and re-test (some npm deps may not be edge-compatible).
