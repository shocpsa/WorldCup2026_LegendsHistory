# The Final Generation: One Last World Cup

MapLibre GL JSで作った、2026年FIFAワールドカップへ向かう4人のレジェンドの3Dストーリーマップです。

公開URL:

```text
https://shocpsa.github.io/WorldCup2026_LegendsHistory/
```

## 編集するファイル

基本的には下のファイルだけ触ればOKです。

```text
index.html
style.css
script.js
players.js
assets/players/
.nojekyll
README.md
```

`players.js`:
選手名、国、写真URL、写真クレジット、選手カードの文章、キャリアルート、ポイント座標、ライン色を編集します。

`script.js`:
シーン順、シーンカードのタイトル・本文、カメラ位置、滞在時間、ルートアニメーション、最終演出を編集します。シーンカードの本文を変えたい場合はこのファイルです。

`style.css`:
カード、文字、ボタン、シーン移動バー、色味など見た目を編集します。

`index.html`:
ページの骨組みと読み込み順です。通常は触らなくて大丈夫です。

`assets/players/`:
ローカルに置く選手写真用フォルダです。現在はネイマールとモドリッチの画像を使っています。メッシとロナウドはWikimedia Commonsの直リンクを`players.js`で参照しています。

## 写真クレジット

選手カード内に、作者名・ライセンス・元画像リンクを表示しています。クレジット情報は`players.js`の`photoCredit`から編集できます。

## 整理方針

以前の上書き用ファイルは、本体ファイルへ統合しました。

```text
career-teams.js
career-copy.js
map-performance.js
scene-nav.js
scene-nav.css
```

これらはもう編集・追加しなくて大丈夫です。
