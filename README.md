# FLO Robot: video rating study

A single-page rating tool for the robot video study. Participants watch 5 videos and rate each one on a slider. Every finished session is added to a Google Sheet as it comes in.

## Links

- **Participants:** `https://<your-vercel-domain>/`
- **Facilitator:** `https://<your-vercel-domain>/#facilitator`. Shows the video-order toggle, sessions saved on the device, and a box for pasting backup answer codes.

## Connect the Google Sheet (one time, about 5 minutes)

1. Create a new Google Sheet, for example "FLO Robot ratings".
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete what's there, paste in the contents of `apps-script/Code.gs`, and save.
4. Click **Deploy → New deployment**. Choose type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, approve the permissions, and copy the **Web app URL**. It ends in `/exec`.
6. In `index.html`, paste the URL into `const SHEET_ENDPOINT = "";`, then commit. Vercel redeploys on its own.

Each session adds one row per video, with these columns: session_id, participant, mode, started, finished, position, condition, scale, rating, zone, comment. If the same session is sent twice, the second copy is skipped.

If a save fails, the participant sees an answer code. They paste it into the chat. You paste it into **Add a remote participant's answers** on the facilitator link, and it goes to the sheet.

## Deploy on Vercel

1. Go to vercel.com → **Add New → Project** and import `preciousjohn/FLO-robot`.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**. Every push to `main` redeploys the site.

## Change the study

The videos and scale wording are at the top of the `<script>` in `index.html`, in `VIDEOS` and `SCALES`.

## Note

Anyone with the Apps Script URL can add rows to the sheet. That's fine for a study, but don't post the URL publicly. Remove junk rows by hand if any show up.
