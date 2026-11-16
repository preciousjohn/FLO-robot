// Vercel serverless function: receives one finished session from the page
// and adds one Airtable record per rated video.
// Needs these environment variables in Vercel:
//   AIRTABLE_TOKEN  personal access token (scopes: data.records:read, data.records:write)
//   AIRTABLE_BASE   base id, starts with "app"
//   AIRTABLE_TABLE  table name, e.g. "Responses"

const FIELDS = ["session_id", "participant", "mode", "started", "finished",
  "position", "condition", "scale", "rating", "zone", "comment"];
const NUMERIC = new Set(["position", "rating"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const { AIRTABLE_TOKEN, AIRTABLE_BASE, AIRTABLE_TABLE } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE || !AIRTABLE_TABLE) {
    return res.status(500).json({ ok: false, error: "Airtable is not configured" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const rows = body && Array.isArray(body.rows) ? body.rows.slice(0, 10) : [];
  const sessionId = body && String(body.sessionId || "").slice(0, 120);
  if (!rows.length || !sessionId) return res.status(400).json({ ok: false, error: "No rows" });

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`;
  const headers = { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" };

  try {
    // Skip a session that was already saved.
    const safeId = sessionId.replace(/["\\]/g, "");
    const check = await fetch(`${url}?maxRecords=1&filterByFormula=${encodeURIComponent(`{session_id}="${safeId}"`)}`, { headers });
    if (!check.ok) return res.status(502).json({ ok: false, error: `Airtable check failed (${check.status})` });
    if ((await check.json()).records?.length) return res.status(200).json({ ok: true, duplicate: true });

    const records = rows.map(r => {
      const fields = {};
      FIELDS.forEach((name, i) => {
        const v = Array.isArray(r) ? r[i] : undefined;
        if (v === undefined || v === null || v === "") return;
        if (NUMERIC.has(name)) {
          const n = Number(v);
          if (Number.isFinite(n)) fields[name] = n;
        } else {
          fields[name] = String(v).slice(0, name === "comment" ? 4000 : 200);
        }
      });
      fields.session_id = safeId;
      return { fields };
    });

    const save = await fetch(url, { method: "POST", headers, body: JSON.stringify({ records, typecast: true }) });
    if (!save.ok) {
      const detail = await save.text();
      return res.status(502).json({ ok: false, error: `Airtable save failed (${save.status})`, detail: detail.slice(0, 300) });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "Couldn't reach Airtable" });
  }
}
