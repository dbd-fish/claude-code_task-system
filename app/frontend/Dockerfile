# React Router V7 フロントエンド用 Dockerfile
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# npmキャッシュをクリア
RUN npm cache clean --force

# package.jsonをコピー
COPY package.json ./

# 依存関係をインストール
RUN npm install --legacy-peer-deps

# アプリケーションのソースコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]