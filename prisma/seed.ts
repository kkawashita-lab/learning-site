import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: '管理者',
      role: 'ADMIN',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'テストユーザー',
      role: 'USER',
    },
  })

  // Create curricula
  await prisma.curriculum.upsert({
    where: { id: 'curriculum-01' },
    update: {},
    create: {
      id: 'curriculum-01',
      title: 'Webブラウザの基礎',
      description: 'Webブラウザの仕組みとインターネットの基本概念を学びます。',
      order: 1,
      published: true,
      content: `# Webブラウザの基礎

Webブラウザがどのように動作するかを学びましょう。

## ブラウザとは

ブラウザはWebページを表示するためのアプリケーションです。Chrome、Firefox、Safari、Edgeなどが代表的なブラウザです。

- [ ] 主要なブラウザの名前を3つ以上言えるようになった
- [ ] ブラウザの基本的な役割を説明できるようになった

## URLとは

URL（Uniform Resource Locator）はWebページのアドレスです。

例: \`https://www.example.com/path?query=value\`

- \`https://\` — プロトコル
- \`www.example.com\` — ドメイン名
- \`/path\` — パス
- \`?query=value\` — クエリパラメータ

- [ ] URLの構成要素（プロトコル・ドメイン・パス）を説明できるようになった
- [ ] HTTPとHTTPSの違いを理解した

## リクエストとレスポンス

ブラウザはサーバーにリクエストを送り、サーバーはレスポンスを返します。

1. ブラウザがURLを入力する
2. ブラウザがDNSでIPアドレスを解決する
3. ブラウザがサーバーにHTTPリクエストを送る
4. サーバーがHTMLを返す
5. ブラウザがHTMLを解析して表示する

- [ ] リクエストとレスポンスの流れを順番に説明できるようになった
- [ ] DNSとは何かを理解した
`,
    },
  })

  await prisma.curriculum.upsert({
    where: { id: 'curriculum-02' },
    update: {},
    create: {
      id: 'curriculum-02',
      title: 'HTML基礎',
      description: 'HTMLの基本的な構造とタグの使い方を学びます。',
      order: 2,
      published: true,
      content: `# HTML基礎

HTMLはWebページの構造を作るための言語です。

## HTMLとは

HTML（HyperText Markup Language）はWebページの骨格を作る言語です。

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>ページタイトル</title>
  </head>
  <body>
    <h1>見出し</h1>
    <p>段落テキスト</p>
  </body>
</html>
\`\`\`

- [ ] HTMLの基本構造（DOCTYPE、html、head、body）を理解した
- [ ] テキストエディタでHTMLファイルを作成できた

## よく使うタグ

### テキスト要素

- \`<h1>\` 〜 \`<h6>\` — 見出し
- \`<p>\` — 段落
- \`<a>\` — リンク
- \`<strong>\` — 太字
- \`<em>\` — 斜体

- [ ] 見出しタグ（h1〜h6）を使えるようになった
- [ ] リンクタグ（a）を使えるようになった

### リスト

\`\`\`html
<ul>
  <li>順序なしリスト</li>
</ul>
<ol>
  <li>順序ありリスト</li>
</ol>
\`\`\`

- [ ] 順序なしリストと順序ありリストの違いを理解した
- [ ] リストを作成できるようになった

## 属性

HTMLタグには属性を追加できます。

\`\`\`html
<a href="https://example.com" target="_blank">外部リンク</a>
<img src="image.jpg" alt="画像の説明">
\`\`\`

- [ ] href属性とsrc属性の違いを理解した
- [ ] alt属性の重要性を理解した
`,
    },
  })

  await prisma.curriculum.upsert({
    where: { id: 'curriculum-03' },
    update: {},
    create: {
      id: 'curriculum-03',
      title: 'CSS基礎',
      description: 'CSSを使ってWebページのスタイルを定義する方法を学びます。',
      order: 3,
      published: true,
      content: `# CSS基礎

CSSはWebページのスタイルを定義するための言語です。

## CSSとは

CSS（Cascading Style Sheets）はHTMLの見た目を装飾するための言語です。

\`\`\`css
/* セレクタ { プロパティ: 値; } */
h1 {
  color: blue;
  font-size: 24px;
}
\`\`\`

- [ ] CSSの基本構文（セレクタ・プロパティ・値）を理解した
- [ ] CSSをHTMLに適用する3つの方法を理解した

## セレクタ

\`\`\`css
/* 要素セレクタ */
p { color: black; }

/* クラスセレクタ */
.highlight { background-color: yellow; }

/* IDセレクタ */
#header { font-size: 24px; }
\`\`\`

- [ ] 要素セレクタを使えるようになった
- [ ] クラスセレクタを使えるようになった
- [ ] IDセレクタを使えるようになった

## ボックスモデル

すべてのHTML要素はボックスとして扱われます。

- \`margin\` — 外側の余白
- \`border\` — 境界線
- \`padding\` — 内側の余白
- \`content\` — コンテンツ領域

- [ ] ボックスモデルの概念を理解した
- [ ] margin、padding、borderを使えるようになった

## Flexbox

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

- [ ] Flexboxの基本的な使い方を理解した
- [ ] justify-contentとalign-itemsの違いを理解した
`,
    },
  })

  console.log('Seed completed!')
  console.log('Admin: admin@example.com / admin123')
  console.log('User:  user@example.com  / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
