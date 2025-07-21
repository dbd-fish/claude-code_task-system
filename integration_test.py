#!/usr/bin/env python3
"""
統合テストスクリプト
フロントエンドとバックエンドの連携を確認
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any

class IntegrationTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        self.created_task_ids = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """テスト結果をログに記録"""
        result = {
            "test_name": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"[{status}] {test_name}: {details}")
        
    def test_health_check(self) -> bool:
        """ヘルスチェックテスト"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                self.log_test("Health Check", "PASS", "Backend is responsive")
                return True
            else:
                self.log_test("Health Check", "FAIL", f"Status: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", "FAIL", f"Connection error: {str(e)}")
            return False
            
    def test_api_endpoints(self) -> bool:
        """API エンドポイントの基本テスト"""
        success_count = 0
        total_tests = 0
        
        # GET /tasks - タスク一覧取得
        total_tests += 1
        try:
            response = requests.get(f"{self.base_url}/tasks")
            if response.status_code == 200:
                tasks = response.json()
                self.log_test("GET /tasks", "PASS", f"Got {len(tasks)} tasks")
                success_count += 1
            else:
                self.log_test("GET /tasks", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /tasks", "FAIL", f"Error: {str(e)}")
            
        # POST /tasks - タスク作成
        total_tests += 1
        test_task = {
            "title": "統合テスト用タスク",
            "description": "統合テストで作成されたテストタスク",
            "dueDate": "2025-07-25",
            "assignee": "テスト担当者",
            "status": "pending"
        }
        
        try:
            response = requests.post(f"{self.base_url}/tasks", json=test_task)
            if response.status_code == 201:
                created_task = response.json()
                task_id = created_task.get("id")
                self.created_task_ids.append(task_id)
                self.log_test("POST /tasks", "PASS", f"Created task ID: {task_id}")
                success_count += 1
            else:
                self.log_test("POST /tasks", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("POST /tasks", "FAIL", f"Error: {str(e)}")
            
        return success_count == total_tests
        
    def test_crud_operations(self) -> bool:
        """CRUD操作の統合テスト"""
        if not self.created_task_ids:
            self.log_test("CRUD Test", "SKIP", "No tasks created to test")
            return False
            
        task_id = self.created_task_ids[0]
        success_count = 0
        total_tests = 0
        
        # GET /tasks/{id} - 特定タスク取得
        total_tests += 1
        try:
            response = requests.get(f"{self.base_url}/tasks/{task_id}")
            if response.status_code == 200:
                task = response.json()
                self.log_test("GET /tasks/{id}", "PASS", f"Retrieved task: {task['title']}")
                success_count += 1
            else:
                self.log_test("GET /tasks/{id}", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /tasks/{id}", "FAIL", f"Error: {str(e)}")
            
        # PUT /tasks/{id} - タスク更新
        total_tests += 1
        update_data = {
            "title": "統合テスト用タスク（更新済み）",
            "description": "統合テストで更新されたテストタスク",
            "dueDate": "2025-07-26",
            "assignee": "テスト担当者（更新）",
            "status": "in_progress"
        }
        
        try:
            response = requests.put(f"{self.base_url}/tasks/{task_id}", json=update_data)
            if response.status_code == 200:
                self.log_test("PUT /tasks/{id}", "PASS", "Task updated successfully")
                success_count += 1
            else:
                self.log_test("PUT /tasks/{id}", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("PUT /tasks/{id}", "FAIL", f"Error: {str(e)}")
            
        # DELETE /tasks/{id} - タスク削除
        total_tests += 1
        try:
            response = requests.delete(f"{self.base_url}/tasks/{task_id}")
            if response.status_code == 204:
                self.log_test("DELETE /tasks/{id}", "PASS", "Task deleted successfully")
                success_count += 1
            else:
                self.log_test("DELETE /tasks/{id}", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("DELETE /tasks/{id}", "FAIL", f"Error: {str(e)}")
            
        return success_count == total_tests
        
    def test_error_handling(self) -> bool:
        """エラーハンドリングテスト"""
        success_count = 0
        total_tests = 0
        
        # 存在しないタスクの取得
        total_tests += 1
        try:
            response = requests.get(f"{self.base_url}/tasks/999999")
            if response.status_code == 404:
                self.log_test("404 Error Handling", "PASS", "Correctly returns 404 for non-existent task")
                success_count += 1
            else:
                self.log_test("404 Error Handling", "FAIL", f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("404 Error Handling", "FAIL", f"Error: {str(e)}")
            
        # 無効なデータでのタスク作成
        total_tests += 1
        invalid_task = {
            "title": "",  # 空のタイトル
            "description": "無効なテストタスク"
        }
        
        try:
            response = requests.post(f"{self.base_url}/tasks", json=invalid_task)
            if response.status_code in [400, 422]:  # BadRequest or Validation Error
                self.log_test("Validation Error Handling", "PASS", "Correctly rejects invalid data")
                success_count += 1
            else:
                self.log_test("Validation Error Handling", "FAIL", f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Validation Error Handling", "FAIL", f"Error: {str(e)}")
            
        return success_count == total_tests
        
    def cleanup(self):
        """テスト後のクリーンアップ"""
        for task_id in self.created_task_ids:
            try:
                requests.delete(f"{self.base_url}/tasks/{task_id}")
            except:
                pass
                
    def generate_report(self) -> Dict[str, Any]:
        """テスト結果レポートを生成"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        report = {
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "skipped": skipped_tests,
                "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%"
            },
            "test_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
        
        return report
        
    def run_all_tests(self) -> bool:
        """全テストを実行"""
        print("=== 統合テスト開始 ===")
        
        # ヘルスチェック
        if not self.test_health_check():
            print("バックエンドが利用できません。テストを中止します。")
            return False
            
        # API基本テスト
        self.test_api_endpoints()
        
        # CRUD操作テスト
        self.test_crud_operations()
        
        # エラーハンドリングテスト
        self.test_error_handling()
        
        # クリーンアップ
        self.cleanup()
        
        # レポート生成
        report = self.generate_report()
        
        print("\n=== テスト結果サマリー ===")
        print(f"総テスト数: {report['summary']['total_tests']}")
        print(f"成功: {report['summary']['passed']}")
        print(f"失敗: {report['summary']['failed']}")
        print(f"スキップ: {report['summary']['skipped']}")
        print(f"成功率: {report['summary']['success_rate']}")
        
        # レポートファイル保存
        with open("integration_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
            
        return report['summary']['failed'] == 0

def main():
    """メイン実行関数"""
    tester = IntegrationTester()
    
    print("統合テストを開始します...")
    print("バックエンドが http://localhost:8000 で起動していることを確認してください。")
    
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ 全ての統合テストが成功しました！")
        sys.exit(0)
    else:
        print("\n❌ 一部のテストが失敗しました。")
        sys.exit(1)

if __name__ == "__main__":
    main()