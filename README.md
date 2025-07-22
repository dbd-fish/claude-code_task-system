# タスク管理アプリケーション

FastAPIとReactを使用したモダンなタスク管理アプリケーション。Docker環境で簡単に開発・デプロイできます。

## 🚀 機能

- **タスクCRUD操作**: 作成、読み取り、更新、削除
- **フィルタリング**: ステータス、担当者、期限による絞り込み
- **ページネーション**: 大量のタスクを効率的に表示
- **リアルタイム更新**: モダンなReactフロントエンド
- **API ドキュメント**: 自動生成されるSwagger UI

## 🛠️ 技術スタック

### バックエンド
- **FastAPI**: 高性能なPython WebAPIフレームワーク
- **SQLAlchemy**: ORMとデータベースマイグレーション
- **PostgreSQL**: 本番環境用データベース
- **SQLite**: 開発環境用軽量データベース
- **Pydantic**: データバリデーションとシリアライゼーション

### フロントエンド
- **React 18**: モダンなUIライブラリ
- **Vite**: 高速ビルドツール
- **React Router DOM v6**: SPA ルーティング
- **TypeScript**: 型安全性の向上

### インフラ
- **Docker & Docker Compose**: コンテナ化とオーケストレーション
- **Nginx**: 本番環境でのリバースプロキシ（オプション）

## 📋 必要条件

- Docker 24.0+
- Docker Compose 2.0+
- Node.js 18+ (開発時)
- Python 3.11+ (開発時)

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd sample_claude-code
```

### 2. 環境変数の設定

```bash
# バックエンド環境変数
cp app/backend/.env.example app/backend/.env

# フロントエンド環境変数
cp app/frontend/.env.example app/frontend/.env
```

### 3. Docker Composeで起動

```bash
# 全体の起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

### 4. アプリケーションへのアクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

## 📝 開発環境セットアップ

詳細な環境構築手順は [`doc/基本設計/環境構築手順書.md`](doc/基本設計/環境構築手順書.md) を参照してください。

### ローカル開発

```bash
# バックエンド
cd app/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# フロントエンド
cd app/frontend
npm install
npm run dev
```

## 🧪 テスト

### 統合テスト

```bash
# 統合テストの実行
python integration_test_final_fixed.py
```

### 単体テスト

```bash
# バックエンドテスト
cd app/backend
pytest

# フロントエンドテスト
cd app/frontend
npm test
```

## 📊 API エンドポイント

### タスク管理API

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/tasks` | タスク一覧取得 |
| POST | `/tasks` | タスク作成 |
| GET | `/tasks/{id}` | 特定タスク取得 |
| PUT | `/tasks/{id}` | タスク更新 |
| DELETE | `/tasks/{id}` | タスク削除 |

### その他

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/` | API情報 |
| GET | `/health` | ヘルスチェック |
| GET | `/docs` | Swagger UI |

詳細なAPI仕様は [`doc/基本設計/API一覧.md`](doc/基本設計/API一覧.md) を参照してください。

## 📁 プロジェクト構造

```
sample_claude-code/
├── app/
│   ├── backend/                 # FastAPI バックエンド
│   │   ├── app/                # アプリケーションコード
│   │   ├── tests/              # テストファイル
│   │   └── requirements.txt    # Python依存関係
│   └── frontend/               # React フロントエンド
│       ├── src/               # ソースコード
│       ├── public/            # 静的ファイル
│       └── package.json       # Node.js依存関係
├── doc/                        # プロジェクト文書
│   ├── 要件定義/              # 要件定義書
│   └── 基本設計/              # 設計書
├── docker-compose.yml          # Docker Compose設定
└── integration_test_final_fixed.py  # 統合テスト
```

## 🔧 設定

### 環境変数

#### バックエンド (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@database:5432/taskmanager
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
```

#### フロントエンド (.env)
```env
VITE_API_URL=http://localhost:8000
NODE_ENV=development
VITE_DEBUG=true
```

## 🐳 Docker 設定

### 本番環境での最適化

- マルチステージビルドによるイメージサイズ削減
- 非rootユーザーでの実行によるセキュリティ向上
- ヘルスチェック機能
- リソース制限設定

### ボリューム設定

- データベースデータの永続化
- node_modulesキャッシュによる高速化
- 開発時のホットリロード対応

## 🚦 品質保証

### テスト戦略

- **統合テスト**: 成功率83.3%達成
- **単体テスト**: 主要機能のカバレッジ
- **APIテスト**: 全エンドポイントの動作確認

### コード品質

- TypeScript使用による型安全性
- ESLintによるコード品質チェック
- Prettierによるコードフォーマット

## 📚 ドキュメント

- [要件定義書](doc/要件定義/要件定義.md)
- [基本設計書](doc/基本設計/)
- [API仕様書](doc/基本設計/API一覧.md)
- [環境構築手順](doc/基本設計/環境構築手順書.md)

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 トラブルシューティング

### よくある問題

#### Docker関連
- **ポートが使用中**: `docker-compose down` でコンテナを停止
- **データベース接続エラー**: `docker-compose up database` でDBを先に起動

#### 開発環境
- **フロントエンドの起動失敗**: `npm install` で依存関係を再インストール
- **バックエンドの起動失敗**: `pip install -r requirements.txt` で依存関係を再インストール

### ログ確認

```bash
# 全体のログ
docker-compose logs -f

# 特定サービスのログ
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📞 サポート

問題や質問がある場合は、プロジェクトのIssueトラッカーを使用してください。