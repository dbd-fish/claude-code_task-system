"""
データベース接続とセッション管理

このモジュールは、PostgreSQLデータベースとの接続を管理し、
SQLAlchemyを使用したデータベースセッションを提供します。
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

# データベースURLを環境変数から取得
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://taskuser:taskpass@database:5432/taskmanager")

# SQLAlchemyエンジンを作成
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    pool_pre_ping=True,  # 接続の健全性をチェック
    echo=True if os.getenv("DEBUG") == "True" else False  # SQLクエリのログ出力
)

# セッションメーカーを作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースクラスを作成
Base = declarative_base()

def get_db():
    """
    データベースセッションを取得する依存性注入関数
    
    Yields:
        Session: SQLAlchemyのデータベースセッション
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def create_tables():
    """
    データベーステーブルを作成する関数
    
    アプリケーション起動時にテーブルが存在しない場合に作成します。
    """
    Base.metadata.create_all(bind=engine)

async def check_database_connection():
    """
    データベース接続をテストする関数
    
    Returns:
        bool: 接続が成功した場合True、失敗した場合False
    """
    try:
        with engine.connect() as connection:
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"データベース接続エラー: {e}")
        return False