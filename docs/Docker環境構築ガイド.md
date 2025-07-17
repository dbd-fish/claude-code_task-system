# Docker 環境構築ガイド

## 📋 概要

このガイドは、タスク管理システムのDocker環境セットアップから、よくある問題の解決方法まで包括的にカバーしています。

**Windows環境でのDocker利用に最適化された内容です。**

## 🚀 簡単起動方法

### Windows環境での起動手順

**Windows コマンドプロンプトで実行:**

```cmd
cd C:\Users\{user_name}\Documents\github\sample_claude-code
docker-compose -f docker-compose.simple.yml up -d
```

**それだけです！**

### 🔑 ログイン情報

**テストアカウント:**
- **管理者**: `admin@example.com` / `password123`
- **一般ユーザー**: `test@example.com` / `password123`

### 📱 アクセス先

- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:5000
- **データベース**: localhost:5432

## 🔧 システム構成

### シンプル化された構成 (コンテナ数: 3個)
- ✅ **データベース** (PostgreSQL)
- ✅ **バックエンド** (Node.js + Express)  
- ✅ **フロントエンド** (React + 内蔵Nginx)

### 削除された複雑な構成
- ❌ Redis (削除)
- ❌ 外部Nginx (削除)
- ❌ 複雑な設定ファイル (シンプル化)

## 🔍 詳細セットアップ手順

### 1. 前提条件の確認
```bash
# Docker & Docker Composeのインストール確認
docker --version
docker-compose --version

# Dockerサービスの起動確認
# Windows: Docker Desktop が起動していることを確認
```

### 2. Docker権限の設定 (Linux/WSLの場合)
```bash
# 現在のユーザーをdockerグループに追加（初回のみ）
sudo usermod -aG docker $USER

# ログアウト・ログインまたはセッション再開
newgrp docker

# 権限確認
groups $USER
```

### 3. Apache2競合の解決（重要）
```bash
# Apache2の状態確認
sudo systemctl status apache2

# Apache2が起動している場合は停止
sudo systemctl stop apache2

# 自動起動の無効化（推奨）
sudo systemctl disable apache2
```

### 4. Docker環境の起動
```bash
# プロジェクトディレクトリに移動
cd /path/to/sample_claude-code

# 既存コンテナの停止・削除（必要な場合）
docker-compose down

# シンプル版Dockerコンテナ起動
docker-compose -f docker-compose.simple.yml up -d

# 起動状況の確認
docker-compose -f docker-compose.simple.yml ps
```

### 5. アクセス確認
```bash
# ポート使用状況の確認
ss -tuln | grep -E ':3000|:5000|:5432'

# サービステスト
curl http://localhost:3000      # フロントエンド
curl http://localhost:5000      # バックエンドAPI
```

## 🔍 トラブルシューティング

### A. Apache2 ポート競合エラー

**症状**: ポート80アクセス時にApache2のデフォルトページが表示される

**解決手順**:
```bash
# 1. Apache2の停止
sudo systemctl stop apache2
sudo systemctl disable apache2

# 2. Docker環境の再起動
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml up -d

# 3. 確認
curl http://localhost:3000
```

### B. Docker権限エラー

**症状**: `permission denied while trying to connect to the Docker daemon socket`

**解決手順**:
```bash
# Docker daemonの状態確認
sudo systemctl status docker

# Docker daemonの起動
sudo systemctl start docker

# ユーザー権限の確認・設定
sudo usermod -aG docker $USER
newgrp docker
```

### C. フロントエンド接続エラー

**症状**: `Connection reset by peer` または接続拒否

**解決手順**:
```bash
# 1. コンテナ状態確認
docker-compose -f docker-compose.simple.yml ps

# 2. フロントエンドログ確認
docker-compose -f docker-compose.simple.yml logs frontend

# 3. 必要に応じて再ビルド
docker-compose -f docker-compose.simple.yml build frontend
docker-compose -f docker-compose.simple.yml up -d frontend
```

### D. Windows環境での特殊問題

#### ファイルパス問題
```bash
# WSLパスではなく、Windowsパスを使用
cd C:\Users\{user_name}\Documents\github\sample_claude-code

# PowerShell の場合
Set-Location "C:\Users\{user_name}\Documents\github\sample_claude-code"
```

#### ポート確認（Windows）
```powershell
# Windows PowerShell で実行
netstat -an | findstr ":3000"
netstat -an | findstr ":5000"
```

#### Windows Docker Desktop設定
1. **Docker Desktop** を起動
2. **Settings** → **Resources** → **WSL Integration**
3. **Ubuntu** (使用中のWSL) を有効化
4. **Apply & Restart**

## 📈 システム監視

### コンテナ状態確認
```bash
# 全コンテナの状態
docker-compose -f docker-compose.simple.yml ps

# リアルタイムログ監視
docker-compose -f docker-compose.simple.yml logs -f

# 特定サービスのログ
docker-compose -f docker-compose.simple.yml logs frontend
docker-compose -f docker-compose.simple.yml logs backend
docker-compose -f docker-compose.simple.yml logs db
```

### パフォーマンス監視
```bash
# リソース使用状況
docker stats

# コンテナ詳細情報
docker inspect <container_name>

# ボリューム使用状況
docker system df
```

## 🛑 システム停止・削除

### 通常の停止
```bash
# 全サービス停止（データ保持）
docker-compose -f docker-compose.simple.yml stop

# 完全停止（コンテナ削除、データ保持）
docker-compose -f docker-compose.simple.yml down
```

### 完全削除
```bash
# コンテナ・ネットワーク・ボリューム全削除
docker-compose -f docker-compose.simple.yml down -v

# 未使用イメージの削除
docker image prune -a

# システム全体のクリーンアップ
docker system prune -a --volumes
```

## 🎯 クイック解決チェックリスト

### システムが起動しない場合
- [ ] Docker Desktop が起動している（Windows）
- [ ] ユーザーがdockerグループに所属している（Linux）
- [ ] Apache2が停止している
- [ ] ポート3000, 5000, 5432が空いている
- [ ] docker-compose.simple.yml を使用している

### アクセスできない場合
- [ ] `docker-compose -f docker-compose.simple.yml ps` で全コンテナが起動中
- [ ] Windows ブラウザからアクセスしている
- [ ] `docker-compose -f docker-compose.simple.yml logs` でエラーがない
- [ ] ファイアウォール設定を確認

## ✅ 成功確認

以下の全てが正常に動作すれば成功です：

```bash
# 1. コンテナ状態確認
docker-compose -f docker-compose.simple.yml ps
# 全サービスがUp状態

# 2. Windows ブラウザでアクセステスト
# http://localhost:3000 でReactアプリが表示される
# http://localhost:5000 でAPIが応答する

# 3. ログイン確認
# 上記のテストアカウントでログイン成功
```

---

**🚀 システムは本格稼働準備完了です！**

問題が発生した場合は、このガイドの該当セクションを参照してください。