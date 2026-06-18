[README.md](https://github.com/user-attachments/files/29092282/README.md)
# The Final Generation: One Last World Cup

MapLibre GL JSで作った、2026年FIFAワールドカップへ向かう4人のレジェンドの3Dストーリーマップです。

## 公開ファイル

GitHub Pagesで公開する場合は、この`github-pages`フォルダの中身をリポジトリ直下にアップロードしてください。

```text
index.html
style.css
script.js
data/players.js
.nojekyll
README.md
```

`assets/players`のローカル画像は公開用には不要です。選手写真は`data/players.js`内でWikimedia Commonsの画像URLを参照しています。

## 写真クレジット

選手カード内に、作者名・ライセンス・元画像リンクを表示しています。クレジット情報は`data/players.js`の`photoCredit`から編集できます。

## GitHub Pages設定

1. GitHubのリポジトリを開く
2. `Add file` → `Upload files`
3. この`github-pages`フォルダの中身をドラッグ&ドロップ
4. `Commit changes`
5. `Settings` → `Pages`
6. `Build and deployment`を`Deploy from a branch`にする
7. `Branch`を`main`、フォルダを`/(root)`にする
8. `Save`

公開URL:

```text
https://shocpsa.github.io/WorldCup2026_LegendsHistory/
```
