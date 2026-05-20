# Khazna AI MVP — Session Handoff

**Date:** 2026-05-20
**Branch:** `claude/setup-project-instructions-KY68b`
**Repo:** `kbayoumi561/khazna-ai-mvp`

---

## Completed Work

### Infrastructure
- **Supabase project created:** `support-analytics` — Project ID `qqqjkhshdqdiigybulbe`, region `eu-central-2`
- **Database schema applied:** All tables live — `roles`, `teams`, `user_profiles`, `conversations`, `messages`, `ai_analysis`, `audits`, `sync_logs`, `webhook_logs`, `settings`
- **RLS policies enabled** on `user_profiles`, `conversations`, `ai_analysis`
- **Vercel project deployed:** `khazna-ai-mvp-k4qm` — stable URL: `https://khazna-ai-mvp-k4qm.vercel.app`

### Application (Next.js 16 + Tailwind v4)
All 19 routes building and serving correctly:

| Route | Status |
|---|---|
| `/dashboard` | ✅ Live — KPI cards (conversations, FRT, quality, compliance) |
| `/conversations` | ✅ Live — Lists synced conversations with AI analysis join |
| `/audit` | ✅ Live — Approve/reject AI analyses |
| `/sync` | ✅ Live — Manual sync, auto-sync toggle, webhook URL |
| `/settings` | ✅ Live — OpenAI toggle, webhook secret, auto-sync |
| `/login` | ✅ Live — Supabase email/password auth |
| `/api/sync` | ✅ Deployed — calls Freshchat API (blocked, see Pending) |
| `/api/analyze` | ✅ Deployed — OpenAI GPT-4 analysis |
| `/api/dashboard` | ✅ Working |
| `/api/audit/*` | ✅ Working |
| `/api/webhooks/freshchat` | ✅ Deployed — HMAC signature verification |
| `/api/cron/sync-freshchat` | ✅ Deployed — runs daily at 06:00 UTC |
| `/api/test-freshchat` | ✅ Diagnostic endpoint (remove after Freshchat is fixed) |

### Vercel Environment Variables Set
All 7 variables configured in Vercel production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `FRESHCHAT_API_KEY`
- `FRESHCHAT_API_URL`
- `NEXT_PUBLIC_APP_URL`

---

## Pending Tasks

### 🔴 Critical — Freshchat API Connection

The Freshchat sync is failing because the correct API URL for this account hasn't been confirmed yet.

**Account type:** Freshworks CRM (myfreshworks.com), NOT standalone Freshchat  
**Dashboard URL:** `https://abgad-org.myfreshworks.com/crm/messaging/a/800650354796439/inbox/23/0`

**Attempts so far:**

| URL tried | Result |
|---|---|
| `https://api.freshchat.com` | Returned HTML frontend (wrong — missing `/v2`) |
| `https://api.freshchat.com/v2` | `403 Auth failure` |
| `https://abgad-org.freshchat.com/v2` | `fetch failed` — domain doesn't exist |

**Next action needed:**  
Find the correct API base URL from inside the Freshchat/Freshworks settings:
> Freshchat → Settings → API Settings → should show "Base URL" and "Auth Token"

Likely candidate URLs:
- `https://abgad-org.myfreshworks.com/crm/messaging/v2`
- Some other Freshworks-specific API endpoint

Once confirmed, update `FRESHCHAT_API_URL` in Vercel and redeploy.

### 🟡 Minor — Cleanup
- Remove `/api/test-freshchat/route.ts` diagnostic endpoint after Freshchat connection is confirmed working
- The Supabase project `test-anti` was **paused** to free up a free-tier slot — restore or delete it when no longer needed

---

## Architecture Decisions

### Tailwind v4 (CSS-first)
Project uses Next.js 16 which ships with Tailwind v4. All theme tokens (colors, radius, fonts) are defined in `app/globals.css` via `@theme {}` directive, NOT in `tailwind.config.ts`. The config file is intentionally empty.

### OpenAI Client — Lazy Init
`lib/openai.ts` creates the client inside the function (not at module level) to prevent build-time crashes when `OPENAI_API_KEY` isn't available during the Vercel build.

### Cron Schedule — Daily Only
`vercel.json` cron is set to `0 6 * * *` (daily at 06:00 UTC). The original design called for every-5-minutes (`*/5 * * * *`) but Vercel Hobby plan only allows daily crons. Upgrading to Vercel Pro restores 5-minute polling.

### Freshchat Integration — Three Methods
| Method | File | Status |
|---|---|---|
| Webhooks (real-time) | `app/api/webhooks/freshchat/route.ts` | ✅ Ready — configure URL in Freshchat dashboard |
| API Polling (cron) | `app/api/cron/sync-freshchat/route.ts` | ✅ Ready — runs daily |
| Manual sync | `app/api/sync/route.ts` | ⚠️ Blocked on Freshchat API URL |

---

## Important Constraints

| Constraint | Detail |
|---|---|
| Vercel Hobby plan | Max 1 cron/day. Upgrade to Pro for 5-min polling |
| Supabase free tier | Max 2 active projects. `test-anti` is paused to keep slot free |
| Freshworks CRM | Account uses `myfreshworks.com` — different API surface than standalone Freshchat |
| Auth | No middleware/session guard yet — pages are publicly accessible without login |

---

## Next Steps (in order)

1. **Fix Freshchat API URL** — find the correct REST API base URL from Freshchat/Freshworks settings
2. **Test manual sync** — use the Sync page to pull historical conversations
3. **Create first admin user** — go to Supabase dashboard → Authentication → Users → Invite
4. **Configure Freshchat webhook** — paste the webhook URL from the Sync page into Freshchat dashboard
5. **Remove diagnostic endpoint** — delete `app/api/test-freshchat/route.ts` once sync is working
6. **Add auth middleware** — protect all routes except `/login` using Supabase session check in `middleware.ts`
7. **(Optional) Upgrade Vercel to Pro** — enables 5-minute cron polling

---

## Key File Locations

```
app/
  (auth)/login/page.tsx          # Login page
  dashboard/page.tsx             # KPI dashboard
  sync/page.tsx                  # Freshchat sync UI
  audit/page.tsx                 # Audit workflow
  api/sync/route.ts              # Manual sync endpoint
  api/test-freshchat/route.ts    # Diagnostic (remove after fix)
lib/
  freshchat.ts                   # Freshchat API client + processConversation
  openai.ts                      # OpenAI analysis
  supabase.ts                    # Supabase browser client
vercel.json                      # Cron config (daily)
```
