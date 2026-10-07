// Antonio's checklist answers (Vercel Function, Node.js runtime, web-standard fetch export).
//
//   GET /api/answers  -> 200 { answers: { [id]: { value, note, updatedAt } } }
//   PUT /api/answers  body { id, value, note, updatedAt }
//                     -> 200 { ok: true, saved: { value, note, updatedAt }, stale: boolean }
//      stale: true when the store already held a newer answer for that item (by updatedAt);
//      the newer one is kept and returned in `saved`. Last write per item wins.
//   400 bad input, 405 other methods, 413 body over 16 KB, 503 no database, 502 database error.
//
// Input rules: id must be a known item (api/_items.js); value and note are strings of at
// most 2,000 characters; updatedAt is a whole number of milliseconds since 1970 and not
// more than a day ahead of the server clock. Fact items take "" | "yes" | "no:<right
// answer>", photo shots "" | "can" | "cant", open questions any string. Stored text is
// only ever returned as JSON; the page puts it into form fields, never into HTML.
import { ITEMS } from "./_items.js";
import { getStore } from "./_store.js";

const MAX_TEXT = 2000;
const MAX_BODY = 16 * 1024;
const DAY = 24 * 60 * 60 * 1000;
const FIELDS = new Set(["id", "value", "note", "updatedAt"]);

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });

function invalid(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Body must be a JSON object";
  for (const k of Object.keys(body)) if (!FIELDS.has(k)) return `Unknown field: ${k.slice(0, 40)}`;
  const { id, value, note, updatedAt } = body;
  if (typeof id !== "string" || !Object.hasOwn(ITEMS, id)) return "Unknown item id";
  if (typeof value !== "string") return "value must be a string";
  if (value.length > MAX_TEXT) return `value over ${MAX_TEXT} characters`;
  if (note !== undefined && typeof note !== "string") return "note must be a string";
  if (typeof note === "string" && note.length > MAX_TEXT) return `note over ${MAX_TEXT} characters`;
  if (!Number.isSafeInteger(updatedAt) || updatedAt <= 0) return "updatedAt must be a positive whole number (ms)";
  if (updatedAt > Date.now() + DAY) return "updatedAt is in the future";
  const kind = ITEMS[id];
  if (kind === "fact" && !(value === "" || value === "yes" || value.startsWith("no:"))) return 'Fact value must be "", "yes" or "no:<answer>"';
  if (kind === "shot" && !["", "can", "cant"].includes(value)) return 'Shot value must be "", "can" or "cant"';
  return null;
}

// Only well-formed records for known items go back to the page.
const clean = (rec) =>
  rec && typeof rec.value === "string" && Number.isSafeInteger(rec.updatedAt)
    ? { value: rec.value, note: typeof rec.note === "string" ? rec.note : "", updatedAt: rec.updatedAt }
    : null;

async function handle(request) {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "PUT") return json(405, { error: "Use GET or PUT" }, { Allow: "GET, PUT" });

  const got = getStore();
  if (got.error) return json(503, { error: got.error });
  const { store } = got;

  try {
    if (method === "GET") {
      const all = await store.all();
      const answers = {};
      for (const [id, rec] of Object.entries(all)) {
        const c = Object.hasOwn(ITEMS, id) && clean(rec);
        if (c) answers[id] = c;
      }
      return json(200, { answers });
    }

    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { error: "Body too large" });
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, { error: "Body is not valid JSON" });
    }
    const why = invalid(body);
    if (why) return json(400, { error: why });

    const rec = { value: body.value, note: body.note ?? "", updatedAt: body.updatedAt };
    // Compare and write in one step in the store, so two overlapping saves keep the newer answer.
    const kept = await store.putIfNewer(body.id, rec);
    if (kept) return json(200, { ok: true, saved: clean(kept) ?? rec, stale: true });
    return json(200, { ok: true, saved: rec, stale: false });
  } catch (err) {
    console.error("answers store error:", err);
    return json(502, { error: "Database error, try again" });
  }
}

export default { fetch: handle };
