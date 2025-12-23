-- ユーザー認証テーブル作成
-- 作成日: 2025-12-23
-- 説明: 複数ユーザーアカウントをサポートするためのテーブル

-- pgcrypto拡張を有効化（パスワードハッシュ用）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- usersテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- インデックス作成（ユーザー名検索用）
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- コメント追加
COMMENT ON TABLE users IS 'ユーザー認証テーブル';
COMMENT ON COLUMN users.id IS 'ユーザーID（UUID）';
COMMENT ON COLUMN users.username IS 'ユーザー名（ログインID）';
COMMENT ON COLUMN users.password_hash IS 'パスワードハッシュ（bcrypt）';
COMMENT ON COLUMN users.created_at IS 'アカウント作成日時';

-- 初期ユーザーを追加
INSERT INTO users (username, password_hash)
VALUES (
  '7/si',
  crypt('Nanasiya7', gen_salt('bf'))
)
ON CONFLICT (username) DO NOTHING;

-- 確認用クエリ（実行結果を表示）
SELECT
  id,
  username,
  created_at,
  '*** パスワードは暗号化されています ***' as password_status
FROM users;
