# Job Farming Command Center

## What it is
The live system behind the job search. Supabase holds the data. Next.js on Vercel is the dashboard. Grok bots handle applications, LinkedIn outreach, and email status updates. The owner still approves important sends.

## What it does
- Tracks jobs, applications, documents, and hiring stage in one place.
- Watches Gmail for interviews, assessments, rejections, and recruiter notes, then updates stage from clear evidence.
- Drafts LinkedIn connection notes and replies, sends them after approval or in auto mode, and keeps a thread timeline.
- Fetches live LinkedIn threads on demand so a message shows before the Gmail notification arrives.
- Shares a tailored resume when a recruiter asks, with the file attached on the draft.

## Stack
Next.js, React, Supabase Postgres, Supabase Storage, Vercel, Gmail API, LinkedIn browser automation, Grok bots.

## Public URL
https://job-farming-dashboard.vercel.app
