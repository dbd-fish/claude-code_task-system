-- タスク管理アプリ用データベース初期化スクリプト

-- ユーザーを作成（既に存在する場合はスキップ）
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'taskuser') THEN
      CREATE ROLE taskuser LOGIN PASSWORD 'taskpass';
   END IF;
END
$$;

-- データベースに権限を付与
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskuser;

-- tasksテーブルを作成
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    assignee VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);

-- テーブル所有者をtaskuserに変更
ALTER TABLE tasks OWNER TO taskuser;

-- taskuserにテーブルの全権限を付与
GRANT ALL PRIVILEGES ON TABLE tasks TO taskuser;
GRANT USAGE, SELECT ON SEQUENCE tasks_id_seq TO taskuser;