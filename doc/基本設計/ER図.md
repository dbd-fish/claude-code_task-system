# ER図（エンティティ関係図）

## 概要
タスク管理アプリのエンティティ関係図です。本書では、データベースの論理設計、エンティティ間の関係、属性の詳細、将来的な拡張案を示します。

## 現行バージョン ER図

### 基本ER図（Mermaid形式）
```mermaid
erDiagram
    TASKS {
        SERIAL id PK "主キー（自動採番）"
        VARCHAR(255) title NOT_NULL "タスクタイトル"
        TEXT description NULL "タスク説明"
        DATE deadline NULL "期限"
        VARCHAR(100) assignee NULL "担当者"
        VARCHAR(20) status NOT_NULL "ステータス"
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL "作成日時"
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL "更新日時"
    }
```

### 詳細ER図（属性・制約付き）
```mermaid
erDiagram
    TASKS {
        SERIAL id PK "主キー：自動採番"
        VARCHAR(255) title NOT_NULL "タスクタイトル：必須"
        TEXT description NULL "タスク説明：任意"
        DATE deadline NULL "期限：任意"
        VARCHAR(100) assignee NULL "担当者：任意"
        VARCHAR(20) status NOT_NULL "ステータス：デフォルト'pending'"
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL "作成日時：自動設定"
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL "更新日時：自動更新"
    }
```

## エンティティ詳細仕様

### TASKS（タスクエンティティ）

#### 基本情報
- **論理名**: タスク
- **物理名**: tasks
- **概要**: システムで管理される作業項目の基本情報を格納
- **エンティティ種別**: マスタエンティティ

#### 属性一覧

| 論理名 | 物理名 | データ型 | 桁数 | NULL | デフォルト値 | 説明 |
|--------|--------|----------|------|------|-------------|------|
| ID | id | SERIAL | - | NOT NULL | AUTO_INCREMENT | 主キー（システム生成） |
| タスクタイトル | title | VARCHAR | 255 | NOT NULL | - | タスクの名称 |
| タスク説明 | description | TEXT | - | NULL | NULL | タスクの詳細内容 |
| 期限 | deadline | DATE | - | NULL | NULL | タスクの完了期限 |
| 担当者 | assignee | VARCHAR | 100 | NULL | NULL | タスクの担当者名 |
| ステータス | status | VARCHAR | 20 | NOT NULL | 'pending' | タスクの進行状況 |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | - | NOT NULL | CURRENT_TIMESTAMP | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | - | NOT NULL | CURRENT_TIMESTAMP | レコード最終更新日時 |

#### ドメイン定義

##### ステータス（status）
| 物理値 | 論理値 | 説明 | 備考 |
|--------|--------|------|------|
| pending | 未着手 | タスクが登録されたが開始されていない | 初期状態 |
| in_progress | 進行中 | タスクが実行中 | 作業開始後 |
| completed | 完了 | タスクが完了 | 最終状態 |

#### 業務ルール
1. **主キー制約**: id は自動採番により一意性を保証
2. **必須項目**: title, status は必須入力
3. **文字数制限**: title は255文字、assignee は100文字まで
4. **ステータス遷移**: pending → in_progress → completed の順序推奨
5. **日時管理**: created_at は作成時自動設定、updated_at は更新時自動更新
6. **期限設定**: deadline は過去日付も設定可能（既存タスクの期限変更対応）

## データ関係

### 現行バージョン
現在は単一エンティティ（TASKS）のみの構成で、エンティティ間の関係は存在しません。

### 正規化レベル
- **第1正規形**: 満たす（原子的な値のみ）
- **第2正規形**: 満たす（部分関数従属なし）
- **第3正規形**: 満たす（推移関数従属なし）

## 将来拡張案

### フェーズ2: ユーザー管理機能追加
```mermaid
erDiagram
    TASKS {
        SERIAL id PK
        VARCHAR(255) title NOT_NULL
        TEXT description NULL
        DATE deadline NULL
        INTEGER assignee_id FK
        VARCHAR(20) status NOT_NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    USERS {
        SERIAL id PK
        VARCHAR(100) username NOT_NULL
        VARCHAR(255) email NOT_NULL
        VARCHAR(100) display_name NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    TASKS }o--|| USERS : "assigned_to"
```

### フェーズ3: プロジェクト・カテゴリ機能追加
```mermaid
erDiagram
    TASKS {
        SERIAL id PK
        VARCHAR(255) title NOT_NULL
        TEXT description NULL
        DATE deadline NULL
        INTEGER assignee_id FK
        INTEGER project_id FK
        INTEGER category_id FK
        VARCHAR(20) status NOT_NULL
        INTEGER priority NOT_NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    USERS {
        SERIAL id PK
        VARCHAR(100) username NOT_NULL
        VARCHAR(255) email NOT_NULL
        VARCHAR(100) display_name NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    PROJECTS {
        SERIAL id PK
        VARCHAR(255) name NOT_NULL
        TEXT description NULL
        INTEGER owner_id FK
        DATE start_date NULL
        DATE end_date NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    CATEGORIES {
        SERIAL id PK
        VARCHAR(100) name NOT_NULL
        VARCHAR(7) color_code NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    TASKS }o--|| USERS : "assigned_to"
    TASKS }o--|| PROJECTS : "belongs_to"
    TASKS }o--|| CATEGORIES : "categorized_as"
    PROJECTS }o--|| USERS : "owned_by"
```

### フェーズ4: コメント・ファイル添付機能追加
```mermaid
erDiagram
    TASKS {
        SERIAL id PK
        VARCHAR(255) title NOT_NULL
        TEXT description NULL
        DATE deadline NULL
        INTEGER assignee_id FK
        INTEGER project_id FK
        INTEGER category_id FK
        VARCHAR(20) status NOT_NULL
        INTEGER priority NOT_NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    TASK_COMMENTS {
        SERIAL id PK
        INTEGER task_id FK
        INTEGER user_id FK
        TEXT comment NOT_NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    TASK_ATTACHMENTS {
        SERIAL id PK
        INTEGER task_id FK
        INTEGER user_id FK
        VARCHAR(255) file_name NOT_NULL
        VARCHAR(255) file_path NOT_NULL
        BIGINT file_size NOT_NULL
        VARCHAR(100) mime_type NOT_NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
    }
    
    USERS {
        SERIAL id PK
        VARCHAR(100) username NOT_NULL
        VARCHAR(255) email NOT_NULL
        VARCHAR(100) display_name NULL
        TIMESTAMP_WITH_TIMEZONE created_at NOT_NULL
        TIMESTAMP_WITH_TIMEZONE updated_at NOT_NULL
    }
    
    TASKS ||--o{ TASK_COMMENTS : "has"
    TASKS ||--o{ TASK_ATTACHMENTS : "has"
    TASK_COMMENTS }o--|| USERS : "posted_by"
    TASK_ATTACHMENTS }o--|| USERS : "uploaded_by"
```

## インデックス戦略

### 現行バージョン
```sql
-- 基本検索用インデックス
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- 複合検索用インデックス
CREATE INDEX idx_tasks_status_deadline ON tasks(status, deadline);

-- 部分インデックス
CREATE INDEX idx_tasks_overdue ON tasks(deadline) 
WHERE deadline < CURRENT_DATE AND status != 'completed';
```

### 拡張後のインデックス案
```sql
-- ユーザー関連
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- プロジェクト関連  
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- カテゴリ関連
CREATE INDEX idx_tasks_category_id ON tasks(category_id);

-- 複合検索用
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);
```

## パフォーマンス考慮事項

### 想定クエリパターン
1. **基本検索**: WHERE status = ? / WHERE assignee = ?
2. **複合検索**: WHERE status = ? AND deadline BETWEEN ? AND ?
3. **ソート**: ORDER BY created_at DESC / ORDER BY deadline ASC
4. **期限切れ検索**: WHERE deadline < CURRENT_DATE AND status != 'completed'
5. **ページネーション**: LIMIT ? OFFSET ?

### 最適化ポイント
1. **スロークエリ**: 定期的なログ監視・分析
2. **インデックス効率**: EXPLAIN ANALYZE による実行計画確認
3. **統計情報**: 定期的なANALYZE実行
4. **パーティション**: 大量データ時の年月別分割検討

## データ整合性保証

### 制約定義
1. **主キー制約**: 各エンティティの一意性保証
2. **外部キー制約**: 拡張時の参照整合性保証  
3. **CHECK制約**: ステータス値の妥当性チェック
4. **NOT NULL制約**: 必須項目の入力保証
5. **UNIQUE制約**: 重複防止（拡張時のemail等）

### トランザクション設計
1. **ACID特性**: 全ての更新処理でトランザクション使用
2. **分離レベル**: READ COMMITTED（デフォルト）
3. **デッドロック**: タイムアウト設定による回避
4. **長時間トランザクション**: バッチ処理時の分割実行