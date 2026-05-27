# HomeReady AI

HomeReady AI is a premium-feeling first-time homebuyer assistant focused on Tennessee THDA Great Choice buyers. It includes privacy-first document storage, a phase tracker, checklist, glossary, affordability calculator, guest mode, optional Supabase persistence, and an AI assistant that is disabled by default.

## Stack

- Next.js 14 App Router
- Tailwind CSS
- Supabase auth and database
- Vercel AI SDK with optional Kimi / Moonshot AI
- PDF parsing with `pdf-parse`
- DOCX parsing with `mammoth`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
MOONSHOT_API_KEY=
KIMI_MODEL=kimi-k2.6
AI_FEATURES_ENABLED=false
NEXT_PUBLIC_AI_FEATURES_ENABLED=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Run the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

Guest mode works without Supabase keys. AI chat requires `MOONSHOT_API_KEY`, `AI_FEATURES_ENABLED=true`, and `NEXT_PUBLIC_AI_FEATURES_ENABLED=true`.

## Supabase Schema

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `conversations` with user ownership, soft delete, retention dates, and RLS
- `documents` with user ownership, redaction warnings, soft delete, retention dates, and RLS
- `checklist_items` with user ownership and RLS
- `updated_at` triggers and active-record indexes

For public launch, add a scheduled cleanup job that permanently deletes rows where `deleted_at is not null` or `retention_until < now()`.

## Deployment

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. In Supabase Auth, enable email/password signups.
4. In Supabase Auth URL Configuration, set:

- Site URL: your production domain, for example `https://homeready-ai.com`
- Additional Redirect URLs:
  - `http://localhost:3000/**`
  - your Vercel preview pattern, for example `https://*-your-team.vercel.app/**`

5. Push this repo to GitHub.
6. Import the GitHub repo into Vercel.
7. Use the Next.js framework preset. Vercel should auto-detect it.
8. Leave the build command as the default `next build`.
9. Add these Vercel environment variables to Production and Preview:

```bash
MOONSHOT_API_KEY=
KIMI_MODEL=kimi-k2.6
AI_FEATURES_ENABLED=false
NEXT_PUBLIC_AI_FEATURES_ENABLED=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

10. Deploy a preview build.
11. Test signup, login, checklist persistence, document upload, Kimi chat, clear chat, and document deletion.
12. Promote to production.

## Notes

- AI features are disabled by default. Do not enable them until you have reviewed consent, retention, redaction, and provider data-use rules.
- Document text injected into the assistant prompt is limited to 3,000 characters per document when AI is enabled.
- Uploads are limited to 10 MB and restricted to PDF, DOCX, JPG, PNG, WEBP, HEIC, and HEIF files.
- Uploaded document text is redacted for likely SSNs, routing-number-like values, and long account-number-like values before being stored and before any AI request.
- Chat and upload API routes include basic in-memory rate limits for family-app usage. Use Redis-backed rate limiting before public launch.
- Signed-in document, checklist, and conversation writes go through server routes instead of direct browser table writes.
- Users can clear chat history, delete uploaded documents, and clear guest data from the UI.
- Document review modes include General, Loan Estimate, Closing Disclosure, Pre-Approval Letter, Purchase Agreement, and Inspection Report.
- The app sets baseline production security headers in `next.config.mjs`.
- Image upload metadata is accepted, but OCR is not enabled in this local build.
- The checklist source lives in `constants/checklist.ts`.
- The system prompt builder lives in `lib/claude.ts`.
