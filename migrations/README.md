# データベースマイグレーション

このフォルダには、Supabase PostgreSQLデータベースのマイグレーションSQLファイルが含まれています。

## マイグレーションファイル一覧

### 001_create_tournaments_table.sql
- **目的**: トーナメント管理テーブルの作成
- **内容**:
  - `tournaments` テーブル作成
  - インデックス作成
  - テーブル・カラムのコメント追加

### 002_create_users_table.sql
- **目的**: ユーザー認証テーブルの作成
- **内容**:
  - `pgcrypto` 拡張機能の有効化
  - `users` テーブル作成
  - インデックス作成
  - 初期ユーザー追加（7/si）
  - パスワードはbcryptでハッシュ化

## マイグレーション実行方法

### Supabaseダッシュボードで実行

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニューから **「SQL Editor」** を選択
4. **「New query」** をクリック
5. マイグレーションファイルの内容をコピー＆ペースト
6. **「Run」** をクリックして実行

### Supabase CLIで実行（オプション）

```bash
# Supabase CLIをインストール
npm install -g supabase

# プロジェクトにリンク
supabase link --project-ref your-project-ref

# マイグレーションを実行
supabase db push
```

## 確認方法

マイグレーション実行後、以下のSQLで確認できます：

```sql
-- テーブル一覧
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- tournamentsテーブルの構造
\d tournaments
```

## トラブルシューティング

### テーブルがすでに存在する場合

マイグレーションファイルは `IF NOT EXISTS` を使用しているため、すでにテーブルが存在する場合でも安全に実行できます。

### テーブルを削除して再作成する場合

```sql
-- 注意: すべてのデータが削除されます！
DROP TABLE IF EXISTS tournaments CASCADE;
```

その後、マイグレーションファイルを再実行してください。
