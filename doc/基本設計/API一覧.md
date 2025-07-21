# API一覧

## 概要
タスク管理アプリケーションのRESTful API仕様書です。FastAPIを使用してタスクのCRUD操作を提供します。

## 基本情報

| 項目 | 値 |
|------|-----|
| ベースURL | `http://localhost:8000` |
| APIプレフィックス | なし（直接パス使用） |
| コンテンツタイプ | `application/json` |
| 認証方式 | なし（現在未実装） |

## エンドポイント一覧

### 1. タスク作成 API

| 項目 | 値 |
|------|-----|
| **メソッド** | POST |
| **エンドポイント** | `/tasks` |
| **概要** | 新しいタスクを作成 |
| **リクエストボディ** | TaskCreate |
| **レスポンス** | TaskCreateResponse (201) |

**リクエスト例:**
```json
{
  "title": "新しいタスク",
  "description": "タスクの説明",
  "deadline": "2025-07-30",
  "assignee": "田中太郎",
  "status": "pending"
}
```

**レスポンス例:**
```json
{
  "message": "タスクが正常に作成されました",
  "task": {
    "id": 1,
    "title": "新しいタスク",
    "description": "タスクの説明",
    "deadline": "2025-07-30",
    "assignee": "田中太郎",
    "status": "pending",
    "created_at": "2025-07-20T10:00:00",
    "updated_at": "2025-07-20T10:00:00"
  }
}
```

---

### 2. タスク一覧取得 API

| 項目 | 値 |
|------|-----|
| **メソッド** | GET |
| **エンドポイント** | `/tasks` |
| **概要** | タスク一覧を取得（フィルタリング・ページネーション対応） |
| **クエリパラメータ** | page, size, status, assignee, deadline_from, deadline_to, overdue_only |
| **レスポンス** | TaskListResponse (200) |

**クエリパラメータ:**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|------------|-----|------|------------|------|
| page | int | No | 1 | ページ番号（1以上） |
| size | int | No | 20 | 1ページあたりのタスク数（1-100） |
| status | string | No | - | ステータスでフィルタリング |
| assignee | string | No | - | 担当者でフィルタリング |
| deadline_from | string | No | - | 期限開始日（YYYY-MM-DD） |
| deadline_to | string | No | - | 期限終了日（YYYY-MM-DD） |
| overdue_only | boolean | No | false | 期限切れタスクのみ |

**レスポンス例:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "タスク1",
      "description": "説明1",
      "deadline": "2025-07-25",
      "assignee": "田中太郎",
      "status": "pending",
      "created_at": "2025-07-20T10:00:00",
      "updated_at": "2025-07-20T10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20,
  "total_pages": 1
}
```

---

### 3. タスク詳細取得 API

| 項目 | 値 |
|------|-----|
| **メソッド** | GET |
| **エンドポイント** | `/tasks/{task_id}` |
| **概要** | 指定されたIDのタスクの詳細情報を取得 |
| **パスパラメータ** | task_id (int) |
| **レスポンス** | TaskResponse (200) |

**レスポンス例:**
```json
{
  "id": 1,
  "title": "タスク詳細",
  "description": "詳細な説明",
  "deadline": "2025-07-25",
  "assignee": "田中太郎",
  "status": "in_progress",
  "created_at": "2025-07-20T10:00:00",
  "updated_at": "2025-07-21T15:30:00"
}
```

---

### 4. タスク更新 API

| 項目 | 値 |
|------|-----|
| **メソッド** | PUT |
| **エンドポイント** | `/tasks/{task_id}` |
| **概要** | 指定されたIDのタスクを更新（部分更新対応） |
| **パスパラメータ** | task_id (int) |
| **リクエストボディ** | TaskUpdate |
| **レスポンス** | TaskResponse (200) |

**リクエスト例:**
```json
{
  "title": "更新されたタスク",
  "status": "completed",
  "assignee": "佐藤花子"
}
```

**レスポンス例:**
```json
{
  "id": 1,
  "title": "更新されたタスク",
  "description": "元の説明",
  "deadline": "2025-07-25",
  "assignee": "佐藤花子",
  "status": "completed",
  "created_at": "2025-07-20T10:00:00",
  "updated_at": "2025-07-21T16:00:00"
}
```

---

### 5. タスク削除確認 API

| 項目 | 値 |
|------|-----|
| **メソッド** | GET |
| **エンドポイント** | `/tasks/{task_id}/delete-confirmation` |
| **概要** | タスク削除前の確認情報を取得 |
| **パスパラメータ** | task_id (int) |
| **レスポンス** | TaskDeleteConfirmationResponse (200) |

**レスポンス例:**
```json
{
  "task": {
    "id": 1,
    "title": "削除予定のタスク",
    "description": "説明",
    "deadline": "2025-07-25",
    "assignee": "田中太郎",
    "status": "in_progress",
    "created_at": "2025-07-20T10:00:00",
    "updated_at": "2025-07-21T15:30:00"
  },
  "warning": "タスク「削除予定のタスク」を削除します。この操作は取り消せません。 進行中のタスクです。"
}
```

---

### 6. タスク削除 API

| 項目 | 値 |
|------|-----|
| **メソッド** | DELETE |
| **エンドポイント** | `/tasks/{task_id}` |
| **概要** | 指定されたIDのタスクを完全削除 |
| **パスパラメータ** | task_id (int) |
| **レスポンス** | TaskDeleteResponse (200) |

**レスポンス例:**
```json
{
  "message": "タスク「削除されたタスク」が正常に削除されました",
  "deleted_task": {
    "id": 1,
    "title": "削除されたタスク",
    "description": "説明",
    "deadline": "2025-07-25",
    "assignee": "田中太郎",
    "status": "pending",
    "created_at": "2025-07-20T10:00:00",
    "updated_at": "2025-07-20T10:00:00"
  }
}
```

## データモデル

### TaskBase（基本スキーマ）

| フィールド | 型 | 必須 | 制約 | 説明 |
|------------|-----|------|------|------|
| title | string | Yes | 1-255文字 | タスクタイトル |
| description | string | No | 最大5000文字 | タスク説明 |
| deadline | date | No | 今日以降 | 期限（YYYY-MM-DD形式） |
| assignee | string | No | 最大100文字 | 担当者 |
| status | string | No | pending/in_progress/completed | ステータス |

### TaskResponse（レスポンス用）

TaskBaseに加えて以下のフィールドを含む：

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | int | タスクID（自動生成） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

## エラーレスポンス

### 共通エラーレスポンス

| ステータスコード | 説明 | レスポンス例 |
|------------------|------|---------------|
| 400 | バリデーションエラー | `{"detail": "更新対象のフィールドが指定されていません"}` |
| 404 | リソースが見つからない | `{"detail": "ID 999 のタスクが見つかりません"}` |
| 422 | リクエストデータ不正 | `{"detail": "ステータスは ['pending', 'in_progress', 'completed'] のいずれかである必要があります"}` |
| 500 | 内部サーバーエラー | `{"detail": "データベースエラーが発生しました"}` |

### バリデーションルール

1. **タスクタイトル**
   - 必須フィールド
   - 1文字以上255文字以内
   - 空白のみは不可

2. **説明**
   - 任意フィールド
   - 最大5000文字

3. **期限**
   - 任意フィールド
   - YYYY-MM-DD形式
   - 今日以降の日付のみ許可

4. **担当者**
   - 任意フィールド
   - 最大100文字

5. **ステータス**
   - pending（未着手）
   - in_progress（進行中）
   - completed（完了）
   - デフォルト値：pending

## セキュリティ

現在の実装では認証・認可は実装されていません。将来の拡張として以下が検討されています：

- JWT認証
- ロールベースアクセス制御
- CORS設定
- レート制限

## OpenAPI / Swagger

FastAPIの自動生成機能により、以下のURLでAPI仕様書を確認できます：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`