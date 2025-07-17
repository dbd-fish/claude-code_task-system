# タスク管理アプリケーション

React、TypeScript、Node.js、PostgreSQLで構築された本格的なプロダクション対応タスク管理アプリケーション。包括的なDockerコンテナ化、JWT認証、豊富な日本語ドキュメントを備えています。

## 機能

- **ユーザー認証**: セキュアなログインと新規登録
- **タスク管理**: タスクの作成、編集、削除、整理
- **ダッシュボード**: タスク統計と最近のアクティビティの概要
- **レスポンシブデザイン**: デスクトップ、タブレット、モバイルデバイスに対応
- **リアルタイム更新**: 接続されているすべてのクライアントでライブ更新
- **ダークモード**: ライトテーマとダークテーマの切り替え
- **検索・フィルター**: 高度なフィルタリングでタスクを素早く検索
- **エクスポート・インポート**: 様々な形式でタスクをエクスポート

## 技術スタック

### フロントエンド
- React 18 with TypeScript
- レスポンシブデザイン対応のモダンCSS
- 状態管理にReact Hooks
- JestとReact Testing Libraryによる包括的なテストカバレッジ

### バックエンド
- Node.js with Express
- PostgreSQL データベース
- JWT認証
- キャッシュとセッション用Redis
- RESTful API設計

### DevOps
- Dockerコンテナ化
- マルチサービス オーケストレーション用Docker Compose
- Nginxリバースプロキシ
- 自動デプロイメントスクリプト
- ヘルスチェックとモニタリング

## クイックスタート

### 前提条件
- Docker と Docker Compose
- Git（リポジトリのクローン用）

### 簡単インストール（推奨）

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd sample_claude-code
   ```

2. **Docker Composeで起動**
   ```bash
   # 全サービス（データベース、バックエンド、フロントエンド）を起動
   docker-compose -f docker-compose.simple.yml up -d
   ```

3. **アプリケーションへのアクセス**
   - **フロントエンド**: http://localhost:3000
   - **バックエンドAPI**: http://localhost:5000
   - **データベース**: localhost:5432

### テストログイン認証情報
- **管理者**: admin@example.com / password123
- **ユーザー**: test@example.com / password123

### 開発環境
```bash
# ホットリロード付き開発環境を起動
docker-compose up -d

# テスト実行
cd frontend && npm test
cd backend && npm test
```

## デプロイ環境

### 開発環境（ホットリロード付き）
```bash
docker-compose up -d
```

### 本番環境（最適化ビルド）
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### コンテナ管理
```bash
# ログの確認
docker-compose logs -f

# サービス停止
docker-compose down

# コンテナ再構築
docker-compose build
```

## APIドキュメント

### 認証エンドポイント
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ユーザーログイン
- `POST /api/auth/logout` - ユーザーログアウト
- `GET /api/auth/me` - 現在のユーザー取得

### タスクエンドポイント
- `GET /api/tasks` - 全タスク取得
- `POST /api/tasks` - 新規タスク作成
- `GET /api/tasks/:id` - ID指定でタスク取得
- `PUT /api/tasks/:id` - タスク更新
- `DELETE /api/tasks/:id` - タスク削除

### ユーザーエンドポイント
- `GET /api/users/profile` - ユーザープロフィール取得
- `PUT /api/users/profile` - ユーザープロフィール更新
- `DELETE /api/users/account` - ユーザーアカウント削除

## フロントエンドアーキテクチャ

### ディレクトリ構造
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── TaskForm/
│   │   └── TaskList/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── package.json
└── README.md
```

### 主要コンポーネント

- **Dashboard**: 統計情報付きメインアプリケーションダッシュボード
- **Login**: ユーザー認証コンポーネント
- **TaskForm**: タスクの作成・編集
- **TaskList**: タスクの表示・管理
- **Custom Hooks**: タスク管理用の再利用可能なロジック

### 状態管理

アプリケーションはReact hooksを使用した状態管理:
- `useTaskManagement`: タスク操作の処理
- `useAuth`: 認証状態の管理
- `useLocalStorage`: データのローカル永続化

## バックエンドアーキテクチャ

### ディレクトリ構造
```
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── package.json
└── README.md
```

### 主要機能

- **JWT認証**: セキュアなトークンベース認証
- **入力検証**: 包括的なリクエスト検証
- **エラーハンドリング**: 集約化エラーハンドリング
- **レート制限**: 悪用からの保護
- **ログ出力**: Winstonによる構造化ログ
- **テスト**: ユニットテストと統合テスト

## テスト

### フロントエンドテスト
```bash
cd frontend
npm test                    # Jest + React Testing Libraryテスト実行
npm run test:coverage       # カバレッジレポート生成
npm run lint               # ESLintチェック
npm run format             # Prettierフォーマット
```

### バックエンドテスト
```bash
cd backend
npm test                   # Mocha + Chaiテスト実行
npm run test:coverage      # カバレッジレポート生成
npm run lint              # ESLintチェック
node test-auth.js         # 認証システムテスト
```

### テスト機能
- **ユニットテスト**: コンポーネントとAPIエンドポイント
- **統合テスト**: データベース操作とAPIフロー
- **認証テスト**: JWTトークン検証とユーザー管理
- **カバレッジレポート**: 詳細なテストカバレッジ分析

## モニタリング・ログ

### コンテナモニタリング
```bash
# コンテナ状態確認
docker-compose ps

# リアルタイムログ表示
docker-compose logs -f

# 特定サービスのログ表示
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db

# リソース使用量監視
docker stats
```

### ヘルスチェック
- **データベース**: 自動接続ヘルスチェック
- **バックエンドAPI**: `/health`エンドポイントでヘルス確認
- **フロントエンド**: Nginxステータス監視

## セキュリティ

### 実装済みセキュリティ対策

- **認証**: セキュアストレージ付きJWTトークン
- **認可**: ロールベースアクセス制御
- **入力検証**: 包括的な入力サニタイゼーション
- **CORS**: クロスオリジンリソース共有設定
- **レート制限**: ブルートフォース攻撃からの保護
- **HTTPS**: 本番環境でのSSL/TLS暗号化
- **セキュリティヘッダー**: 包括的なセキュリティヘッダー
- **SQLインジェクション防止**: パラメータ化クエリ
- **XSS保護**: コンテンツセキュリティポリシー

## パフォーマンス

### 最適化手法

- **コード分割**: コンポーネントの遅延読み込み
- **キャッシュ**: 頻繁にアクセスされるデータのRedisキャッシュ
- **データベース最適化**: インデックス付きクエリとコネクションプーリング
- **アセット最適化**: 最小化と圧縮
- **CDN**: 静的アセット用コンテンツ配信ネットワーク

## 貢献方法

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

### 開発ガイドライン

- TypeScriptベストプラクティスに従う
- 包括的なテストを記述
- 従来のコミットメッセージを使用
- 必要に応じてドキュメントを更新
- すべてのリンターとテストを通すことを確認

## Documentation

### 📚 Japanese Documentation (docs/ folder)
- **システム操作マニュアル.md** - Complete user manual with login instructions
- **Docker環境構築ガイド.md** - Docker setup and troubleshooting guide
- **開発・テスト実行ガイド.md** - Development and testing workflows
- **API仕様書.md** - Complete REST API documentation

### Quick Documentation Access
```bash
# View documentation structure
ls docs/

# Quick start guide for Windows users
cat docs/Docker環境構築ガイド.md
```

## 環境変数

利用可能なすべての設定オプションについては `.env.example` を参照してください。

主要な変数:
- `DATABASE_URL`: PostgreSQL接続文字列
- `JWT_SECRET`: JWTトークン用シークレットキー
- `REDIS_URL`: Redis接続文字列
- `NODE_ENV`: 環境（development/production）

## トラブルシューティング

### よくある問題

1. **コンテナアクセス問題**
   ```bash
   # コンテナ状態確認
   docker-compose ps
   
   # コンテナログ表示
   docker-compose logs <service_name>
   ```

2. **ポート競合**
   - ポート3000、5000、5432が利用可能であることを確認
   - 実行中の場合はApache2を停止: `sudo systemctl stop apache2`

3. **Docker権限問題（Linux）**
   ```bash
   # ユーザーをdockerグループに追加
   sudo usermod -aG docker $USER
   # ターミナルセッションを再起動
   ```

4. **Windows/WSL問題**
   - Windowsパスを使用: `C:\Users\{user_name}\Documents\github\sample_claude-code`
   - Docker Desktopが実行中であることを確認
   - Docker DesktopでWSL統合を有効化

### クイック修正

```bash
# 全サービス再起動
docker-compose down && docker-compose up -d

# クリアして再構築
docker-compose down -v
docker-compose build
docker-compose up -d

# サービスヘルス確認
curl http://localhost:3000  # フロントエンド
curl http://localhost:5000  # バックエンドAPI
```

### ヘルプの取得

- 包括的なトラブルシューティング確認: `docs/Docker環境構築ガイド.md`
- アプリケーションログ表示: `docker-compose logs -f`
- 認証テスト: `cd backend && node test-auth.js`

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## プロジェクトの状況

### ✅ 完成済み機能（15/15タスク）
- 完全なReact + TypeScriptフロントエンド
- REST API付きフルNode.js + Expressバックエンド
- Sequelize ORM付きPostgreSQLデータベース
- JWT認証システム
- Dockerコンテナ化（開発・本番）
- 包括的なテストインフラ
- 日本語ドキュメントスイート
- Windows/WSL互換性

### 🚀 本番環境対応済み
このアプリケーションは以下を備えた本番環境対応済みです:
- 最適化されたDockerコンテナ
- セキュリティベストプラクティス
- 包括的なエラーハンドリング
- ヘルスモニタリング
- パフォーマンス最適化

## 謝辞

- 堅牢なフロントエンドフレームワークを提供するReactチーム
- Node.jsとExpress.jsコミュニティ
- 信頼性の高いデータ永続化を提供するPostgreSQL
- シームレスなコンテナ化を実現するDocker
- 開発自動化を支援するClaude Code
- tmuxベースのマルチエージェント開発手法