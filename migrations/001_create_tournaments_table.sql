-- トーナメント管理テーブル作成
-- 作成日: 2025-12-23
-- 説明: トーナメント情報を保存するメインテーブル

-- tournamentsテーブル
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  format TEXT NOT NULL,
  total_participants INTEGER NOT NULL,
  winner_data JSONB,
  tournament_data JSONB NOT NULL,
  participants JSONB NOT NULL
);

-- インデックス作成（作成日で降順ソート用）
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at
ON tournaments(created_at DESC);

-- コメント追加
COMMENT ON TABLE tournaments IS 'トーナメント管理テーブル';
COMMENT ON COLUMN tournaments.id IS 'トーナメントID（UUID）';
COMMENT ON COLUMN tournaments.name IS 'トーナメント名（例：2025年1月大会）';
COMMENT ON COLUMN tournaments.created_at IS 'トーナメント作成日時';
COMMENT ON COLUMN tournaments.completed_at IS 'トーナメント完了日時（NULL=進行中）';
COMMENT ON COLUMN tournaments.format IS 'トーナメント形式（single-elimination等）';
COMMENT ON COLUMN tournaments.total_participants IS '参加者総数';
COMMENT ON COLUMN tournaments.winner_data IS '優勝者情報（JSONB、完了時のみ）';
COMMENT ON COLUMN tournaments.tournament_data IS 'トーナメント全体データ（JSONB）';
COMMENT ON COLUMN tournaments.participants IS '参加者リスト（JSONB）';
