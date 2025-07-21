"""
バリデーション機能の単体テスト

このモジュールは、Pydanticスキーマのバリデーション機能をテストします。
"""

import pytest
from datetime import date, timedelta
from pydantic import ValidationError

from app.schemas import TaskCreate, TaskUpdate, TaskBase


class TestTaskCreateValidation:
    """TaskCreateスキーマのバリデーションテスト"""
    
    def test_valid_task_create(self):
        """正常なタスク作成データのバリデーションテスト"""
        valid_data = {
            "title": "テストタスク",
            "description": "テスト用の説明",
            "deadline": date.today() + timedelta(days=7),
            "assignee": "テストユーザー",
            "status": "pending"
        }
        
        task = TaskCreate(**valid_data)
        assert task.title == "テストタスク"
        assert task.description == "テスト用の説明"
        assert task.assignee == "テストユーザー"
        assert task.status == "pending"
    
    def test_minimal_valid_task_create(self):
        """最小限の有効なタスク作成データテスト"""
        minimal_data = {"title": "最小限タスク"}
        
        task = TaskCreate(**minimal_data)
        assert task.title == "最小限タスク"
        assert task.description is None
        assert task.deadline is None
        assert task.assignee is None
        assert task.status == "pending"  # デフォルト値
    
    def test_missing_title_validation(self):
        """タイトル未設定時のバリデーションエラーテスト"""
        invalid_data = {"description": "タイトルなし"}
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any(error["loc"] == ("title",) for error in errors)
    
    def test_empty_title_validation(self):
        """空のタイトルのバリデーションエラーテスト"""
        invalid_data = {"title": ""}
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any(error["type"] == "string_too_short" for error in errors)
    
    def test_whitespace_only_title_validation(self):
        """空白のみのタイトルのバリデーションエラーテスト"""
        invalid_data = {"title": "   "}
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any("タスクタイトルは必須です" in str(error["msg"]) for error in errors)
    
    def test_title_trimming(self):
        """タイトルの前後空白除去テスト"""
        data = {"title": "  トリムテスト  "}
        
        task = TaskCreate(**data)
        assert task.title == "トリムテスト"
    
    def test_long_title_validation(self):
        """長すぎるタイトルのバリデーションエラーテスト"""
        long_title = "a" * 256  # 255文字を超える
        invalid_data = {"title": long_title}
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any(error["type"] == "string_too_long" for error in errors)
    
    def test_invalid_status_validation(self):
        """無効なステータス値のバリデーションエラーテスト"""
        invalid_statuses = ["invalid", "PENDING", "unknown", ""]
        
        for invalid_status in invalid_statuses:
            invalid_data = {
                "title": "テストタスク",
                "status": invalid_status
            }
            
            with pytest.raises(ValidationError) as exc_info:
                TaskCreate(**invalid_data)
            
            errors = exc_info.value.errors()
            assert any("ステータスは" in str(error["msg"]) for error in errors)
    
    def test_valid_statuses(self):
        """有効なステータス値のテスト"""
        valid_statuses = ["pending", "in_progress", "completed"]
        
        for status in valid_statuses:
            data = {
                "title": "テストタスク",
                "status": status
            }
            
            task = TaskCreate(**data)
            assert task.status == status
    
    def test_past_deadline_validation(self):
        """過去の期限日のバリデーションエラーテスト"""
        past_date = date.today() - timedelta(days=1)
        invalid_data = {
            "title": "テストタスク",
            "deadline": past_date
        }
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any("期限は今日以降の日付" in str(error["msg"]) for error in errors)
    
    def test_today_deadline_validation(self):
        """今日の期限日の有効性テスト"""
        today = date.today()
        valid_data = {
            "title": "テストタスク",
            "deadline": today
        }
        
        task = TaskCreate(**valid_data)
        assert task.deadline == today
    
    def test_future_deadline_validation(self):
        """未来の期限日の有効性テスト"""
        future_date = date.today() + timedelta(days=30)
        valid_data = {
            "title": "テストタスク",
            "deadline": future_date
        }
        
        task = TaskCreate(**valid_data)
        assert task.deadline == future_date
    
    def test_long_description_validation(self):
        """長すぎる説明のバリデーションエラーテスト"""
        long_description = "a" * 5001  # 5000文字を超える
        invalid_data = {
            "title": "テストタスク",
            "description": long_description
        }
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any(error["type"] == "string_too_long" for error in errors)
    
    def test_long_assignee_validation(self):
        """長すぎる担当者名のバリデーションエラーテスト"""
        long_assignee = "a" * 101  # 100文字を超える
        invalid_data = {
            "title": "テストタスク",
            "assignee": long_assignee
        }
        
        with pytest.raises(ValidationError) as exc_info:
            TaskCreate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any(error["type"] == "string_too_long" for error in errors)


class TestTaskUpdateValidation:
    """TaskUpdateスキーマのバリデーションテスト"""
    
    def test_valid_partial_update(self):
        """部分更新の有効性テスト"""
        update_data = {"status": "in_progress"}
        
        task_update = TaskUpdate(**update_data)
        assert task_update.status == "in_progress"
        assert task_update.title is None
        assert task_update.description is None
    
    def test_empty_update_data(self):
        """空の更新データテスト"""
        task_update = TaskUpdate()
        
        # has_updatesメソッドのテスト
        assert not task_update.has_updates()
    
    def test_has_updates_method(self):
        """has_updatesメソッドのテスト"""
        # 更新データありの場合
        task_update_with_data = TaskUpdate(title="新しいタイトル")
        assert task_update_with_data.has_updates()
        
        # 更新データなしの場合
        task_update_empty = TaskUpdate()
        assert not task_update_empty.has_updates()
    
    def test_update_with_invalid_status(self):
        """無効なステータスでの更新バリデーションテスト"""
        invalid_data = {"status": "invalid_status"}
        
        with pytest.raises(ValidationError) as exc_info:
            TaskUpdate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any("ステータスは" in str(error["msg"]) for error in errors)
    
    def test_update_with_empty_title(self):
        """空のタイトルでの更新バリデーションテスト"""
        invalid_data = {"title": ""}
        
        with pytest.raises(ValidationError) as exc_info:
            TaskUpdate(**invalid_data)
        
        errors = exc_info.value.errors()
        assert any(error["type"] == "string_too_short" for error in errors)
    
    def test_update_past_deadline_allowed(self):
        """更新時の過去日付許可テスト（既存タスクの期限変更）"""
        past_date = date.today() - timedelta(days=1)
        update_data = {"deadline": past_date}
        
        # 更新時は過去の日付も許可される
        task_update = TaskUpdate(**update_data)
        assert task_update.deadline == past_date
    
    def test_multiple_field_update(self):
        """複数フィールドの同時更新テスト"""
        update_data = {
            "title": "更新されたタイトル",
            "status": "completed",
            "assignee": "新しい担当者"
        }
        
        task_update = TaskUpdate(**update_data)
        assert task_update.title == "更新されたタイトル"
        assert task_update.status == "completed"
        assert task_update.assignee == "新しい担当者"
        assert task_update.has_updates()


class TestFieldValidationLimits:
    """フィールドの制限値テスト"""
    
    def test_title_max_length_boundary(self):
        """タイトル最大長の境界値テスト"""
        # 255文字（境界値）
        title_255 = "a" * 255
        valid_data = {"title": title_255}
        
        task = TaskCreate(**valid_data)
        assert len(task.title) == 255
        
        # 256文字（境界値超過）
        title_256 = "a" * 256
        invalid_data = {"title": title_256}
        
        with pytest.raises(ValidationError):
            TaskCreate(**invalid_data)
    
    def test_description_max_length_boundary(self):
        """説明最大長の境界値テスト"""
        # 5000文字（境界値）
        description_5000 = "a" * 5000
        valid_data = {
            "title": "テストタスク",
            "description": description_5000
        }
        
        task = TaskCreate(**valid_data)
        assert len(task.description) == 5000
        
        # 5001文字（境界値超過）
        description_5001 = "a" * 5001
        invalid_data = {
            "title": "テストタスク",
            "description": description_5001
        }
        
        with pytest.raises(ValidationError):
            TaskCreate(**invalid_data)
    
    def test_assignee_max_length_boundary(self):
        """担当者名最大長の境界値テスト"""
        # 100文字（境界値）
        assignee_100 = "a" * 100
        valid_data = {
            "title": "テストタスク",
            "assignee": assignee_100
        }
        
        task = TaskCreate(**valid_data)
        assert len(task.assignee) == 100
        
        # 101文字（境界値超過）
        assignee_101 = "a" * 101
        invalid_data = {
            "title": "テストタスク",
            "assignee": assignee_101
        }
        
        with pytest.raises(ValidationError):
            TaskCreate(**invalid_data)