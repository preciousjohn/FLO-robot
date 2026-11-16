# FLO Robot: video rating study

A single-page rating tool for the robot video study. Participants watch 5 videos and rate each one on a slider. Each finished session is saved to Airtable through a small Vercel function (`api/submit.js`), so the Airtable token never reaches the browser.

## Links

- **Participants:** `https://<your-vercel-domain>/`
- **Facilitator:** `https://<your-vercel-domain>/#facilitator`. Shows the video-order toggle, sessions saved on this device, and a box for pasting backup answer codes.

## 1. Set up Airtable

1. Create a base, for example "FLO Robot", with a table named **Responses**.
2. Add these fields. Names must match exactly.

   | Field | Type |
   |---|---|
   | session_id | Single line text (make it the primary field) |
   | participant | Single line text |
   | mode | Single line text |
   | started | Single line text |
   | finished | Single line text |
   | position | Number |
   | condition | Single line text |
   | scale | Single line text |
   | rating | Number |
   | zone | Single line text |
   | comment | Long text |

3. Create a personal access token at airtable.com/create/tokens.
   - Scopes: `data.records:read` and `data.records:write`
   - Access: only this base
4. Copy the base ID from the base URL. It starts with `app`.

## 2. Deploy on Vercel

1. vercel.com → **Add New → Project** → import `preciousjohn/FLO-robot`. Framework preset: **Other**. Leave build settings empty.
2. Before deploying, open **Environment Variables** and add:
   - `AIRTABLE_TOKEN`: your token
   - `AIRTABLE_BASE`: your base ID (`app…`)
   - `AIRTABLE_TABLE`: `Responses`
3. Click **Deploy**. Every push to `main` redeploys the site. If you add or change the variables later, redeploy so they take effect.

Each session adds one record per video. If the same session is sent twice, the second copy is skipped.

If a save fails, the participant sees an answer code. They paste it into the chat. You paste it into **Add a remote participant's answers** on the facilitator link, and it goes to Airtable.

## Change the study

The videos and scale wording are at the top of the `<script>` in `index.html`, in `VIDEOS` and `SCALES`.
