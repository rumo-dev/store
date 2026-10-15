// BOOTHのショップから商品を自動取得して data/products.json を作り、dist/ に公開用ファイルを出力する。
//   使い方:  node scripts/build.mjs
//   設定  :  data/site.json の links.booth (例 https://yourname.booth.pm)
// 取得に失敗した場合は「エラー終了」し、公開済みのサイトを壊さない(デプロイされない)。
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const J = (...p) => path.join(ROOT, ...p);
const readJson = async (rel, fb) => {
  try { return JSON.parse(await fs.readFile(J(rel), "utf8")); }
  catch (e) { if (fb !== undefined) return fb; throw e; }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log("[build]", ...a);

const ITEM_API = (process.env.BOOTH_ITEM_BASE || "https://booth.pm/ja/items").replace(/\/+$/, "");
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; MaruWorksBuild/1.0; GitHub Actions)",
  "Accept-Language": "ja,en;q=0.8"
};

async function get(url, { json = false, allow404 = false } = {}) {
  let last;
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(url, { headers: { ...HEADERS, Accept: json ? "application/json" : "text/html" } });
      if (r.status === 404 && allow404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return json ? await r.json() : await r.text();
    } catch (e) { last = e; await sleep(800 * i); }
  }
  throw new Error(`${url}: ${last.message}`);
}

/* ---------- ショップの商品ID一覧 ---------- */
async function listItemIds(shopUrl) {
  const base = shopUrl.replace(/\/+$/, "");
  const ids = [];
  for (let page = 1; page <= 60; page++) {
    const html = await get(`${base}/items?page=${page}`, { allow404: true });
    if (html === null) break;
    const found = [...html.matchAll(/\/items\/(\d{3,})/g)].map((m) => m[1])
      .concat([...html.matchAll(/data-product-id="(\d+)"/g)].map((m) => m[1]));
    const fresh = [...new Set(found)].filter((id) => !ids.includes(id));
    if (!fresh.length) break;
    ids.push(...fresh);
    await sleep(500);
  }
  return ids;
}

/* ---------- 商品1件 ---------- */
const DEFAULT_ART = { goods: "tote", obs: "overlay", discord: "theme", other: "script" };
const BASE_HUE = { goods: 25, obs: 210, discord: 270, other: 45 };
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function infer(site, text, physical) {
  const t = text.toLowerCase();
  for (const r of site.categoryRules || []) if (r.match.some((m) => t.includes(m.toLowerCase()))) return r.cat;
  return physical ? "goods" : "other";
}

function mapItem(j, site) {
  const vars = j.variations || [];
  let prices = vars.map((v) => v.price).filter((n) => Number.isFinite(n));
  if (!prices.length) { const n = parseInt(String(j.price || "").replace(/[^\d]/g, ""), 10); if (Number.isFinite(n)) prices = [n]; }
  const min = prices.length ? Math.min(...prices) : 0, max = prices.length ? Math.max(...prices) : 0;
  const physical = vars.some((v) => v.type && v.type !== "digital");
  const tags = (j.tags || []).map((t) => t.name).filter(Boolean);
  const text = [j.name, tags.join(" "), j.category?.name, j.category?.parent?.name].filter(Boolean).join(" ");
  const cat = infer(site, text, physical);
  const desc = String(j.description || "").replace(/\r/g, "").trim();
  const firstLine = desc.split("\n").map((l) => l.trim()).find(Boolean) || "";
  const images = (j.images || []).map((i) => i.resized || i.original).filter(Boolean);
  const id = String(j.id);
  return {
    id, cat, source: "booth",
    name: j.name, price: min, priceMax: max > min ? max : undefined,
    date: String(j.published_at || "").slice(0, 10) || "1970-01-01",
    short: firstLine.length > 90 ? firstLine.slice(0, 90) + "…" : firstLine,
    desc, tags, features: [],
    image: images[0] || "", images,
    art: DEFAULT_ART[cat] || "script", hue: ((BASE_HUE[cat] ?? 30) + (hash(id) % 24)) % 360,
    url: j.url || "", soldOut: !!j.is_sold_out, physical,
    specs: { "種別": physical ? "実物グッズ" : "デジタル商品", ...(j.category?.name ? { "BOOTHカテゴリ": j.category.name } : {}) }
  };
}

/* ---------- main ---------- */
async function main() {
  const site = await readJson("data/site.json");
  const shopUrl = (process.env.BOOTH_SHOP_URL || site.links?.booth || "").trim();
  const overrides = await readJson("data/overrides.json", {});
  const manual = await readJson("data/manual-products.json", []);
  const shopBase = shopUrl.replace(/\/+$/, "");
  const withUrl = (p) => ({ ...p, url: p.url || (p.booth ? (/^https?:/.test(p.booth) ? p.booth : `${shopBase}/items/${p.booth}`) : "") });

  let items = [], source = "manual";
  if (shopUrl) {
    const sub = process.env.BOOTH_SUBDOMAIN || new URL(shopUrl).hostname.split(".")[0];
    log("BOOTHショップ:", shopUrl);
    const ids = await listItemIds(shopUrl);
    if (!ids.length) throw new Error("商品が1件も見つかりません。ショップURLと公開状態を確認してください。");
    log(ids.length, "件の候補");
    let fail = 0;
    for (const id of ids) {
      try {
        const j = await get(`${ITEM_API}/${id}.json`, { json: true });
        if (j.shop?.subdomain && j.shop.subdomain !== sub) continue;   // 他ショップの商品は除外
        if (j.is_end_of_sale) { log("販売終了のため除外:", id); continue; }
        items.push(mapItem(j, site));
      } catch (e) { fail++; console.warn("[build] 取得失敗", id, e.message); }
      await sleep(400);
    }
    if (!items.length) throw new Error("商品データを1件も取得できませんでした。");
    if (fail > ids.length / 2) throw new Error(`取得失敗が多すぎます (${fail}/${ids.length})`);
    items = items.concat(manual.filter((p) => !p.sample).map(withUrl));
    source = "booth";
  } else {
    log("links.booth が未設定のため、サンプル商品でビルドします。");
    items = manual.map(withUrl);
  }

  items = items
    .map((p) => ({ ...p, ...(overrides[p.id] || {}) }))
    .filter((p) => !p.hidden)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const stamp = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" }).replace(" ", " ");
  await fs.writeFile(J("data/products.json"), JSON.stringify(items, null, 1) + "\n");
  await fs.writeFile(J("data/meta.json"), JSON.stringify({ updatedAt: stamp + " JST", source, count: items.length }) + "\n");
  log(`products.json: ${items.length}件 (${source})`);

  /* dist/ に公開ファイルをコピー */
  const dist = J("dist");
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });
  for (const f of await fs.readdir(ROOT)) {
    if (/\.html$/.test(f) || f === ".nojekyll") await fs.copyFile(J(f), path.join(dist, f));
  }
  for (const d of ["assets", "data"]) await fs.cp(J(d), path.join(dist, d), { recursive: true });
  log("dist/ を出力しました");
}

main().catch((e) => { console.error("[build] ERROR:", e.message); process.exit(1); });
