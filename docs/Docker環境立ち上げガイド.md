# Docker環境立ち上げガイド

## 📋 概要

このガイドでは、タスク管理システムの開発環境と本番環境のDocker立ち上げ手順を説明します。

## 🏗️ 構成

### 開発環境 (`docker-compose.yml`)
- **3コンテナ構成**: db, backend, frontend
- **ホットリロード対応**: ファイル変更時に自動反映
- **開発用設定**: テスト実行可能、デバッグ情報表示

### 本番環境 (`docker-compose.prod.yml`)
- **3コンテナ構成**: db, backend, frontend
- **最適化済み**: nginx静的配信、本番用ビルド
- **本番用設定**: セキュリティ強化、ログ最小化

## 🚀 開発環境の立ち上げ

### 前提条件
- Docker Desktop がインストール済み
- PowerShell または コマンドプロンプト

### 手順

```powershell
# 1. プロジェクトディレクトリに移動
cd C:\Users\{user_name}\Documents\github\sample_claude-code

# 2. 既存のコンテナを停止・削除（必要に応じて）
docker-compose down

# 3. 開発環境を起動（バックグラウンド）
docker-compose up -d --build

# 4. コンテナの状況確認
docker-compose ps

# 5. ログ確認（必要に応じて）
docker-compose logs -f
```

### アクセス方法
- **フロントエンド**: http://localhost:3000 (React開発サーバー)
- **バックエンドAPI**: http://localhost:5000
- **データベース**: localhost:5432 (外部接続用)

### 開発時の操作

```powershell
# コンテナ内でコマンド実行
docker-compose exec backend npm test              # バックエンドテスト
docker-compose exec frontend npm test             # フロントエンドテスト
docker-compose exec backend npm run test:integration # 統合テスト

# コンテナに直接接続
docker exec -it task-manager-backend-dev bash     # バックエンドコンテナ
docker exec -it task-manager-frontend-dev bash    # フロントエンドコンテナ

# 環境停止
docker-compose down

# 環境停止＋ボリューム削除
docker-compose down -v
```

## 🏭 本番環境の立ち上げ

### 手順

```powershell
# 1. プロジェクトディレクトリに移動
cd C:\Users\{user_name}\Documents\github\sample_claude-code

# 2. 開発環境が起動している場合は停止
docker-compose down

# 3. 本番環境を起動
docker-compose -f docker-compose.prod.yml up -d --build

# 4. コンテナの状況確認
docker-compose -f docker-compose.prod.yml ps

# 5. ログ確認
docker-compose -f docker-compose.prod.yml logs
```

### アクセス方法
- **フロントエンド**: http://localhost:3000 (nginx)
- **バックエンドAPI**: http://localhost:5000
- **データベース**: localhost:5432

### 本番環境での操作

```powershell
# コンテナ内でコマンド実行
docker-compose -f docker-compose.prod.yml exec backend npm test

# コンテナに直接接続
docker exec -it task-manager-backend-prod bash    # バックエンドコンテナ
docker exec -it task-manager-frontend-prod bash   # フロントエンドコンテナ（nginx）

# 環境停止
docker-compose -f docker-compose.prod.yml down

# 環境停止＋ボリューム削除
docker-compose -f docker-compose.prod.yml down -v
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ポート競合エラー
```
Error: bind: address already in use
```

**解決方法:**
```powershell
# 使用中のポートを確認
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# プロセスを終了（PIDを確認してから）
taskkill /PID <PID> /F
```

#### 2. Dockerビルドエラー
```
failed to solve: failed to checksum file
```

**解決方法:**
```powershell
# キャッシュクリア
docker system prune -a

# 強制リビルド
docker-compose build --no-cache
```

#### 3. データベース接続エラー
```
Error: connect ECONNREFUSED
```

**解決方法:**
```powershell
# データベースコンテナの状況確認
docker-compose exec db pg_isready -U postgres

# データベースログ確認
docker-compose logs db
```

#### 4. ファイル権限エラー（Windows）
```
Permission denied
```

**解決方法:**
```powershell
# Docker Desktop の設定で共有ドライブを確認
# WSL2の場合は、WSL内でコマンド実行を検討
```

## 📊 各環境の違い

| 項目 | 開発環境 | 本番環境 |
|------|----------|----------|
| コンテナ名 | `*-dev` | `*-prod` |
| フロントエンド | React開発サーバー | nginx静的配信 |
| ホットリロード | ✅ 対応 | ❌ なし |
| ボリュームマウント | ✅ ソースコード | ❌ なし |
| 環境変数 | `NODE_ENV=development` | `NODE_ENV=production` |
| ログレベル | 詳細 | 最小限 |
| セキュリティ | 開発用 | 本番用強化 |

## 🔍 ヘルスチェック

両環境とも以下のヘルスチェックが設定されています：

```powershell
# 個別コンテナの健康状態確認
docker ps --format "table {{.Names}}\t{{.Status}}"

# 各サービスの動作確認
curl http://localhost:3000    # フロントエンド
curl http://localhost:5000    # バックエンドAPI
```

## 📝 開発ワークフロー

### 推奨手順

1. **開発開始時**
   ```powershell
   docker-compose up -d --build
   ```

2. **コード変更時**
   - ファイル保存で自動リロード（開発環境）
   - ブラウザで確認: http://localhost:3000

3. **テスト実行**
   ```powershell
   docker-compose exec backend npm test
   docker-compose exec frontend npm test
   ```

4. **本番確認時**
   ```powershell
   docker-compose down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

5. **開発終了時**
   ```powershell
   docker-compose down
   ```

---

**🚀 これで開発・本番環境の構築が完了です！**