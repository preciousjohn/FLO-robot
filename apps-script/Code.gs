// Google Apps Script that receives ratings from the study page
// and appends them to the sheet this script is attached to.
// Setup steps are in README.md.

const HEADER = ["session_id", "participant", "mode", "started", "finished",
  "position", "condition", "scale", "rating", "zone", "comment"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents);
    const rows = body.rows;
    if (!Array.isArray(rows) || !rows.length) return json({ ok: false, error: "no rows" });

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADER);

    // Skip a session that was already saved (same session_id).
    const last = sheet.getLastRow();
    if (last > 1) {
      const ids = sheet.getRange(2, 1, last - 1, 1).getValues().flat();
      if (ids.indexOf(String(body.sessionId)) !== -1) return json({ ok: true, duplicate: true });
    }

    const clean = rows.slice(0, 20).map(r =>
      HEADER.map((_, i) => {
        const v = r[i] == null ? "" : r[i];
        // Stop text that starts with = + - @ from being read as a formula.
        return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
      }));
    sheet.getRange(sheet.getLastRow() + 1, 1, clean.length, HEADER.length).setValues(clean);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
