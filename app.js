/* SHIKI KUJO OFFICIAL STORE — client script. データは data/*.json を読み込みます(GitHub Actionsが毎日更新)。 */
(async function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const page = document.body.dataset.page || "";
  const art = window.MW_art;

  let SITE, FAQ, PRODUCTS, META;
  try {
    const load = (n) => fetch(`data/${n}.json`, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(n); return r.json(); });
    [SITE, FAQ, PRODUCTS, META] = await Promise.all([load("site"), load("faq"), load("products"), load("meta").catch(() => ({}))]);
  } catch (e) {
    const m = $("main");
    if (m) m.innerHTML = '<div class="wrap"><p class="empty">データを読み込めませんでした。<br>ローカルで確認する場合は <code>python3 -m http.server -d dist</code> のようにサーバー経由で開いてください。</p></div>';
    return;
  }
  const CATEGORIES = SITE.categories;
  const L = SITE.links || {};

  const yen = (n) => (n === 0 ? "無料" : "¥" + Number(n).toLocaleString("ja-JP"));
  const priceText = (p) => (p.price === 0 && !p.priceMax ? "無料" : yen(p.price) + (p.priceMax ? "〜" : ""));
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const isNew = (p) => p.date && (Date.now() - new Date(p.date).getTime()) / 864e5 <= (SITE.newDays || 30);
  const catOf = (p) => CATEGORIES[p.cat] || CATEGORIES.other || { label: "その他", color: "#8a7a5c", en: "" };
  const usedCats = () => Object.keys(CATEGORIES).filter((k) => PRODUCTS.some((p) => p.cat === k));

  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#c07148"/><circle cx="20" cy="20" r="12" fill="none" stroke="#fbf6ef" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#fbf6ef"/></svg>`;

  /* BOOTHの画像があればそれを、なければ描画SVGを使う */
  function thumb(p) {
    return p.image
      ? `<img class="thumb-img" data-pid="${esc(p.id)}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer">`
      : art(p);
  }
  document.addEventListener("error", (e) => {
    const im = e.target;
    if (im && im.classList && im.classList.contains("thumb-img")) {
      const p = byId(im.dataset.pid); if (p) im.outerHTML = art(p);
    }
  }, true);

  function card(p) {
    const c = catOf(p);
    return `<a class="card" href="item.html?id=${encodeURIComponent(p.id)}" style="--c:${c.color}">
      ${p.soldOut ? '<span class="badge-new sold">SOLD OUT</span>' : isNew(p) ? '<span class="badge-new">NEW</span>' : ""}
      <div class="thumb">${thumb(p)}</div>
      <div class="body">
        <span><span class="tag">${esc(c.label)}</span></span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.short)}</p>
        <div class="meta"><span class="price ${p.price === 0 ? "free" : ""}">${priceText(p)}</span><span aria-hidden="true">→</span></div>
      </div></a>`;
  }

  /* ---------- header / footer ---------- */
  const NAV = [["index", "index.html", "ホーム", "Home"], ["shop", "shop.html", "ショップ", "Shop"], ["faq", "faq.html", "よくある質問", "FAQ"], ["contact", "contact.html", "お問い合わせ", "Contact"], ["terms", "terms.html", "利用規約", "Terms"]];
  function chrome() {
    const nav = NAV.map(([k, href, ja, en]) => `<li><a href="${href}" ${k === page ? 'aria-current="page"' : ""}>${ja}<small>${en}</small></a></li>`).join("");
    $("#site-header").outerHTML = `<header class="site-header" id="site-header"><div class="wrap">
      <a class="brand" href="index.html">${LOGO}<span>${esc(SITE.name)}</span></a>
      <button class="menu-btn" aria-label="メニュー" aria-expanded="false" aria-controls="nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <nav class="nav" id="nav" aria-label="メインメニュー"><ul>${nav}${L.booth ? `<li><a class="nav-cta" href="${esc(L.booth)}" target="_blank" rel="noopener">BOOTH ↗</a></li>` : ""}</ul></nav></div></header>`;
    const cats = usedCats().map((k) => `<li><a href="shop.html?cat=${k}">${esc(CATEGORIES[k].label)}</a></li>`).join("");
    const ext = (u, t) => (u ? `<li><a href="${esc(u)}" target="_blank" rel="noopener">${t}</a></li>` : "");
    const upd = META && META.updatedAt && META.source === "booth" ? `<p class="upd">商品情報はBOOTHから毎日自動更新 (最終更新 ${esc(META.updatedAt)})。最新の価格・在庫はBOOTHでご確認ください。</p>` : "";
    $("#site-footer").outerHTML = `<footer class="site-footer"><div class="wrap">
      <div class="foot-grid">
        <div><a class="brand" href="index.html">${LOGO}<span>${esc(SITE.name)}</span></a><p style="font-size:.88rem">${esc(SITE.tagline)}</p></div>
        <div><h4>ショップ</h4><ul>${cats}</ul></div>
        <div><h4>リンク</h4><ul>${ext(L.booth, "BOOTHショップ")}${ext(L.discord, "Discordサーバー")}${ext(L.x, "X (Twitter)")}<li><a href="faq.html">よくある質問</a></li><li><a href="terms.html">利用規約</a></li></ul></div>
      </div>
      <div class="copy">${upd}© ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</div></div></footer>`;
    const btn = $(".menu-btn"), n = $("#nav");
    btn.addEventListener("click", () => btn.setAttribute("aria-expanded", n.classList.toggle("open")));
  }

  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 1800);
  }

  /* ---------- pages ---------- */
  const pages = {
    index() {
      const bc = $("#booth-cta");
      if (bc) bc.innerHTML = L.booth ? `<a class="btn" href="${esc(L.booth)}" target="_blank" rel="noopener">BOOTHショップを見る ↗</a>` : "";
      $("#new-grid").innerHTML = PRODUCTS.slice(0, 4).map(card).join("");
      $("#cat-tiles").innerHTML = usedCats().map((k) => {
        const c = CATEGORIES[k], n = PRODUCTS.filter((p) => p.cat === k).length;
        return `<a class="cat-tile" href="shop.html?cat=${k}" style="--c:${c.color}"><div class="ico">${c.icon || ""}</div><h3>${esc(c.label)}<span style="font-size:.7rem;color:var(--ink-soft);margin-left:8px;letter-spacing:.1em">${esc(c.en || "")}</span></h3><p>${esc(c.desc || "")}</p><span class="count">${n} items →</span></a>`;
      }).join("");
      const picks = [];
      for (const k of usedCats()) { const p = PRODUCTS.find((x) => x.cat === k); if (p) picks.push(p); }
      for (const p of PRODUCTS) if (picks.length < 3 && !picks.includes(p)) picks.push(p);
      $("#hero-art").innerHTML = '<div class="blob"></div>' + picks.slice(0, 3).map((p, i) => `<div class="card-mini c${i + 1}">${thumb(p)}</div>`).join("");
      const free = PRODUCTS.filter((p) => p.price === 0);
      if (free.length) $("#free-grid").innerHTML = free.map(card).join(""); else $("#free-sec").hidden = true;
    },

    shop() {
      const q = new URLSearchParams(location.search);
      const state = { cat: CATEGORIES[q.get("cat")] ? q.get("cat") : "all", price: "all", text: "", sort: "new" };
      const chips = $("#chips");
      const defs = [["all", "すべて"], ...usedCats().map((k) => [k, CATEGORIES[k].label])];
      chips.innerHTML = defs.map(([k, l]) => `<button class="chip" data-cat="${k}" aria-pressed="${k === state.cat}">${esc(l)}</button>`).join("");
      function render() {
        const list = PRODUCTS.filter((p) =>
          (state.cat === "all" || p.cat === state.cat) &&
          (state.price === "all" || (state.price === "free" ? p.price === 0 : p.price > 0)) &&
          (!state.text || [p.name, p.short, p.desc, (p.tags || []).join(" ")].join(" ").toLowerCase().includes(state.text)));
        list.sort({ new: (a, b) => b.date.localeCompare(a.date), low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price }[state.sort]);
        $("#grid").innerHTML = list.map(card).join("");
        $("#empty").hidden = list.length > 0;
        $("#count").textContent = list.length + " 件";
        chips.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === state.cat));
      }
      chips.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) { state.cat = b.dataset.cat; render(); } });
      $("#f-price").addEventListener("change", (e) => { state.price = e.target.value; render(); });
      $("#f-sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
      $("#f-text").addEventListener("input", (e) => { state.text = e.target.value.trim().toLowerCase(); render(); });
      render();
    },

    item() {
      const id = new URLSearchParams(location.search).get("id");
      const p = byId(id), root = $("#item-root");
      if (!p) { root.innerHTML = `<p class="empty">商品が見つかりませんでした。<br><a href="shop.html">ショップへ戻る</a></p>`; return; }
      const c = catOf(p);
      document.title = `${p.name} | ${SITE.name}`;
      const isFree = p.price === 0 && !p.priceMax;
      const action = p.soldOut ? `<span class="btn block disabled">売り切れ</span>`
        : p.url ? `<a class="btn block" href="${esc(p.url)}" target="_blank" rel="noopener">${isFree ? "BOOTHで無料入手" : "BOOTHで購入する"} ↗</a>`
        : `<span class="btn block disabled">BOOTH公開準備中</span>`;
      const specs = Object.entries(p.specs || {}).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
      const feats = (p.features || []).map((f) => `<li>${esc(f)}</li>`).join("");
      const tags = (p.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join("");
      const imgs = (p.images && p.images.length ? p.images : p.image ? [p.image] : []).slice(0, 6);
      const gallery = imgs.length > 1 ? `<div class="gallery">${imgs.map((u, i) => `<button type="button" data-src="${esc(u)}" aria-label="画像${i + 1}"><img src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer"></button>`).join("")}</div>` : "";
      const rel = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
      const physical = p.physical || p.cat === "goods";
      root.innerHTML = `
        <div class="crumbs"><a href="index.html">ホーム</a> › <a href="shop.html?cat=${esc(p.cat)}">${esc(c.label)}</a> › ${esc(p.name)}</div>
        <div class="item">
          <div class="item-body">
            <div class="main-art" id="main-art">${thumb(p)}</div>${gallery}
            <h2>商品説明</h2><p class="desc">${esc(p.desc || p.short)}</p>
            ${feats ? `<h2>特長</h2><ul>${feats}</ul>` : ""}
            ${p.code ? `<h2>コード</h2><p style="font-size:.88rem;margin-top:0">コピーして、Vencord / BetterDiscord のカスタムCSS欄に貼り付けてください。</p><div class="codebox"><button type="button" id="copy">コピー</button><pre><code>${esc(p.code)}</code></pre></div>` : ""}
            ${specs ? `<h2>仕様</h2><table class="spec">${specs}</table>` : ""}
            ${tags ? `<h2>タグ</h2><div class="pills">${tags}</div>` : ""}
          </div>
          <aside class="buy" style="--c:${c.color}">
            <span class="tag">${esc(c.label)}</span>
            <h1>${esc(p.name)}</h1>
            <div class="big-price ${isFree ? "free" : ""}">${priceText(p)}</div>
            ${action}
            <p class="note">${p.version ? "バージョン " + esc(p.version) + " ・ " : ""}公開日 ${esc(p.date)}<br>${physical ? "BOOTHで決済・発送されます(あんしんBOOTH便など)。" : isFree ? "BOOTHで入手後、BOOTHのライブラリからダウンロードできます。" : "BOOTHで決済後、BOOTHのライブラリからダウンロードできます。"}<br>価格はBOOTHの表示が正です。<a href='terms.html'>利用規約</a>をご確認ください。</p>
          </aside>
        </div>
        ${rel.length ? `<section class="block" style="padding-top:0"><h2 class="sec-title">同じカテゴリの商品</h2><div class="grid">${rel.map(card).join("")}</div></section>` : ""}`;
      const g = $(".gallery");
      if (g) g.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) $("#main-art").innerHTML = `<img class="thumb-img" src="${esc(b.dataset.src)}" alt="" referrerpolicy="no-referrer">`; });
      const cp = $("#copy");
      if (cp) cp.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(p.code); toast("コピーしました"); }
        catch (e) { const r = document.createRange(); r.selectNodeContents($("pre code")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("選択しました。Ctrl+Cでコピー"); }
      });
    },

    faq() {
      $("#faq-list").innerHTML = FAQ.map((f) => `<details class="qa"><summary>${esc(f.q)}</summary><div class="ans">${esc(f.a)}</div></details>`).join("");
    },

    contact() {
      const items = [
        [L.booth, "BOOTH ショップ", "商品へのご質問はBOOTHの商品ページ・ショップからもお問い合わせいただけます。", "BOOTHを開く", L.booth],
        [L.discord, "Discordサーバー", "質問・不具合報告・新作のお知らせはこちらが一番早いです。", "参加する", L.discord],
        [L.form, "お問い合わせフォーム", "ご依頼・ご相談など、じっくり書きたい内容はこちら。", "フォームを開く", L.form],
        [L.x, "X (Twitter)", "新作や再入荷の情報を発信しています。", "フォローする", L.x],
        [L.mail, "メール", "上記が難しい場合はメールでもどうぞ。", "メールを書く", L.mail ? "mailto:" + L.mail : ""]
      ].filter((i) => i[0]);
      $("#contact-list").innerHTML = items.length
        ? items.map(([, t, d, b, u]) => `<div class="contact-card"><h3>${t}</h3><p>${d}</p><a class="btn" href="${esc(u)}" target="_blank" rel="noopener">${b}</a></div>`).join("")
        : `<div class="todo">連絡先がまだ設定されていません。<code>data/site.json</code> の <code>links</code> にBOOTH・Discord・フォームなどのURLを入力すると、ここに表示されます。</div>`;
    }
  };

  chrome();
  if (pages[page]) pages[page]();
})();
