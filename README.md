# 最強管理者権限争奪戦 - モデレーターバトロワルーレット

参加者の「枠数」に基づいた確率的なルーレット対戦を通じて、公平で楽しいトーナメント形式のイベントを運営するためのWebアプリケーションです。

## 🎮 機能

- **CSVインポート**: 参加者情報を一括登録
- **自動トーナメント生成**: 参加者数に応じた最適な形式を自動選択
  - 30名以下: 1対1シングルエリミネーション
  - 30名超: 3人対戦形式（初回のみ）
- **ルーレット対戦**: 枠数に基づいた確率でアニメーション付きルーレット
- **枠数吸収システム**: 勝者は敗者の枠数を吸収
- **自動保存**: ブラウザのローカルストレージに自動保存
- **シード対戦**: 奇数人数時の自動シード設定

## 🚀 セットアップ

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

### 本番ビルド

```bash
npm run build
npm run start
```

## 📦 Vercelへのデプロイ

### 方法1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### 方法2: GitHubリポジトリ連携

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)にログイン
3. "New Project" → GitHubリポジトリを選択
4. "Deploy"をクリック

## 📋 CSVファイル形式

```csv
参加者名,枠数
参加者A,5
参加者B,3
参加者C,2
```

- 文字コード: UTF-8
- 列: 参加者名, 枠数（1以上の整数）

## 🎯 使い方

1. **参加者登録**: CSVファイルをアップロード
2. **トーナメント開始**: 自動生成されたトーナメント表を確認
3. **対戦実行**: 対戦カードをクリックしてルーレット開始
4. **結果確定**: 「確定」ボタンで次のラウンドへ

## 🛠 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **データ保存**: LocalStorage

## 📁 ファイル構成

```
.
├── app/
│   ├── layout.tsx          # レイアウト
│   ├── page.tsx            # メインページ
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── CSVImport.tsx       # CSVインポート
│   ├── ParticipantPanel.tsx # 参加者パネル
│   ├── TournamentBracket.tsx # トーナメント表
│   ├── RouletteOverlay.tsx  # ルーレット
│   └── WinnerCelebration.tsx # 優勝者表示
├── lib/
│   ├── types.ts            # 型定義
│   ├── csv-processor.ts    # CSV処理
│   └── tournament-manager.ts # トーナメント管理
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## ライセンス

© 2025 最強管理者権限争奪戦

