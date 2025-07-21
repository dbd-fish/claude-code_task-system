"""
タスク管理APIの単体テスト

このモジュールは、タスク関連のAPIエンドポイントの単体テストを定義します。
全てのCRUD操作とエラーハンドリングをテストします。
"""

import pytest
from datetime import date, timedelta


class TestTaskCreation:
    """タスク作成APIのテストクラス"""
    
    def test_create_task_success(self, client, sample_task_data):
        """タスク作成の正常系テスト"""
        response = client.post("/tasks", json=sample_task_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # レスポンス構造の確認
        assert "message" in data
        assert "task" in data
        assert data["message"] == "タスクが正常に作成されました"
        
        # タスクデータの確認
        task = data["task"]
        assert task["title"] == sample_task_data["title"]
        assert task["description"] == sample_task_data["description"]
        assert task["deadline"] == sample_task_data["deadline"]
        assert task["assignee"] == sample_task_data["assignee"]
        assert task["status"] == sample_task_data["status"]
        assert "id" in task
        assert "created_at" in task
        assert "updated_at" in task
    
    def test_create_task_minimal_data(self, client):
        """最小限のデータでのタスク作成テスト"""
        minimal_data = {"title": "最小限タスク"}
        response = client.post("/tasks", json=minimal_data)
        
        assert response.status_code == 201
        data = response.json()
        
        task = data["task"]
        assert task["title"] == "最小限タスク"
        assert task["description"] is None
        assert task["deadline"] is None
        assert task["assignee"] is None
        assert task["status"] == "pending"  # デフォルト値
    
    def test_create_task_missing_title(self, client):
        """タイトルなしでのタスク作成エラーテスト"""
        invalid_data = {"description": "タイトルがありません"}
        response = client.post("/tasks", json=invalid_data)
        
        assert response.status_code == 422
    
    def test_create_task_empty_title(self, client):
        """空のタイトルでのタスク作成エラーテスト"""
        invalid_data = {"title": ""}
        response = client.post("/tasks", json=invalid_data)
        
        assert response.status_code == 422
    
    def test_create_task_invalid_status(self, client):
        """無効なステータスでのタスク作成エラーテスト"""
        invalid_data = {
            "title": "テストタスク",
            "status": "invalid_status"
        }
        response = client.post("/tasks", json=invalid_data)
        
        assert response.status_code == 422
    
    def test_create_task_past_deadline(self, client):
        """過去の期限でのタスク作成エラーテスト"""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        invalid_data = {
            "title": "テストタスク",
            "deadline": yesterday
        }
        response = client.post("/tasks", json=invalid_data)
        
        assert response.status_code == 422


class TestTaskRetrieval:
    """タスク取得APIのテストクラス"""
    
    def test_get_task_by_id_success(self, client, created_task):
        """IDによるタスク取得の正常系テスト"""
        task_id = created_task["task"]["id"]
        response = client.get(f"/tasks/{task_id}")
        
        assert response.status_code == 200
        task = response.json()
        
        assert task["id"] == task_id
        assert task["title"] == created_task["task"]["title"]
        assert task["description"] == created_task["task"]["description"]
    
    def test_get_task_not_found(self, client):
        """存在しないタスクの取得エラーテスト"""
        response = client.get("/tasks/99999")
        
        assert response.status_code == 404
        error = response.json()
        assert "detail" in error
        assert "99999" in error["detail"]
    
    def test_get_tasks_list_empty(self, client):
        """空のタスク一覧取得テスト"""
        response = client.get("/tasks")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "tasks" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert "total_pages" in data
        assert "has_next" in data
        assert "has_prev" in data
        
        assert data["tasks"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["has_next"] is False
        assert data["has_prev"] is False
    
    def test_get_tasks_list_with_data(self, client, multiple_tasks):
        """データありのタスク一覧取得テスト"""
        response = client.get("/tasks")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["tasks"]) == 3
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["total_pages"] == 1
        assert data["has_next"] is False
        assert data["has_prev"] is False
    
    def test_get_tasks_with_status_filter(self, client, multiple_tasks):
        """ステータスフィルターでのタスク一覧取得テスト"""
        response = client.get("/tasks?status=pending")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["status"] == "pending"
    
    def test_get_tasks_with_assignee_filter(self, client, multiple_tasks):
        """担当者フィルターでのタスク一覧取得テスト"""
        response = client.get("/tasks?assignee=ユーザー1")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["tasks"]) == 2
        for task in data["tasks"]:
            assert "ユーザー1" in task["assignee"]
    
    def test_get_tasks_with_pagination(self, client, multiple_tasks):
        """ページネーションでのタスク一覧取得テスト"""
        response = client.get("/tasks?page=1&size=2")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["tasks"]) == 2
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["size"] == 2
        assert data["total_pages"] == 2
        assert data["has_next"] is True
        assert data["has_prev"] is False
    
    def test_get_tasks_invalid_status_filter(self, client):
        """無効なステータスフィルターでのエラーテスト"""
        response = client.get("/tasks?status=invalid")
        
        assert response.status_code == 400


class TestTaskUpdate:
    """タスク更新APIのテストクラス"""
    
    def test_update_task_success(self, client, created_task):
        """タスク更新の正常系テスト"""
        task_id = created_task["task"]["id"]
        update_data = {
            "title": "更新されたタイトル",
            "status": "in_progress"
        }
        
        response = client.put(f"/tasks/{task_id}", json=update_data)
        
        assert response.status_code == 200
        task = response.json()
        
        assert task["id"] == task_id
        assert task["title"] == "更新されたタイトル"
        assert task["status"] == "in_progress"
        # 他のフィールドは変更されていないことを確認
        assert task["description"] == created_task["task"]["description"]
    
    def test_update_task_partial(self, client, created_task):
        """部分更新のテスト"""
        task_id = created_task["task"]["id"]
        update_data = {"status": "completed"}
        
        response = client.put(f"/tasks/{task_id}", json=update_data)
        
        assert response.status_code == 200
        task = response.json()
        
        assert task["status"] == "completed"
        # 他のフィールドは変更されていないことを確認
        assert task["title"] == created_task["task"]["title"]
    
    def test_update_task_not_found(self, client):
        """存在しないタスクの更新エラーテスト"""
        update_data = {"title": "更新"}
        response = client.put("/tasks/99999", json=update_data)
        
        assert response.status_code == 404
    
    def test_update_task_empty_data(self, client, created_task):
        """空のデータでの更新エラーテスト"""
        task_id = created_task["task"]["id"]
        response = client.put(f"/tasks/{task_id}", json={})
        
        assert response.status_code == 400
    
    def test_update_task_invalid_status(self, client, created_task):
        """無効なステータスでの更新エラーテスト"""
        task_id = created_task["task"]["id"]
        invalid_data = {"status": "invalid_status"}
        
        response = client.put(f"/tasks/{task_id}", json=invalid_data)
        
        assert response.status_code == 422


class TestTaskDeletion:
    """タスク削除APIのテストクラス"""
    
    def test_delete_confirmation_success(self, client, created_task):
        """削除確認の正常系テスト"""
        task_id = created_task["task"]["id"]
        response = client.get(f"/tasks/{task_id}/delete-confirmation")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "task" in data
        assert "warning" in data
        assert data["task"]["id"] == task_id
        assert "削除します" in data["warning"]
    
    def test_delete_confirmation_not_found(self, client):
        """存在しないタスクの削除確認エラーテスト"""
        response = client.get("/tasks/99999/delete-confirmation")
        
        assert response.status_code == 404
    
    def test_delete_task_success(self, client, created_task):
        """タスク削除の正常系テスト"""
        task_id = created_task["task"]["id"]
        response = client.delete(f"/tasks/{task_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "deleted_task" in data
        assert "削除されました" in data["message"]
        assert data["deleted_task"]["id"] == task_id
        
        # 削除後の確認
        get_response = client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 404
    
    def test_delete_task_not_found(self, client):
        """存在しないタスクの削除エラーテスト"""
        response = client.delete("/tasks/99999")
        
        assert response.status_code == 404


class TestAPIIntegration:
    """API統合テストクラス"""
    
    def test_complete_crud_workflow(self, client):
        """完全なCRUD操作のワークフローテスト"""
        # 1. タスク作成
        create_data = {
            "title": "CRUDテストタスク",
            "description": "統合テスト用",
            "deadline": "2025-12-31",
            "assignee": "統合テストユーザー",
            "status": "pending"
        }
        
        create_response = client.post("/tasks", json=create_data)
        assert create_response.status_code == 201
        task = create_response.json()["task"]
        task_id = task["id"]
        
        # 2. タスク取得
        get_response = client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 200
        retrieved_task = get_response.json()
        assert retrieved_task["title"] == create_data["title"]
        
        # 3. タスク更新
        update_data = {"status": "in_progress", "description": "更新された説明"}
        update_response = client.put(f"/tasks/{task_id}", json=update_data)
        assert update_response.status_code == 200
        updated_task = update_response.json()
        assert updated_task["status"] == "in_progress"
        assert updated_task["description"] == "更新された説明"
        
        # 4. タスク削除
        delete_response = client.delete(f"/tasks/{task_id}")
        assert delete_response.status_code == 200
        
        # 5. 削除確認
        final_get_response = client.get(f"/tasks/{task_id}")
        assert final_get_response.status_code == 404