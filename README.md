# SHIKI KUJO OFFICIAL STORE（GitHub Pages ＋ BOOTH 自動連携）

BOOTHで販売・頒布している商品を、**GitHub Actionsが自動で取得してカタログ化する**静的サイトです。
商品の追加・価格変更・販売終了は、BOOTH側で行えば、このサイトに自動で反映されます。

## 仕組み
```
BOOTHショップ ──(Actions: node scripts/build.mjs)──> data/products.json ──> dist/ ──> GitHub Pages
```
- 実行タイミング：**mainへのpush時 / 毎日 03:00 JST / Actionsタブからの手動実行**（`.github/workflows/pages.yml`）
- 取得内容：商品名・価格(バリエーションの最安〜最高)・説明・画像・タグ・公開日・売り切れ
- カテゴリは商品名・タグ・BOOTHカテゴリから自動判定（`data/site.json` の `categoryRules`）。実物(配送)商品は「グッズ」
- BOOTHの取得に**失敗した場合はデプロイされず**、公開中のサイトはそのまま残ります（Actionsが赤くなるので気づけます）

## 初期設定（1回だけ）
1. GitHubで新規リポジトリを作り、このフォルダの中身をすべてpush（ブランチは `main`）
2. **Settings → Pages → Build and deployment → Source を「GitHub Actions」** にする（"Deploy from a branch" ではありません）
3. `data/site.json` の `links.booth` に `https://あなたのID.booth.pm` を入力してコミット → 自動でビルド＆公開
4. `data/manual-products.json` の `"sample": true` の商品は、BOOTH設定後は表示されません（削除してOK）

## 編集するファイル
| やりたいこと | 編集先 |
|---|---|
| サイト名・キャッチコピー・各種リンク・カテゴリ名/色 | `data/site.json` |
| カテゴリの自動判定ルール | `data/site.json` の `categoryRules` |
| 自動取得した内容の上書き（カテゴリ・説明・特長・非表示など） | `data/overrides.json` |
| BOOTHにない商品を手動で載せる | `data/manual-products.json`（`sample` なし） |
| よくある質問 | `data/faq.json` |
| 見た目 | `assets/style.css` 先頭の `:root` |
| 利用規約 | `terms.html` |

### 上書きの例（`data/overrides.json`）
キーはBOOTHの商品番号（URLの `/items/` の後ろの数字）。
```json
{
  "1234567": {
    "cat": "discord",
    "short": "一覧に出る短い説明",
    "features": ["特長1", "特長2"],
    "code": "/* ここにCSSを書くと商品ページにコピー用コードが出ます */"
  },
  "7654321": { "hidden": true }
}
```
使えるカテゴリ: `goods` / `obs` / `discord` / `other`

## ローカルで確認
```
node scripts/build.mjs            # data/ を更新して dist/ を作る（BOOTH未設定ならサンプルで動作）
python3 -m http.server -d dist    # http://localhost:8000
```

## 注意
- BOOTHには公式の公開APIがなく、商品ページのJSON(`booth.pm/ja/items/番号.json`)とショップの一覧ページを読み取っています。**BOOTH側の仕様変更で動かなくなる可能性**があります。その場合はActionsが失敗します。取得は1日1回・商品ごとに間隔を空けて行います。BOOTHの利用規約も各自ご確認ください。
- 商品画像はBOOTHの画像を直接表示します（読み込めない場合は自作のイラストに切り替わります）。
- 公開リポジトリは、60日間リポジトリへの更新がないとスケジュール実行が自動停止されます。止まったらActionsタブから再度有効化してください。
- 価格・在庫の最終判断はBOOTHの表示が正です。フッターに最終更新日時を表示しています。
- 利用規約・特商法表記は、実際の運用に合わせて必ず見直してください。
