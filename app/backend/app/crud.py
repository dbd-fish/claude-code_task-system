"""
タスク管理アプリのCRUD操作関数

このモジュールは、データベースに対するCRUD（Create, Read, Update, Delete）操作を
実装します。SQLAlchemyを使用してタスクデータの永続化を行います。
"""

from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .models import Task
from .schemas import TaskCreate, TaskUpdate


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    deadline_from: Optional[date] = None,
    deadline_to: Optional[date] = None,
    overdue_only: bool = False
) -> List[Task]:
    """
    タスク一覧を取得する関数
    
    Args:
        db (Session): データベースセッション
        skip (int): スキップするレコード数（ページネーション用）
        limit (int): 取得する最大レコード数
        status (Optional[str]): ステータスフィルタ
        assignee (Optional[str]): 担当者フィルタ
        deadline_from (Optional[date]): 期限開始日フィルタ
        deadline_to (Optional[date]): 期限終了日フィルタ
        overdue_only (bool): 期限切れタスクのみ取得するかどうか
    
    Returns:
        List[Task]: フィルタリング・ページネーション適用後のタスク一覧
    """
    query = db.query(Task)
    
    # フィルタリング条件を適用
    filters = []
    
    if status:
        filters.append(Task.status == status)
    
    if assignee:
        filters.append(Task.assignee.ilike(f"%{assignee}%"))
    
    if deadline_from:
        filters.append(Task.deadline >= deadline_from)
    
    if deadline_to:
        filters.append(Task.deadline <= deadline_to)
    
    if overdue_only:
        today = date.today()
        filters.append(and_(
            Task.deadline < today,
            Task.status != "completed"
        ))
    
    # フィルタを適用
    if filters:
        query = query.filter(and_(*filters))
    
    # ソート（作成日時の降順）
    query = query.order_by(Task.created_at.desc())
    
    # ページネーション適用
    return query.offset(skip).limit(limit).all()


def get_tasks_count(
    db: Session,
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    deadline_from: Optional[date] = None,
    deadline_to: Optional[date] = None,
    overdue_only: bool = False
) -> int:
    """
    フィルタリング条件に一致するタスクの総数を取得する関数
    
    Args:
        db (Session): データベースセッション
        status (Optional[str]): ステータスフィルタ
        assignee (Optional[str]): 担当者フィルタ
        deadline_from (Optional[date]): 期限開始日フィルタ
        deadline_to (Optional[date]): 期限終了日フィルタ
        overdue_only (bool): 期限切れタスクのみカウントするかどうか
    
    Returns:
        int: 条件に一致するタスクの総数
    """
    query = db.query(Task)
    
    # フィルタリング条件を適用（get_tasksと同じロジック）
    filters = []
    
    if status:
        filters.append(Task.status == status)
    
    if assignee:
        filters.append(Task.assignee.ilike(f"%{assignee}%"))
    
    if deadline_from:
        filters.append(Task.deadline >= deadline_from)
    
    if deadline_to:
        filters.append(Task.deadline <= deadline_to)
    
    if overdue_only:
        today = date.today()
        filters.append(and_(
            Task.deadline < today,
            Task.status != "completed"
        ))
    
    # フィルタを適用
    if filters:
        query = query.filter(and_(*filters))
    
    return query.count()


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """
    特定のIDのタスクを取得する関数
    
    Args:
        db (Session): データベースセッション
        task_id (int): 取得するタスクのID
    
    Returns:
        Optional[Task]: 指定されたIDのタスク（存在しない場合はNone）
    """
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, task: TaskCreate) -> Task:
    """
    新しいタスクを作成する関数
    
    Args:
        db (Session): データベースセッション
        task (TaskCreate): 作成するタスクの情報
    
    Returns:
        Task: 作成されたタスクオブジェクト
    """
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """
    既存のタスクを更新する関数
    
    Args:
        db (Session): データベースセッション
        task_id (int): 更新するタスクのID
        task_update (TaskUpdate): 更新する項目の情報
    
    Returns:
        Optional[Task]: 更新されたタスクオブジェクト（存在しない場合はNone）
    
    Raises:
        ValueError: 更新対象フィールドが存在しない場合
    """
    # 更新対象フィールドの存在チェック
    if not task_update.has_updates():
        raise ValueError("更新対象のフィールドが指定されていません")
    
    # タスクの存在確認
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        return None
    
    try:
        # None以外の値のみ更新
        update_data = task_update.dict(exclude_unset=True)
        
        # 各フィールドを更新
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        # 変更をコミット
        db.commit()
        db.refresh(db_task)
        return db_task
        
    except Exception as e:
        # エラー時はロールバック
        db.rollback()
        raise e


def delete_task(db: Session, task_id: int) -> Optional[Task]:
    """
    タスクを削除する関数
    
    削除前にタスクの情報を取得し、削除後に削除されたタスクの情報を返す。
    
    Args:
        db (Session): データベースセッション
        task_id (int): 削除するタスクのID
    
    Returns:
        Optional[Task]: 削除されたタスクオブジェクト（存在しない場合はNone）
    
    Raises:
        Exception: データベースエラーが発生した場合
    """
    # タスクの存在確認
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        return None
    
    try:
        # 削除前にタスク情報を保存
        task_info = Task(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            deadline=db_task.deadline,
            assignee=db_task.assignee,
            status=db_task.status,
            created_at=db_task.created_at,
            updated_at=db_task.updated_at
        )
        
        # タスクを削除
        db.delete(db_task)
        db.commit()
        
        return task_info
        
    except Exception as e:
        # エラー時はロールバック
        db.rollback()
        raise e


def get_task_for_deletion_confirmation(db: Session, task_id: int) -> Optional[Task]:
    """
    削除確認用にタスク情報を取得する関数
    
    Args:
        db (Session): データベースセッション
        task_id (int): 確認するタスクのID
    
    Returns:
        Optional[Task]: タスクオブジェクト（存在しない場合はNone）
    """
    return db.query(Task).filter(Task.id == task_id).first()