import fs from "node:fs";
import path from "node:path";

const out = path.resolve("dist");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const games = [
  {
    slug: "minecraft",
    title: "Minecraft",
    aliases: ["マイクラ", "マインクラフト", "Minecraft Java", "Minecraft Bedrock"],
    publisher: "Mojang / Microsoft",
    emoji: "⛏️",
    sourceType: "タイトル公式",
    officialUrl: "https://www.minecraft.net/en-us/usage-guidelines",
    checked: "2026-08-08",
    overall: "条件あり",
    summary: "Minecraft Usage Guidelines を確認して配信・収益化条件を整理します。",
    rules: [
      ["通常配信", "ok", "可能", "公式ガイドラインに動画・配信に関するルールがあります。"],
      ["広告収益化", "warn", "条件あり", "独自性や公開方法など、公式の条件を確認してください。"],
      ["有料視聴", "unknown", "要確認", "有料アクセスに関する条件は配信前に公式本文を確認してください。"]
    ]
  },
  {
    slug: "splatoon-3",
    title: "Splatoon 3",
    aliases: ["スプラ3", "スプラトゥーン3", "Splatoon3"],
    publisher: "Nintendo",
    emoji: "🎨",
    sourceType: "メーカー共通",
    officialUrl: "https://www.nintendo.co.jp/networkservice_guideline/ja/index.html",
    checked: "2026-08-08",
    overall: "条件あり",
    summary: "任天堂共通ガイドラインを基準に、タイトル固有条件の有無も確認する想定です。",
    rules: [
      ["通常配信", "ok", "可能", "個人による実況・ライブ配信が共通ガイドラインの対象です。"],
      ["収益化", "warn", "条件あり", "任天堂が案内する収益化方式などの条件を確認してください。"],
      ["法人・団体", "unknown", "要確認", "個人と条件が異なるため公式情報を確認してください。"]
    ]
  },
  {
    slug: "silent-hill-f",
    title: "SILENT HILL f",
    aliases: ["サイレントヒルf", "サイレントヒルエフ", "SHf"],
    publisher: "KONAMI",
    emoji: "🌫️",
    sourceType: "タイトル公式",
    officialUrl: "https://www.konami.com/games/silenthill/f/guideline/jp/ja/",
    checked: "2026-08-08",
    overall: "条件あり",
    summary: "タイトル個別ガイドラインを優先して確認します。",
    rules: [
      ["通常配信", "warn", "条件あり", "最新のタイトル個別ガイドラインを確認してください。"],
      ["収益化", "unknown", "要確認", "公式条件を配信直前に確認してください。"],
      ["配信区間", "warn", "要確認", "ストーリー・映像制限など個別条件の有無を確認してください。"]
    ]
  },
  {
    slug: "elden-ring",
    title: "ELDEN RING",
    aliases: ["エルデンリング", "エルデン", "ER"],
    publisher: "Bandai Namco Entertainment",
    emoji: "🗡️",
    sourceType: "メーカー共通",
    officialUrl: "https://www.bandainamcoent.co.jp/info/videopolicy/",
    checked: "2026-08-08",
    overall: "条件あり",
    summary: "バンダイナムコの共通ゲーム実況ポリシーを基準に確認します。",
    rules: [
      ["通常配信", "ok", "可能", "個人向けポリシーの範囲を確認してください。"],
      ["公式機能による収益化", "ok", "可能", "プラットフォーム公式機能などの条件を確認してください。"],
      ["法人", "warn", "要確認", "個人向けポリシーと同一条件ではないため公式情報を確認してください。"]
    ]
  }
];

const esc = s =>
  String(s ?? "").replace(
    /[&<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[c]
  );

const css = String.raw`
:root{--g:#10a85a;--g2:#087b45;--gs:#edf9f2;--ink:#151917;--muted:#68736d;--line:#e1e8e3;--bg:#f7faf8;--warns:#fff6e8}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",Meiryo,sans-serif}a{text-decoration:none;color:inherit}button,input{font:inherit}
.header{height:66px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 clamp(18px,4vw,48px);gap:24px}.logo{font-size:24px;font-weight:950}.logo span{color:var(--g)}.header nav{margin-left:auto;display:flex;gap:16px;font-size:13px;font-weight:800}
.container{max-width:1160px;margin:auto;padding-left:clamp(18px,4vw,42px);padding-right:clamp(18px,4vw,42px)}.hero{padding:78px 0 45px;display:grid;grid-template-columns:1.07fr .93fr;gap:46px;align-items:center}.hero h1{font-size:clamp(46px,7vw,80px);line-height:1.04;letter-spacing:-.06em;margin:0 0 18px}.hero h1 span{color:var(--g)}.hero p,.lead{color:var(--muted);line-height:1.8}.hero-art{min-height:310px;border:1px solid var(--line);border-radius:30px;background:linear-gradient(145deg,#fff,#f4faf6);display:grid;place-items:center}.hero-art div{font-size:82px}
.section{padding:28px 0 70px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}.game-card{display:grid;grid-template-columns:auto 1fr auto;gap:13px;align-items:center}.ico{width:52px;height:52px;border-radius:13px;background:var(--gs);display:grid;place-items:center;font-size:26px}.small{display:block;font-size:12px;color:var(--muted);margin-top:4px}.pill{font-size:11px;padding:6px 9px;border-radius:999px;background:var(--warns);color:#9e610e;font-weight:900}
.search-wrap{position:relative;z-index:30}.search{display:flex;background:#fff;border:2px solid var(--g);border-radius:15px;padding:6px}.search input{flex:1;border:0;outline:0;padding:14px;font-size:16px;min-width:0}.search button,.btn{border:0;background:var(--g);color:#fff;border-radius:10px;padding:11px 18px;font-weight:900;cursor:pointer}
.suggestions{position:absolute;left:0;right:0;top:calc(100% + 8px);background:#fff;border:1px solid var(--line);border-radius:15px;box-shadow:0 18px 50px rgba(20,48,31,.12);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;max-height:min(52vh,420px);padding:5px;display:none;z-index:40}
.suggestion{width:100%;min-height:68px;border:0;background:#fff;padding:13px 14px;text-align:left;border-radius:10px;display:flex;flex-direction:column;justify-content:center;gap:2px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.suggestion+.suggestion{margin-top:3px}.suggestion:active,.suggestion:hover{background:#edf9f2}.suggestion b{font-size:15px}.suggestion .small{line-height:1.45}
.result{padding-top:35px;padding-bottom:65px}.game-head{display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center;padding:23px;border-bottom:1px solid var(--line)}.cover{width:100px;height:100px;border-radius:17px;background:linear-gradient(145deg,#159a5a,#263c30);display:grid;place-items:center;color:#fff;font-size:42px}.overall{min-width:165px;text-align:center;border-radius:15px;background:var(--warns);color:#9f5f0d;padding:18px;font-weight:950}.summary{padding:14px 23px;background:#fafcfb;color:var(--muted);line-height:1.7;font-size:13px;border-bottom:1px solid var(--line)}.rules{padding:8px 23px}.rule{display:grid;grid-template-columns:1.05fr 130px 1.7fr;gap:14px;padding:15px 0;border-bottom:1px solid var(--line)}.status{font-size:13px;font-weight:900}.status.ok{color:var(--g2)}.status.warn{color:#b56d13}.status.unknown{color:#7b8580}.note{font-size:13px;color:var(--muted);line-height:1.65}.notice{margin:18px 23px;padding:15px;border-radius:13px;border:1px solid #eadfbe;background:#fffaf0;color:#665a34;font-size:13px;line-height:1.7}
.ad-slot{min-height:92px;border:1px dashed #c9d3cd;border-radius:13px;background:#fbfcfb;margin:20px 0;display:grid;place-items:center;text-align:center;color:#89948e;font-size:12px}.revenue-box{background:linear-gradient(145deg,#fff,#f5fbf7);border:1px solid #cfe8d7;border-radius:17px;padding:20px;margin-top:20px}.guide-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.guide-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}
.footer{border-top:1px solid var(--line);padding:25px 0 40px;color:var(--muted);font-size:12px}.footer nav{display:flex;gap:14px;margin-bottom:10px;flex-wrap:wrap}
@media(max-width:800px){.hero{grid-template-columns:1fr}.grid,.guide-grid{grid-template-columns:1fr}.game-head{grid-template-columns:auto 1fr}.overall{grid-column:1/-1}.rule{grid-template-columns:1fr auto}.note{grid-column:1/-1}}
`;

const appjs = String.raw`
let searchResults = [];
let searchTimer = null;
let searchController = null;

const staticSlugs = {
  "Minecraft": "minecraft",
  "Splatoon 3": "splatoon-3",
  "SILENT HILL f": "silent-hill-f",
  "ELDEN RING": "elden-ring"
};

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function closeSuggestions() {
  const box = document.getElementById("suggestions");
  if (box) box.style.display = "none";
}

function openGame(game) {
  closeSuggestions();

  const slug = staticSlugs[game.name];

  if (slug) {
    location.href = "/games/" + slug + "/";
    return;
  }

  if (game.official_url) {
    location.href = game.official_url;
    return;
  }

  location.href = "/games/";
}

async function runSuggest() {
  const input = document.getElementById("q");
  const box = document.getElementById("suggestions");

  if (!input || !box) return;

  const q = input.value.trim();

  if (!q) {
    searchResults = [];
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

  if (searchController) {
    searchController.abort();
  }

  searchController = new AbortController();

  try {
    const res = await fetch(
      "/api/search?q=" + encodeURIComponent(q),
      {
        signal: searchController.signal,
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!res.ok) {
      throw new Error("Search API error");
    }

    const data = await res.json();

    searchResults = Array.isArray(data.games)
      ? data.games.slice(0, 6)
      : [];

    if (!searchResults.length) {
      box.innerHTML =
        '<div class="suggestion" style="cursor:default">' +
        '<b>該当するゲームがありません</b>' +
        '<span class="small">別のタイトル名でも検索してみてください</span>' +
        '</div>';

      box.style.display = "block";
      return;
    }

    box.innerHTML = searchResults.map((g, i) => {
      const source = htmlEscape(g.source || "");
      const platform = htmlEscape(g.platform || "");
      const status = htmlEscape(g.streaming_status || "要確認");

      return (
        '<button type="button" class="suggestion" data-index="' + i + '">' +
          '<b>' + htmlEscape(g.name) + '</b>' +
          '<span class="small">' +
            [source, platform, status].filter(Boolean).join(" / ") +
          '</span>' +
        '</button>'
      );
    }).join("");

    box.style.display = "block";

    box.querySelectorAll(".suggestion[data-index]").forEach(btn => {
      btn.addEventListener("pointerdown", e => {
        e.preventDefault();

        const index = Number(btn.dataset.index);
        const game = searchResults[index];

        if (game) {
          openGame(game);
        }
      });
    });

  } catch (error) {
    if (error.name === "AbortError") return;

    console.error(error);
    box.style.display = "none";
  }
}

function suggest() {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    runSuggest();
  }, 180);
}

async function searchSubmit(e) {
  e.preventDefault();

  const input = document.getElementById("q");
  if (!input) return;

  const q = input.value.trim();
  if (!q) return;

  try {
    const res = await fetch(
      "/api/search?q=" + encodeURIComponent(q),
      {
        headers: {
          "Accept": "application/json"
        }
      }
    );

    const data = await res.json();

    if (data.ok && Array.isArray(data.games) && data.games[0]) {
      openGame(data.games[0]);
      return;
    }

    location.href = "/games/";

  } catch (error) {
    console.error(error);
    location.href = "/games/";
  }
}

document.addEventListener("pointerdown", e => {
  const box = document.getElementById("suggestions");

  if (
    box &&
    e.target instanceof Element &&
    !e.target.closest(".search-wrap")
  ) {
    closeSuggestions();
  }
});
`;

function write(rel, txt) {
  const p = path.join(out, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, txt);
}

function shell(title, body, description = "") {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="stylesheet" href="/assets/style.css"></head><body><header class="header"><a class="logo" href="/">配信<span>OK</span>？</a><nav><a href="/games/">ゲーム</a><a href="/guides/">配信ノウハウ</a><a href="/changes/">更新履歴</a></nav></header>${body}<footer class="footer"><div class="container"><nav><a href="/terms/">利用規約</a><a href="/privacy/">プライバシー</a><a href="/corrections/">情報修正</a></nav><div>本サービスは配信許可や法的判断を保証するものではありません。</div></div></footer><script src="/assets/app.js"></script></body></html>`;
}

write("assets/style.css", css);
write("assets/app.js", appjs);
write("robots.txt", "User-agent: *\nAllow: /\n");

const homeCards = games.map(g =>
  `<a class="card game-card" href="/games/${g.slug}/"><span class="ico">${g.emoji}</span><span><b>${esc(g.title)}</b><span class="small">${esc(g.publisher)}</span></span><span class="pill">⚠️ ${esc(g.overall)}</span></a>`
).join("");

write(
  "index.html",
  shell(
    "配信OK？｜ゲーム配信ガイドライン検索",
    `<main class="container"><section class="hero"><div><h1>このゲーム、<br><span>配信して大丈夫？</span></h1><p>公式ガイドラインを配信者目線で整理。収益化・法人利用・配信条件を公式ソース付きで確認できます。</p><div class="search-wrap"><form class="search" onsubmit="searchSubmit(event)"><input id="q" oninput="suggest()" placeholder="例：マイクラ / スプラ3 / エルデン"><button>検索</button></form><div id="suggestions" class="suggestions"></div></div></div><div class="hero-art"><div>🎙️</div></div></section><section class="section"><h2>人気のガイドライン</h2><p class="lead">まず答えを出して、その後に必要な解説や収益コンテンツへ進む構成。</p><div class="grid">${homeCards}</div></section></main>`
  )
);

const list = games.map(g =>
  `<a class="card game-card" href="/games/${g.slug}/"><span class="ico">${g.emoji}</span><span><b>${esc(g.title)}</b><span class="small">${esc(g.publisher)}</span></span><span>→</span></a>`
).join("");

write(
  "games/index.html",
  shell(
    "ゲーム配信ガイドライン一覧｜配信OK？",
    `<main class="container section"><h1>ゲーム配信ガイドライン一覧</h1><p class="lead">登録済みタイトル</p><div class="grid">${list}</div></main>`
  )
);

for (const g of games) {
  const rules = g.rules.map(([n, st, lab, note]) =>
    `<div class="rule"><b>${esc(n)}</b><span class="status ${st}">${st === "ok" ? "✅" : st === "warn" ? "⚠️" : "❓"} ${esc(lab)}</span><span class="note">${esc(note)}</span></div>`
  ).join("");

  write(
    `games/${g.slug}/index.html`,
    shell(
      `${g.title}の配信ガイドライン｜配信OK？`,
      `<main class="container result"><section class="card" style="padding:0;overflow:hidden"><div class="game-head"><div class="cover">${g.emoji}</div><div><h1 style="margin:0 0 7px">${esc(g.title)}</h1><span class="small">${esc(g.publisher)} / ${esc(g.sourceType)}<br>最終確認 ${esc(g.checked)}</span></div><div class="overall">⚠️<br>${esc(g.overall)}</div></div><div class="summary">${esc(g.summary)}　<a href="${g.officialUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--g2);font-weight:850">公式ガイドライン ↗</a></div><div class="rules">${rules}</div><div class="notice">回答を広告で隠さない設計です。配信前には公式情報を最終確認してください。</div></section><div class="ad-slot">広告枠（本番でAdSense接続）</div><section class="revenue-box"><h3>${esc(g.title)}を配信する準備もチェック</h3><p class="lead">権利情報を確認したら、配信設定・PC・マイク・キャプチャー環境なども確認できます。</p><a class="btn" href="/guides/streaming-setup/">配信環境の作り方</a></section><div class="ad-slot">広告枠（本番でAdSense接続）</div></main>`
    )
  );
}

const guides = [
  ["streaming-setup", "ゲーム配信環境の作り方"],
  ["obs-basics", "OBSの基本設定"],
  ["vtuber-stream-checklist", "VTuber配信前チェックリスト"]
];

write(
  "guides/index.html",
  shell(
    "配信ノウハウ｜配信OK？",
    `<main class="container section"><h1>配信ノウハウ</h1><p class="lead">権利チェッカーから自然につながる収益コンテンツ枠。</p><div class="guide-grid">${guides.map(([s, t]) => `<a class="guide-card" href="/guides/${s}/"><h3>${t}</h3><p>実用情報を優先して、広告・アフィリエイト導線を自然に配置します。</p></a>`).join("")}</div></main>`
  )
);

for (const [s, t] of guides) {
  write(
    `guides/${s}/index.html`,
    shell(
      `${t}｜配信OK？`,
      `<main class="container section"><h1>${t}</h1><p class="lead">収益化記事の土台です。広告・アフィリエイト導入時も内容の有用性を優先します。</p></main>`
    )
  );
}

for (const [p, t, txt] of [
  ["changes", "ガイドライン更新履歴", "Workersが変更候補を検出し、人間確認後に公開する想定です。"],
  ["terms", "利用規約・免責事項", "本サービスは配信許可や適法性を保証しません。"],
  ["privacy", "プライバシーポリシー", "静的閲覧を基本とし、必要以上の個人情報を収集しない方針です。"],
  ["corrections", "掲載情報の修正について", "公式ソースを確認して修正できる運用を行います。"]
]) {
  write(
    `${p}/index.html`,
    shell(
      `${t}｜配信OK？`,
      `<main class="container section"><h1>${t}</h1><p class="lead">${txt}</p></main>`
    )
  );
}

console.log("Generated static site:", out);
