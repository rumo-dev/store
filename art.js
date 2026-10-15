/* thumbnails drawn as SVG (used when a product has no BOOTH image) */
window.MW_art = (function () {
  "use strict";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* ---------- procedurally drawn thumbnails ---------- */
  function art(p) {
    const h = p.hue, bg = `hsl(${h} 55% 91%)`, mid = `hsl(${h} 45% 78%)`, dk = `hsl(${h} 40% 38%)`, ac = `hsl(${h} 55% 55%)`;
    const w = "#fffdf9";
    const shapes = {
      tote: `<path d="M140 120 q0-70 60-70 t60 70" fill="none" stroke="${dk}" stroke-width="9" stroke-linecap="round"/>
             <path d="M112 112 h176 l14 156 H98z" fill="${w}" stroke="${dk}" stroke-width="5" stroke-linejoin="round"/>
             <circle cx="200" cy="190" r="34" fill="none" stroke="${ac}" stroke-width="9"/><circle cx="200" cy="190" r="11" fill="${ac}"/>`,
      sticker: `<g transform="rotate(-8 140 150)"><circle cx="140" cy="150" r="62" fill="${w}" stroke="${dk}" stroke-width="5"/><circle cx="140" cy="150" r="36" fill="none" stroke="${ac}" stroke-width="9"/><circle cx="140" cy="150" r="11" fill="${ac}"/></g>
               <g transform="rotate(10 262 118)"><rect x="216" y="80" width="92" height="76" rx="18" fill="${ac}" stroke="${w}" stroke-width="5"/><path d="M236 118 h52 M236 136 h34" stroke="${w}" stroke-width="7" stroke-linecap="round"/></g>
               <g transform="rotate(-4 250 220)"><path d="M250 186 l16 32 36 5-26 25 6 36-32-17-32 17 6-36-26-25 36-5z" fill="${mid}" stroke="${dk}" stroke-width="4" stroke-linejoin="round" transform="scale(.7) translate(108 20)"/></g>`,
      mug: `<path d="M118 100 h140 v110 q0 44-44 44 h-52 q-44 0-44-44z" fill="${w}" stroke="${dk}" stroke-width="5" stroke-linejoin="round"/>
            <path d="M258 128 h24 q28 0 28 34 t-28 34 h-24" fill="none" stroke="${dk}" stroke-width="12" stroke-linecap="round"/>
            <path d="M118 150 h140 v30 H118z" fill="${ac}" opacity=".9"/>
            <path d="M160 82 q-12-14 0-28 M196 82 q-12-14 0-28 M232 82 q-12-14 0-28" fill="none" stroke="${dk}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`,
      overlay: `<rect x="52" y="52" width="296" height="196" rx="14" fill="${w}" stroke="${dk}" stroke-width="5"/>
                <rect x="66" y="66" width="190" height="126" rx="8" fill="${mid}"/>
                <rect x="268" y="66" width="68" height="126" rx="8" fill="${bg}" stroke="${mid}" stroke-width="3"/>
                <g fill="${ac}"><rect x="275" y="76" width="42" height="7" rx="3.5"/><rect x="275" y="92" width="52" height="7" rx="3.5"/><rect x="275" y="108" width="34" height="7" rx="3.5"/><rect x="275" y="124" width="48" height="7" rx="3.5"/></g>
                <circle cx="96" cy="222" r="22" fill="${ac}" stroke="${w}" stroke-width="4"/><rect x="132" y="210" width="170" height="24" rx="12" fill="${bg}" stroke="${mid}" stroke-width="3"/>
                <path d="M120 140 l32-38 24 26 18-16 36 28z" fill="${w}" opacity=".8"/>`,
      alert: `<rect x="70" y="92" width="260" height="110" rx="26" fill="${w}" stroke="${dk}" stroke-width="5"/>
              <circle cx="122" cy="147" r="26" fill="${ac}"/><path d="M110 148 l9 9 17-19" fill="none" stroke="${w}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="164" y="124" width="124" height="12" rx="6" fill="${dk}"/><rect x="164" y="150" width="86" height="10" rx="5" fill="${mid}"/>
              <g fill="${ac}" opacity=".8"><circle cx="62" cy="72" r="7"/><circle cx="340" cy="228" r="9"/><circle cx="332" cy="70" r="5"/></g>
              <path d="M88 232 h46 M150 232 h18" stroke="${dk}" stroke-width="5" stroke-linecap="round" opacity=".4"/>`,
      script: `<rect x="62" y="56" width="276" height="188" rx="14" fill="#2b211b"/>
               <circle cx="86" cy="78" r="6" fill="#e2554a"/><circle cx="106" cy="78" r="6" fill="#e8b84f"/><circle cx="126" cy="78" r="6" fill="#7bc27b"/>
               <g stroke-linecap="round" stroke-width="9"><path d="M88 112 h70" stroke="${ac}"/><path d="M110 138 h110" stroke="#f1e4d3"/><path d="M110 164 h60" stroke="#f1e4d3" opacity=".6"/><path d="M88 190 h92" stroke="${ac}"/></g>
               <circle cx="276" cy="184" r="34" fill="none" stroke="#f1e4d3" stroke-width="7"/><path d="M276 164 v20 l14 8" fill="none" stroke="${ac}" stroke-width="7" stroke-linecap="round"/>`,
      theme: `<rect x="48" y="50" width="304" height="200" rx="16" fill="#2b211b"/>
              <rect x="48" y="50" width="62" height="200" rx="16" fill="#1b1310"/><rect x="94" y="50" width="16" height="200" fill="#1b1310"/>
              <g fill="${ac}"><circle cx="79" cy="82" r="14"/></g><g fill="#4a3a30"><circle cx="79" cy="118" r="14"/><circle cx="79" cy="154" r="14"/><circle cx="79" cy="190" r="14"/></g>
              <circle cx="136" cy="92" r="12" fill="#d8955f"/><rect x="156" y="82" width="110" height="9" rx="4.5" fill="#f1e4d3"/><rect x="156" y="98" width="150" height="9" rx="4.5" fill="#8a7566"/>
              <circle cx="136" cy="144" r="12" fill="#7d6cb3"/><rect x="156" y="134" width="84" height="9" rx="4.5" fill="#f1e4d3"/><rect x="156" y="150" width="120" height="9" rx="4.5" fill="#8a7566"/>
              <rect x="128" y="206" width="206" height="28" rx="10" fill="#1b1310"/>`,
      compact: `<rect x="48" y="50" width="304" height="200" rx="16" fill="${w}" stroke="${dk}" stroke-width="5"/>
                <g>${[0, 1, 2, 3, 4].map((i) => `<circle cx="80" cy="${82 + i * 34}" r="9" fill="${i % 2 ? mid : ac}"/><rect x="98" y="${76 + i * 34}" width="${90 + ((i * 47) % 120)}" height="8" rx="4" fill="${i % 2 ? mid : dk}" opacity=".85"/><rect x="98" y="${90 + i * 34}" width="${60 + ((i * 31) % 90)}" height="6" rx="3" fill="${mid}"/>`).join("")}</g>
                <path d="M318 72 v156 M306 84 l12-12 12 12 M306 216 l12 12 12-12" fill="none" stroke="${ac}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    };
    return `<svg viewBox="0 0 400 300" role="img" aria-label="${esc(p.name)}" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill="${bg}"/>
      <circle cx="350" cy="40" r="70" fill="${mid}" opacity=".55"/><circle cx="40" cy="270" r="90" fill="${mid}" opacity=".4"/>
      ${shapes[p.art] || shapes.tote}</svg>`;
  }

  return art;
})();
