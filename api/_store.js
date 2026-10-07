// Where answers live. Production: one Upstash Redis hash, `flomaster:answers`, one field
// per item id holding JSON { value, note, updatedAt }. Local testing only: a Map, and only
// when FLOMASTER_DEV_STORE=memory. With neither, getStore() returns an error message and
// the API answers 503, so a deploy without the database never pretends to save.
import { Redis } from "@upstash/redis";

export const KEY = "flomaster:answers";

// Exported so the local test server (.tmp/admin/dev-api.mjs) can load and keep it on disk.
export const memory = new Map();

const memoryStore = {
  async all() {
    return Object.fromEntries(memory);
  },
  // Compare and write with no await in between, so overlapping saves cannot interleave.
  async putIfNewer(id, rec) {
    const cur = memory.get(id);
    if (cur && Number.isSafeInteger(cur.updatedAt) && cur.updatedAt > rec.updatedAt) return cur;
    memory.set(id, rec);
    return null;
  },
};

// Keeps the stored answer when it is newer than the incoming one (returns it), else writes the
// incoming one (returns nil). One script, so Redis runs the compare and the write as one step.
const PUT_IF_NEWER = `
local cur = redis.call("HGET", KEYS[1], ARGV[1])
if cur then
  local ok, rec = pcall(cjson.decode, cur)
  if ok and type(rec) == "table" and type(rec.updatedAt) == "number" and rec.updatedAt > tonumber(ARGV[3]) then
    return cur
  end
end
redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])
return false
`;

let redisStore = null;
function makeRedisStore() {
  // Redis.fromEnv() reads UPSTASH_REDIS_REST_URL / _TOKEN and falls back to the names the
  // Vercel Marketplace integration sets, KV_REST_API_URL / _TOKEN. Values stay raw strings;
  // this file parses them.
  const redis = Redis.fromEnv({ automaticDeserialization: false });
  const parse = (s) => {
    try {
      return typeof s === "string" ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };
  return {
    async all() {
      // With automaticDeserialization off, HGETALL comes back as the raw flat list
      // [field, value, field, value, ...]; accept an object too.
      const h = (await redis.hgetall(KEY)) ?? [];
      const pairs = Array.isArray(h) ? Array.from({ length: h.length / 2 }, (_, i) => [h[2 * i], h[2 * i + 1]]) : Object.entries(h);
      const out = {};
      for (const [id, s] of pairs) {
        const rec = parse(s);
        if (rec) out[id] = rec;
      }
      return out;
    },
    async putIfNewer(id, rec) {
      return parse(await redis.eval(PUT_IF_NEWER, [KEY], [id, JSON.stringify(rec), String(rec.updatedAt)]));
    },
  };
}

/** @returns {{ store: typeof memoryStore } | { error: string }} */
export function getStore() {
  const env = process.env;
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (url && token) return { store: (redisStore ??= makeRedisStore()) };
  if (url || token) {
    return { error: `Database half set up: ${url ? "token" : "URL"} missing. Set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).` };
  }
  if (env.FLOMASTER_DEV_STORE === "memory") return { store: memoryStore };
  return { error: "No database connected. Set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)." };
}
