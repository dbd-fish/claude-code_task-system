"""
タスク管理アプリのデータベースモデル定義

このモジュールは、SQLAlchemyを使用してタスクテーブルのモデルを定義します。
作成したER図に基づいた実装を行います。
"""

from datetime import date
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Index
from sqlalchemy.sql import func
from .database import Base


class Task(Base):
    """
    タスクテーブルのSQLAlchemyモデル
    
    テーブル定義書とER図に基づいて実装されたタスクエンティティです。
    id, title, description, deadline, assignee, status, created_at, updated_atの
    8つのカラムを持ちます。
    """
    
    __tablename__ = "tasks"
    
    # 主キー（自動採番）
    id = Column(Integer, primary_key=True, index=True, comment="主キー（自動採番）")
    
    # タスクタイトル（必須項目）
    title = Column(String(255), nullable=False, comment="タスクタイトル")
    
    # タスク説明（任意項目）
    description = Column(Text, nullable=True, comment="タスク説明")
    
    # 期限（任意項目）
    deadline = Column(Date, nullable=True, comment="期限")
    
    # 担当者（任意項目）
    assignee = Column(String(100), nullable=True, comment="担当者")
    
    # ステータス（必須項目、デフォルト値あり）
    status = Column(
        String(20), 
        nullable=False, 
        default="pending",
        comment="ステータス（pending, in_progress, completed）"
    )
    
    # 作成日時（自動設定）
    created_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now(),
        comment="作成日時"
    )
    
    # 更新日時（自動更新）
    updated_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新日時"
    )
    
    # インデックス定義（パフォーマンス向上）
    __table_args__ = (
        Index('idx_tasks_status', 'status'),
        Index('idx_tasks_deadline', 'deadline'),
        Index('idx_tasks_assignee', 'assignee'),
    )
    
    def __repr__(self) -> str:
        """
        オブジェクトの文字列表現
        
        Returns:
            str: タスクの基本情報を含む文字列
        """
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
    
    def to_dict(self) -> dict:
        """
        タスクオブジェクトを辞書形式に変換
        
        Returns:
            dict: タスクの全カラム情報を含む辞書
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "assignee": self.assignee,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_valid_statuses(cls) -> list[str]:
        """
        有効なステータス値の一覧を取得
        
        Returns:
            list[str]: 有効なステータス値のリスト
        """
        return ["pending", "in_progress", "completed"]
    
    def is_overdue(self) -> bool:
        """
        タスクが期限切れかどうかを判定
        
        Returns:
            bool: 期限切れの場合True、そうでなければFalse
        """
        if self.deadline is None:
            return False
        return self.deadline < date.today() and self.status != "completed"