# FastAPI バックエンド用 Dockerfile
FROM python:3.11-slim

# メタデータ設定
LABEL maintainer="TaskManager Development Team"
LABEL description="FastAPI Backend for Task Management Application"
LABEL version="1.0.0"

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール（マルチステージ最適化）
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 非rootユーザー作成（セキュリティ向上）
RUN addgroup --system app && adduser --system --group app

# Pythonの依存関係ファイルをコピー
COPY requirements.txt .

# Pythonの依存関係をインストール（最適化）
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip cache purge

# アプリケーションのソースコードをコピー
COPY --chown=app:app . .

# ユーザー権限変更
USER app

# ヘルスチェック追加
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# ポート8000を公開
EXPOSE 8000

# FastAPIサーバーを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]