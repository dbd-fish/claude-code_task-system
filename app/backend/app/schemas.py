"""
タスク管理APIのPydanticスキーマ定義

このモジュールは、APIのリクエスト・レスポンス用のPydanticスキーマを定義します。
バリデーションと型安全性を提供します。
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class TaskBase(BaseModel):
    """
    タスクの基本スキーマ
    
    共通のフィールドを定義します。
    """
    title: str = Field(..., min_length=1, max_length=255, description="タスクタイトル")
    description: Optional[str] = Field(None, max_length=5000, description="タスク説明")
    deadline: Optional[date] = Field(None, description="期限（YYYY-MM-DD形式）")
    assignee: Optional[str] = Field(None, max_length=100, description="担当者")
    status: str = Field(default="pending", description="ステータス（pending, in_progress, completed）")
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """ステータス値のバリデーション"""
        valid_statuses = ["pending", "in_progress", "completed"]
        if v not in valid_statuses:
            raise ValueError(f'ステータスは {valid_statuses} のいずれかである必要があります')
        return v
    
    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v):
        """期限日のバリデーション"""
        if v is not None and v < date.today():
            raise ValueError('期限は今日以降の日付を設定してください')
        return v
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        """タスクタイトルのバリデーション"""
        if not v or not v.strip():
            raise ValueError('タスクタイトルは必須です')
        return v.strip()


class TaskCreate(TaskBase):
    """
    タスク作成用スキーマ
    
    POST /tasks で使用されるリクエストスキーマです。
    """
    pass


class TaskUpdate(BaseModel):
    """
    タスク更新用スキーマ
    
    PUT /tasks/{task_id} で使用されるリクエストスキーマです。
    全フィールドをオプショナルにして部分更新を可能にします。
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="タスクタイトル")
    description: Optional[str] = Field(None, max_length=5000, description="タスク説明")
    deadline: Optional[date] = Field(None, description="期限（YYYY-MM-DD形式）")
    assignee: Optional[str] = Field(None, max_length=100, description="担当者")
    status: Optional[str] = Field(None, description="ステータス（pending, in_progress, completed）")
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """ステータス値のバリデーション"""
        if v is not None:
            valid_statuses = ["pending", "in_progress", "completed"]
            if v not in valid_statuses:
                raise ValueError(f'ステータスは {valid_statuses} のいずれかである必要があります')
        return v
    
    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v):
        """期限日のバリデーション（更新時は過去日も許可）"""
        # 更新時は既存タスクの期限を過去に変更することも許可
        return v
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        """タスクタイトルのバリデーション"""
        if v is not None and (not v or not v.strip()):
            raise ValueError('タスクタイトルは必須です')
        return v.strip() if v else v
    
    def has_updates(self) -> bool:
        """
        更新対象のフィールドが存在するかチェック
        
        Returns:
            bool: 更新対象フィールドがある場合True
        """
        update_data = self.model_dump(exclude_unset=True)
        return len(update_data) > 0


class TaskResponse(TaskBase):
    """
    タスクレスポンス用スキーマ
    
    APIから返されるタスク情報のスキーマです。
    """
    id: int = Field(..., description="タスクID")
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="更新日時")
    
    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """
    タスク一覧レスポンス用スキーマ
    
    GET /tasks で使用されるレスポンススキーマです。
    """
    tasks: list[TaskResponse] = Field(..., description="タスクのリスト")
    total: int = Field(..., description="総タスク数")
    page: int = Field(..., description="現在のページ番号")
    size: int = Field(..., description="1ページあたりのタスク数")
    total_pages: int = Field(..., description="総ページ数")
    has_next: bool = Field(..., description="次のページが存在するかどうか")
    has_prev: bool = Field(..., description="前のページが存在するかどうか")


class TaskCreateResponse(BaseModel):
    """
    タスク作成成功レスポンス用スキーマ
    
    POST /tasks で使用されるレスポンススキーマです。
    """
    message: str = Field(..., description="成功メッセージ")
    task: TaskResponse = Field(..., description="作成されたタスク情報")


class TaskDeleteResponse(BaseModel):
    """
    タスク削除成功レスポンス用スキーマ
    
    DELETE /tasks/{task_id} で使用されるレスポンススキーマです。
    """
    message: str = Field(..., description="削除成功メッセージ")
    deleted_task: TaskResponse = Field(..., description="削除されたタスク情報")


class TaskDeleteConfirmationResponse(BaseModel):
    """
    タスク削除確認レスポンス用スキーマ
    
    削除前の確認情報を返すレスポンススキーマです。
    """
    task: TaskResponse = Field(..., description="削除予定のタスク情報")
    warning: str = Field(..., description="削除に関する警告メッセージ")


class ErrorResponse(BaseModel):
    """
    エラーレスポンス用スキーマ
    
    APIエラー時のレスポンススキーマです。
    """
    error: str = Field(..., description="エラータイプ")
    message: str = Field(..., description="エラーメッセージ")
    detail: Optional[str] = Field(None, description="詳細エラー情報")