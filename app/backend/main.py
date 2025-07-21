"""
FastAPI タスク管理アプリケーションのメインファイル

このモジュールは、タスク管理アプリケーションのFastAPIアプリケーションを定義します。
CORS設定、データベース接続、ルーターの設定を含みます。
"""

from fastapi import FastAPI, Depends, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from app.database import create_tables, check_database_connection

# 環境変数を読み込み
load_dotenv()

# FastAPIアプリケーションのインスタンスを作成
app = FastAPI(
    title="タスク管理API",
    description="タスクの登録、更新、削除、一覧取得を行うAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定
# フロントエンドからのリクエストを許可するための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React開発サーバー
        "http://frontend:3000",   # Dockerコンテナ間通信
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """
    ルートエンドポイント
    
    Returns:
        dict: APIの基本情報
    """
    return {
        "message": "タスク管理API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント
    
    Returns:
        dict: APIの健康状態
    """
    db_status = await check_database_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected"
    }

@app.on_event("startup")
async def startup_event():
    """
    アプリケーション起動時の処理
    
    データベーステーブルの作成とモデルの初期化を行います。
    """
    # モデルをインポートしてテーブル作成に反映
    from app import models  # noqa: F401
    
    # データベーステーブルを作成
    await create_tables()
    
    # データベース接続をテスト
    db_connected = await check_database_connection()
    if db_connected:
        print("✅ データベース接続成功")
    else:
        print("❌ データベース接続失敗")

# タスクAPI用のルーターを追加
from app.routers import tasks
app.include_router(tasks.router, prefix="/api/v1", tags=["tasks"])

# 直接パスでもアクセス可能にする（互換性のため）
from app.routers import tasks as tasks_direct
from app.database import get_db
tasks_direct_router = APIRouter()

# 直接パスのエンドポイントを追加
@tasks_direct_router.get("/tasks")
async def get_tasks_direct(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    assignee: Optional[str] = Query(None),
    deadline_from: Optional[str] = Query(None),
    deadline_to: Optional[str] = Query(None),
    overdue_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    return await tasks.get_tasks_endpoint(page, size, status, assignee, deadline_from, deadline_to, overdue_only, db)

@tasks_direct_router.post("/tasks", status_code=201)
async def create_task_direct(task_data: tasks.TaskCreate, db: Session = Depends(get_db)):
    return await tasks.create_task(task_data, db)

@tasks_direct_router.get("/tasks/{task_id}")
async def get_task_direct(task_id: int, db: Session = Depends(get_db)):
    return await tasks.get_task(task_id, db)

@tasks_direct_router.put("/tasks/{task_id}")
async def update_task_direct(task_id: int, task_update: tasks.TaskUpdate, db: Session = Depends(get_db)):
    return await tasks.update_task_endpoint(task_id, task_update, db)

@tasks_direct_router.delete("/tasks/{task_id}")
async def delete_task_direct(task_id: int, db: Session = Depends(get_db)):
    return await tasks.delete_task_endpoint(task_id, db)

app.include_router(tasks_direct_router, tags=["tasks-direct"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)