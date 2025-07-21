"""
タスク管理APIのルーター

このモジュールは、タスクに関するAPIエンドポイントを定義します。
CRUD操作（作成、読み取り、更新、削除）をサポートします。
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database import get_db
from ..models import Task
from ..schemas import (
    TaskCreate, 
    TaskUpdate,
    TaskResponse, 
    TaskCreateResponse, 
    TaskListResponse,
    TaskDeleteResponse,
    TaskDeleteConfirmationResponse,
    ErrorResponse
)
from ..crud import get_tasks as crud_get_tasks, get_tasks_count, update_task, delete_task, get_task_for_deletion_confirmation
from datetime import date
import math

# ルーターインスタンスを作成
router = APIRouter(
    prefix="/api/v1",
    tags=["tasks"],
    responses={
        404: {"model": ErrorResponse, "description": "リソースが見つかりません"},
        422: {"model": ErrorResponse, "description": "バリデーションエラー"},
        500: {"model": ErrorResponse, "description": "内部サーバーエラー"}
    }
)


@router.post(
    "/tasks",
    response_model=TaskCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="新しいタスクを作成",
    description="タスクタイトル、説明、期限、担当者を指定して新しいタスクを作成します。"
)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db)
) -> TaskCreateResponse:
    """
    新しいタスクを作成するエンドポイント
    
    Args:
        task_data: タスク作成用のデータ
        db: データベースセッション
    
    Returns:
        TaskCreateResponse: 作成されたタスクの情報
    
    Raises:
        HTTPException: データベースエラーが発生した場合
    """
    try:
        # 新しいタスクインスタンスを作成
        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            deadline=task_data.deadline,
            assignee=task_data.assignee,
            status=task_data.status
        )
        
        # データベースに保存
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        
        # レスポンスを作成
        return TaskCreateResponse(
            message="タスクが正常に作成されました",
            task=TaskResponse.model_validate(new_task)
        )
        
    except SQLAlchemyError as e:
        # データベースエラーをロールバック
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラーが発生しました: {str(e)}"
        )
    except Exception as e:
        # その他のエラー
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"予期しないエラーが発生しました: {str(e)}"
        )


@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="指定されたIDのタスクを取得",
    description="タスクIDを指定して、該当するタスクの詳細情報を取得します。"
)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db)
) -> TaskResponse:
    """
    指定されたIDのタスクを取得するエンドポイント
    
    Args:
        task_id: 取得するタスクのID
        db: データベースセッション
    
    Returns:
        TaskResponse: タスクの詳細情報
    
    Raises:
        HTTPException: タスクが見つからない場合
    """
    try:
        # タスクを検索
        task = db.query(Task).filter(Task.id == task_id).first()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ID {task_id} のタスクが見つかりません"
            )
        
        return TaskResponse.model_validate(task)
        
    except HTTPException:
        # HTTPExceptionは再発生
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"タスク取得中にエラーが発生しました: {str(e)}"
        )


@router.get(
    "/tasks",
    response_model=TaskListResponse,
    summary="タスク一覧を取得",
    description="全てのタスクの一覧を取得します。ステータスや担当者でフィルタリング、ページネーション対応。"
)
async def get_tasks_endpoint(
    page: int = Query(1, ge=1, description="ページ番号（1以上）"),
    size: int = Query(20, ge=1, le=100, description="1ページあたりのタスク数（1-100）"),
    status: Optional[str] = Query(None, description="ステータスでフィルタリング"),
    assignee: Optional[str] = Query(None, description="担当者でフィルタリング"),
    deadline_from: Optional[str] = Query(None, description="期限開始日（YYYY-MM-DD）"),
    deadline_to: Optional[str] = Query(None, description="期限終了日（YYYY-MM-DD）"),
    overdue_only: bool = Query(False, description="期限切れタスクのみ"),
    db: Session = Depends(get_db)
):
    """
    タスク一覧を取得するエンドポイント
    
    フィルタリング、ページネーション機能付きでタスク一覧を返却します。
    
    Args:
        page: ページ番号（1以上）
        size: 1ページあたりのタスク数（1-100）
        status: ステータスでフィルタリング
        assignee: 担当者名でフィルタリング（部分一致）
        deadline_from: 期限開始日でフィルタリング
        deadline_to: 期限終了日でフィルタリング
        overdue_only: 期限切れタスクのみ取得
        db: データベースセッション
    
    Returns:
        TaskListResponse: ページネーション情報付きタスク一覧
    
    Raises:
        HTTPException: パラメータエラーの場合
    """
    
    # ステータス値の検証
    if status and status not in ["pending", "in_progress", "completed"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Must be one of: pending, in_progress, completed"
        )
    
    # 期限日のパースと範囲チェック
    deadline_from_date = None
    deadline_to_date = None
    
    if deadline_from:
        try:
            deadline_from_date = date.fromisoformat(deadline_from)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid deadline_from format. Use YYYY-MM-DD"
            )
    
    if deadline_to:
        try:
            deadline_to_date = date.fromisoformat(deadline_to)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid deadline_to format. Use YYYY-MM-DD"
            )
    
    if deadline_from_date and deadline_to_date and deadline_from_date > deadline_to_date:
        raise HTTPException(
            status_code=400,
            detail="deadline_from must be earlier than or equal to deadline_to"
        )
    
    try:
        # ページネーション用の計算
        skip = (page - 1) * size
        
        # タスク一覧を取得
        tasks = crud_get_tasks(
            db=db,
            skip=skip,
            limit=size,
            status=status,
            assignee=assignee,
            deadline_from=deadline_from_date,
            deadline_to=deadline_to_date,
            overdue_only=overdue_only
        )
        
        # 総タスク数を取得
        total = get_tasks_count(
            db=db,
            status=status,
            assignee=assignee,
            deadline_from=deadline_from_date,
            deadline_to=deadline_to_date,
            overdue_only=overdue_only
        )
        
        # 総ページ数を計算
        total_pages = math.ceil(total / size) if total > 0 else 1
        
        # レスポンス用のタスクデータに変換
        task_responses = [TaskResponse.model_validate(task) for task in tasks]
        
        return TaskListResponse(
            tasks=task_responses,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.put(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="タスクを更新",
    description="指定されたIDのタスクを更新します。部分更新に対応しており、指定されたフィールドのみを更新します。"
)
async def update_task_endpoint(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
) -> TaskResponse:
    """
    タスクを更新するエンドポイント
    
    Args:
        task_id: 更新するタスクのID
        task_update: 更新するフィールドの情報
        db: データベースセッション
    
    Returns:
        TaskResponse: 更新されたタスクの情報
    
    Raises:
        HTTPException: タスクが見つからない場合や更新に失敗した場合
    """
    try:
        # 更新対象フィールドの存在チェック
        if not task_update.has_updates():
            raise HTTPException(
                status_code=400,
                detail="更新対象のフィールドが指定されていません"
            )
        
        # タスクを更新
        updated_task = update_task(db=db, task_id=task_id, task_update=task_update)
        
        # タスクが見つからない場合
        if updated_task is None:
            raise HTTPException(
                status_code=404,
                detail=f"ID {task_id} のタスクが見つかりません"
            )
        
        return TaskResponse.model_validate(updated_task)
        
    except HTTPException:
        # HTTPExceptionは再発生
        raise
    except ValueError as e:
        # バリデーションエラー
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except SQLAlchemyError as e:
        # データベースエラー
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"データベースエラーが発生しました: {str(e)}"
        )
    except Exception as e:
        # その他のエラー
        raise HTTPException(
            status_code=500,
            detail=f"タスク更新中にエラーが発生しました: {str(e)}"
        )


@router.get(
    "/tasks/{task_id}/delete-confirmation",
    response_model=TaskDeleteConfirmationResponse,
    summary="タスク削除前の確認情報を取得",
    description="指定されたIDのタスクの削除前確認情報を取得します。削除対象のタスク情報と警告メッセージを返します。"
)
async def get_task_delete_confirmation(
    task_id: int,
    db: Session = Depends(get_db)
) -> TaskDeleteConfirmationResponse:
    """
    タスク削除前の確認情報を取得するエンドポイント
    
    Args:
        task_id: 削除確認するタスクのID
        db: データベースセッション
    
    Returns:
        TaskDeleteConfirmationResponse: 削除確認情報
    
    Raises:
        HTTPException: タスクが見つからない場合
    """
    try:
        # タスクを取得
        task = get_task_for_deletion_confirmation(db=db, task_id=task_id)
        
        # タスクが見つからない場合
        if task is None:
            raise HTTPException(
                status_code=404,
                detail=f"ID {task_id} のタスクが見つかりません"
            )
        
        # 警告メッセージを生成
        warning_message = f"タスク「{task.title}」を削除します。この操作は取り消せません。"
        
        # 特別な警告条件
        if task.status == "in_progress":
            warning_message += " 進行中のタスクです。"
        elif task.deadline and task.deadline >= date.today():
            warning_message += " 期限が未来のタスクです。"
        
        return TaskDeleteConfirmationResponse(
            task=TaskResponse.model_validate(task),
            warning=warning_message
        )
        
    except HTTPException:
        # HTTPExceptionは再発生
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"削除確認情報取得中にエラーが発生しました: {str(e)}"
        )


@router.delete(
    "/tasks/{task_id}",
    response_model=TaskDeleteResponse,
    summary="タスクを削除",
    description="指定されたIDのタスクを完全に削除します。この操作は取り消せません。"
)
async def delete_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db)
) -> TaskDeleteResponse:
    """
    タスクを削除するエンドポイント
    
    Args:
        task_id: 削除するタスクのID
        db: データベースセッション
    
    Returns:
        TaskDeleteResponse: 削除されたタスクの情報
    
    Raises:
        HTTPException: タスクが見つからない場合や削除に失敗した場合
    """
    try:
        # タスクを削除
        deleted_task = delete_task(db=db, task_id=task_id)
        
        # タスクが見つからない場合
        if deleted_task is None:
            raise HTTPException(
                status_code=404,
                detail=f"ID {task_id} のタスクが見つかりません"
            )
        
        return TaskDeleteResponse(
            message=f"タスク「{deleted_task.title}」が正常に削除されました",
            deleted_task=TaskResponse.model_validate(deleted_task)
        )
        
    except HTTPException:
        # HTTPExceptionは再発生
        raise
    except SQLAlchemyError as e:
        # データベースエラー
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"データベースエラーが発生しました: {str(e)}"
        )
    except Exception as e:
        # その他のエラー
        raise HTTPException(
            status_code=500,
            detail=f"タスク削除中にエラーが発生しました: {str(e)}"
        )