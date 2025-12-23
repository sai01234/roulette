-- ユーザー「7/si」を追加/更新
-- 作成日: 2025-12-23
-- 説明: ユーザー「7/si」（パスワード: Nanasiya7）を追加、または既存の場合はパスワードを更新

-- pgcrypto拡張が有効か確認
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ユーザーを追加（存在する場合はパスワードを更新）
INSERT INTO users (username, password_hash)
VALUES (
  '7/si',
  crypt('Nanasiya7', gen_salt('bf'))
)
ON CONFLICT (username)
DO UPDATE SET
  password_hash = crypt('Nanasiya7', gen_salt('bf'));

-- 確認
SELECT
  id,
  username,
  created_at,
  'パスワードは暗号化されています' as status
FROM users
WHERE username = '7/si';
