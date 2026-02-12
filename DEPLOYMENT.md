# Deployment Guide

Second Mind deploys to **Vercel** (frontend + API) and **Supabase Cloud** (database + auth).

## 1. Create Supabase Cloud Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Note the project URL and keys from Settings > API

## 2. Link Local Project to Cloud

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

## 3. Push Migrations

```bash
npx supabase db push
```

This applies all migrations from `supabase/migrations/` to the cloud database.

## 4. Seed Memory Files

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
npx tsx scripts/seed-memory.ts
```

## 5. Create User Account

```bash
npx tsx scripts/create-user.ts your@email.com your-password
```

## 6. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and import the GitHub repository
2. Vercel auto-detects Next.js and configures the build
3. No `vercel.json` is needed

## 7. Set Environment Variables in Vercel

Go to Project Settings > Environment Variables and add:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | From Supabase Settings > API |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | From Anthropic console |
| `ROUTER_MODEL` | `claude-haiku-4-5-20251001` | Optional, this is the default |
| `GENERATION_MODEL` | `claude-sonnet-4-5-20250929` | Optional, this is the default |

## 8. Set GitHub Secrets for CI/CD

Go to GitHub repo Settings > Secrets and Variables > Actions:

| Secret | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Used in CI build step |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Used in CI build step |
| `SUPABASE_SERVICE_ROLE_KEY` | Used in CI build step |
| `SUPABASE_ACCESS_TOKEN` | For `supabase db push` in deploy workflow |
| `SUPABASE_DB_PASSWORD` | For `supabase db push` in deploy workflow |

## 9. Push to Main

```bash
git push origin main
```

The CI workflow runs lint + build. The deploy workflow additionally runs `supabase db push --linked` to apply any new migrations.

## 10. Verify

1. Visit your Vercel deployment URL
2. Sign in with the credentials from step 5
3. Press `⌘K` and ask a question

## Troubleshooting

**Build fails with env var errors:**
Ensure all `NEXT_PUBLIC_*` variables are set in Vercel. These are needed at build time.

**Auth returns 401:**
Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` point to the correct Supabase project.

**LLM returns errors:**
Verify `ANTHROPIC_API_KEY` is valid and has sufficient credits.

**Database migrations fail:**
Run `npx supabase db push` locally first to test. Check that `SUPABASE_ACCESS_TOKEN` has the correct permissions.
