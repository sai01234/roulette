# 最強管理者権限争奪戦 - モデレーターバトロワルーレット

参加者の「枠数」に基づいた確率的なルーレット対戦を通じて、公平で楽しいトーナメント形式のイベントを運営するためのWebアプリケーションです。

## 🎮 機能

### 🏆 トーナメント管理
- **複数トーナメント対応**: 各大会に名前を付けて管理（例: 「2026年1月」「第1回大会」）
- **トーナメント履歴**: 過去の全トーナメントとチャンピオン情報を閲覧
- **自動トーナメント生成**: 参加者数に応じた最適な形式を自動選択
  - 30名以下: 1対1シングルエリミネーション
  - 30名超: 3人対戦形式（初回のみ）

### 🔐 認証システム
- パスワード保護されたダッシュボード
- セッション管理による安全なアクセス制御
- 特定のアカウントのみアクセス可能

### 🎲 ルーレット対戦
- **CSVインポート**: 参加者情報を一括登録
- **ルーレット対戦**: 枠数に基づいた確率でアニメーション付きルーレット
- **枠数吸収システム**: 勝者は敗者の枠数を吸収
- **シード対戦**: 奇数人数時の自動シード設定

### 📊 ダッシュボード
- 全トーナメント一覧表示
- トーナメント検索機能
- 統計情報（総数、進行中、完了済み）
- チャンピオン情報の表示

### 📈 統計・分析
- **全体統計**: トーナメント総数、参加者数、対戦数の集計
- **時系列グラフ**: トーナメント数と参加者数の推移を可視化
- **ランキング**:
  - 優勝回数ランキング
  - 勝率ランキング（3試合以上）
  - 総獲得枠数ランキング
  - 平均枠数ランキング（2大会以上）
- **インタラクティブグラフ**: Rechartsによる見やすいデータ可視化

### 📤 エクスポート・共有
- **スクリーンショット**: トーナメントブラケットをPNG形式で保存
- **X/Twitter共有**: カスタムメッセージでツイート
  - 自動テキストコピー機能
  - ワンクリックでX投稿画面を開く
- **クリップボードコピー**: 共有テキストを簡単にコピー

### 🔊 効果音システム
- **ルーレット回転音**: 対戦開始時の臨場感あふれる効果音
- **勝利音**: 優勝者決定時のファンファーレ
- **音声ON/OFF切り替え**: ヘッダーのトグルボタンで簡単切り替え
- **設定永続化**: LocalStorageで音声設定を記憶

## 🚀 セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn
- Vercelアカウント（デプロイする場合）

### ローカル開発環境

1. **リポジトリのクローン**
```bash
git clone <your-repository-url>
cd 管理権限争奪戦
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env.local
```

`.env.local` を編集して以下を設定:
```env
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_session_secret_at_least_32_characters_long
```

4. **Vercel Postgresのセットアップ**
- Vercel CLIをインストール: `npm i -g vercel`
- プロジェクトをリンク: `vercel link`
- Postgresデータベースを作成（Vercelダッシュボードから）
- 環境変数を取得: `vercel env pull .env.local`

5. **効果音ファイルの準備（オプション）**
効果音機能を使用する場合、以下のファイルを準備:
- `public/sounds/roulette-spin.mp3` (5秒程度) - ルーレット回転音
- `public/sounds/victory.mp3` (2-3秒) - 勝利音

推奨サイト:
- [効果音ラボ](https://soundeffect-lab.info/)
- [DOVA-SYNDROME](https://dova-s.jp/)

詳細は `public/sounds/README.md` を参照してください。

6. **開発サーバーの起動**
```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

### 初回ログイン
1. `/login` にアクセス
2. `.env.local` で設定したパスワードを入力
3. ダッシュボードにリダイレクトされます

## 📦 Vercelへのデプロイ

### 手順

1. **Vercelにプロジェクトをインポート**
```bash
vercel
```

2. **Postgresデータベースを作成**
- Vercelダッシュボードでプロジェクトを開く
- Storage → Create Database → Postgres を選択

3. **環境変数を設定**
- Settings → Environment Variables で以下を設定:
  - `ADMIN_PASSWORD`: 管理者パスワード
  - `SESSION_SECRET`: セッション暗号化キー（32文字以上）

4. **デプロイ**
```bash
vercel --prod
```

データベーステーブルは初回アクセス時に自動的に作成されます。

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

### 1. 新規トーナメントの作成
1. ダッシュボードで「新規トーナメント」ボタンをクリック
2. トーナメント名を入力（提案から選択も可能）
3. CSVファイルで参加者をインポート
4. 「トーナメントを作成」をクリック

### 2. トーナメントの進行
1. ダッシュボードからトーナメントを選択
2. 対戦カードをクリックしてルーレットを開始
3. ルーレットで勝者を決定
4. 全てのラウンドが完了すると優勝者が決定

### 3. 履歴の閲覧
- ダッシュボードで過去のトーナメントを閲覧
- 各トーナメントのチャンピオン情報を確認
- 検索機能で特定のトーナメントを素早く検索

### 4. 統計の確認
1. ダッシュボードで「統計を見る」ボタンをクリック
2. 全体統計、時系列グラフ、ランキングを閲覧
3. データが蓄積されるほど詳細な分析が可能に

### 5. 共有・エクスポート
1. トーナメント完了後、優勝者画面で「共有する」をクリック
2. スクリーンショット保存、X共有、テキストコピーから選択
3. X共有時はテキストが自動的にクリップボードにコピーされます

## 🛠 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **データベース**: Vercel Postgres (PostgreSQL)
- **認証**: iron-session
- **グラフ**: Recharts
- **画像処理**: html-to-image
- **デプロイ**: Vercel

## 📁 ファイル構成

```
.
├── app/
│   ├── api/
│   │   ├── auth/           # 認証API
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── session/
│   │   ├── stats/          # 統計API
│   │   │   ├── overview/
│   │   │   └── participants/
│   │   └── tournaments/    # トーナメントAPI
│   │       ├── route.ts
│   │       └── [id]/
│   ├── dashboard/          # ダッシュボードページ
│   │   └── stats/          # 統計ページ
│   ├── login/              # ログインページ
│   ├── tournament/
│   │   ├── new/            # 新規トーナメント作成
│   │   └── [id]/           # 個別トーナメントページ
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ルートページ（リダイレクト）
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── stats/              # 統計コンポーネント
│   │   ├── OverviewCard.tsx
│   │   ├── RankingTable.tsx
│   │   └── TournamentChart.tsx
│   ├── AudioInitializer.tsx
│   ├── CSVImport.tsx
│   ├── ParticipantPanel.tsx
│   ├── ShareMenu.tsx
│   ├── SoundToggle.tsx
│   ├── TournamentBracket.tsx
│   ├── TournamentCard.tsx
│   ├── RouletteOverlay.tsx
│   └── WinnerCelebration.tsx
├── lib/
│   ├── audio-manager.ts    # 効果音管理
│   ├── auth.ts             # 認証ヘルパー
│   ├── db.ts               # データベース接続
│   ├── share-utils.ts      # 共有機能
│   ├── stats-calculator.ts # 統計計算
│   ├── types.ts            # TypeScript型定義
│   ├── csv-processor.ts    # CSV処理
│   └── tournament-manager.ts # トーナメント管理ロジック
├── public/
│   ├── sounds/             # 効果音ファイル
│   │   ├── README.md       # 効果音取得ガイド
│   │   ├── roulette-spin.mp3
│   │   └── victory.mp3
│   └── icon.jpg            # アプリアイコン
├── middleware.ts           # 認証ミドルウェア
├── .env.example            # 環境変数テンプレート
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔒 セキュリティ

- パスワードは環境変数で管理
- セッションはiron-sessionで暗号化
- ミドルウェアで全ての保護ルートをチェック
- Vercelが提供するHTTPS接続

## ライセンス

© 2025 最強管理者権限争奪戦

