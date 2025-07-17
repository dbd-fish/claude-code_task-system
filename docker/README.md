# Docker環境構築ガイド

## 概要
このプロジェクトは、タスク管理アプリケーション用のDocker環境を提供します。

## 構成
- **Frontend**: React + TypeScript (Port: 3000)
- **Backend**: Node.js + Express (Port: 5000)
- **Database**: PostgreSQL (Port: 5432)

## 必要なもの
- Docker
- Docker Compose

## 起動方法

### 1. 環境設定
```bash
# 環境変数ファイルをコピー
cp .env.example .env
```

### 2. Docker環境の起動
```bash
# 全サービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

### 3. 停止方法
```bash
# 全サービスを停止
docker-compose down

# ボリュームも含めて削除
docker-compose down -v
```

## 開発用コマンド

### データベース関連
```bash
# データベースに接続
docker exec -it <container-name>_db_1 psql -U postgres -d taskdb

# データベースの初期化
docker-compose exec db psql -U postgres -d taskdb -f /docker-entrypoint-initdb.d/init.sql
```

### ログ確認
```bash
# 全サービスのログ
docker-compose logs

# 特定のサービスのログ
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db
```

## トラブルシューティング

### ポートが使用中の場合
```bash
# ポートを確認
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :5432
```

### コンテナの再構築
```bash
# イメージを再構築
docker-compose build --no-cache

# 特定のサービスのみ再構築
docker-compose build --no-cache frontend
```

### データベースのリセット
```bash
# ボリュームを削除してリセット
docker-compose down -v
docker-compose up -d
```

## 環境変数

### .env ファイルの設定項目
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@db:5432/taskdb

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Node.js Environment
NODE_ENV=development

# React App Configuration
REACT_APP_API_URL=http://localhost:5000
```

## 注意事項
- 本番環境では JWT_SECRET を変更してください
- データベースのパスワードも本番環境では変更してください
- 開発環境では Hot Reload が有効になっています