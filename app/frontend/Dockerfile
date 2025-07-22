# Vite + React + React Router DOM フロントエンド用 Dockerfile
FROM node:20-alpine

# メタデータ設定
LABEL maintainer="TaskManager Development Team"
LABEL description="Vite + React Frontend for Task Management Application"
LABEL version="1.0.0"

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージ更新（セキュリティ向上）
RUN apk update && apk upgrade && apk add --no-cache curl

# 非rootユーザー作成（セキュリティ向上）
RUN addgroup -g 1001 -S nodejs && adduser -S reactjs -u 1001

# package.jsonとpackage-lock.jsonをコピー（マルチステージ最適化）
COPY package*.json ./

# 依存関係をインストール（最適化）
RUN npm cache clean --force \
    && npm ci --only=production \
    && npm cache clean --force

# アプリケーションのソースコードをコピー
COPY --chown=reactjs:nodejs . .

# ユーザー権限変更
USER reactjs

# ヘルスチェック追加
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# ポート3000を公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]