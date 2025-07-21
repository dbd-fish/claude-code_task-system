"""
テスト用の設定とfixtures

このモジュールは、pytest用の共通設定とfixturesを定義します。
テスト用データベースの設定やテストクライアントの作成を行います。
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import Task
from main import app

# テスト用のデータベースURL（SQLite使用）
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# テスト用のデータベースエンジンを作成
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# テスト用のセッションメーカーを作成
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """
    テスト用のデータベースセッションを取得する依存性注入関数
    
    Yields:
        Session: テスト用のSQLAlchemyデータベースセッション
    """
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def test_app():
    """
    テスト用のFastAPIアプリケーションを作成するfixture
    
    Returns:
        FastAPI: テスト用に設定されたFastAPIアプリケーション
    """
    # 依存性注入をテスト用のものに置き換え
    app.dependency_overrides[get_db] = override_get_db
    
    # テスト用のデータベーステーブルを作成
    Base.metadata.create_all(bind=engine)
    
    yield app
    
    # テーブルを削除
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_app):
    """
    テスト用のHTTPクライアントを作成するfixture
    
    Args:
        test_app: テスト用のFastAPIアプリケーション
    
    Returns:
        TestClient: FastAPIのテストクライアント
    """
    # テーブルをクリアして新しいセッション開始
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestClient(test_app)


@pytest.fixture(scope="function")
def db_session():
    """
    テスト用のデータベースセッションを作成するfixture
    
    Returns:
        Session: テスト用のデータベースセッション
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def sample_task_data():
    """
    テスト用のサンプルタスクデータを提供するfixture
    
    Returns:
        dict: サンプルタスクのデータ
    """
    return {
        "title": "テストタスク",
        "description": "これはテスト用のタスクです",
        "deadline": "2025-08-01",
        "assignee": "テストユーザー",
        "status": "pending"
    }


@pytest.fixture(scope="function")
def created_task(client, sample_task_data):
    """
    テスト用の作成済みタスクを提供するfixture
    
    Args:
        client: テストクライアント
        sample_task_data: サンプルタスクデータ
    
    Returns:
        dict: 作成されたタスクのレスポンスデータ
    """
    response = client.post("/api/v1/tasks", json=sample_task_data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture(scope="function")
def multiple_tasks(client):
    """
    複数のテスト用タスクを作成するfixture
    
    Args:
        client: テストクライアント
    
    Returns:
        list: 作成されたタスクのリスト
    """
    tasks = []
    
    # 異なるステータスのタスクを作成
    task_data_list = [
        {
            "title": "タスク1",
            "description": "説明1",
            "deadline": "2025-08-01",
            "assignee": "ユーザー1",
            "status": "pending"
        },
        {
            "title": "タスク2", 
            "description": "説明2",
            "deadline": "2025-08-15",
            "assignee": "ユーザー2",
            "status": "in_progress"
        },
        {
            "title": "タスク3",
            "description": "説明3",
            "deadline": "2025-12-15",  # 未来の日付に修正
            "assignee": "ユーザー1",
            "status": "completed"
        }
    ]
    
    for task_data in task_data_list:
        response = client.post("/api/v1/tasks", json=task_data)
        assert response.status_code == 201
        tasks.append(response.json())
    
    return tasks