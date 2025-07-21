# T005 データベースモデル定義（タスクテーブル） 完了レポート

## 作成した成果物

### 1. SQLAlchemyモデル実装
**場所**: `/app/backend/app/models.py`

#### Taskモデル
- **ベース**: SQLAlchemy declarative_baseを使用
- **テーブル名**: tasks
- **全8カラム実装**:
  - `id`: SERIAL PRIMARY KEY（自動採番）
  - `title`: VARCHAR(255) NOT NULL（タスクタイトル）
  - `description`: TEXT（タスク説明）
  - `deadline`: DATE（期限）
  - `assignee`: VARCHAR(100)（担当者）
  - `status`: VARCHAR(20) DEFAULT 'pending'（ステータス）
  - `created_at`: TIMESTAMP（作成日時、自動設定）
  - `updated_at`: TIMESTAMP（更新日時、自動更新）

#### インデックス設定
- `idx_tasks_status`: status列
- `idx_tasks_deadline`: deadline列  
- `idx_tasks_assignee`: assignee列

#### 追加機能
- `to_dict()`: 辞書形式変換メソッド
- `get_valid_statuses()`: 有効ステータス一覧
- `is_overdue()`: 期限切れ判定メソッド
- `__repr__()`: オブジェクト文字列表現

### 2. アプリケーション統合
**場所**: `/app/backend/main.py`

#### startup_event追加
- アプリ起動時にテーブル自動作成
- データベース接続テスト
- モデルの自動読み込み

#### health_check改善
- 実際のデータベース接続状態を返却

## 技術仕様

### データ型マッピング
| ER図 | PostgreSQL | SQLAlchemy |
|------|------------|------------|
| serial | SERIAL | Integer + primary_key |
| varchar(n) | VARCHAR(n) | String(n) |
| text | TEXT | Text |
| date | DATE | Date |
| timestamp | TIMESTAMP | DateTime |

### 制約実装
- NOT NULL制約: `nullable=False`
- DEFAULT値: `default`パラメータ
- 自動更新: `onupdate=func.now()`
- サーバーデフォルト: `server_default=func.now()`

## 次のステップ
- T006: タスク登録API開発（このモデルを使用）
- T007-T009: CRUD API実装
- 実際のデータベース操作テスト