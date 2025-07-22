#!/usr/bin/env python3
"""
統合テストスクリプト (更新版)
フロントエンド(Vite+React)とバックエンド(FastAPI)の連携を確認

更新内容:
- React Router DOM v6.28.0 対応
- Vite 開発サーバー対応
- 新しいポート設定対応
- エラーハンドリング強化
"""

import requests
import json
import time
import sys
import subprocess
from datetime import datetime
from typing import Dict, List, Any
import threading
import signal

class IntegrationTester:
    def __init__(self, backend_url: str = "http://localhost:8000", frontend_url: str = "http://localhost:3000"):
        self.backend_url = backend_url
        self.frontend_url = frontend_url
        self.test_results = []
        self.created_task_ids = []
        self.frontend_checks = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """テスト結果をログに記録"""
        result = {
            "test_name": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} [{status}] {test_name}: {details}")
        
    def test_backend_health_check(self) -> bool:
        """バックエンドヘルスチェックテスト"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                self.log_test("Backend Health Check", "PASS", "FastAPI server is responsive")
                return True
            else:
                self.log_test("Backend Health Check", "FAIL", f"Status: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Health Check", "FAIL", f"Connection error: {str(e)}")
            return False
            
    def test_frontend_health_check(self) -> bool:
        """フロントエンドヘルスチェックテスト"""
        try:
            response = requests.get(self.frontend_url, timeout=10)
            if response.status_code == 200:
                # HTML内容の基本確認
                content = response.text
                if "<!DOCTYPE html>" in content or "<!doctype html>" in content:
                    self.log_test("Frontend Health Check", "PASS", "Vite React app is serving content")
                    return True
                else:
                    self.log_test("Frontend Health Check", "WARN", "Frontend responds but content may be incomplete")
                    return True
            else:
                self.log_test("Frontend Health Check", "FAIL", f"Status: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Frontend Health Check", "FAIL", f"Connection error: {str(e)}")
            return False
            
    def test_frontend_routes(self) -> bool:
        """フロントエンドルートテスト（React Router DOM対応）"""
        routes_to_test = [
            "/",
            "/tasks", 
            "/tasks/new"
        ]
        
        success_count = 0
        total_tests = len(routes_to_test)
        
        for route in routes_to_test:
            try:
                url = f"{self.frontend_url}{route}"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    # SPA なので、全てのルートが同じindex.htmlを返すことを確認
                    content = response.text
                    if "<!DOCTYPE html>" in content or "<!doctype html>" in content:
                        self.log_test(f"Frontend Route {route}", "PASS", "Route accessible")
                        success_count += 1
                    else:
                        self.log_test(f"Frontend Route {route}", "FAIL", "Invalid HTML response")
                else:
                    self.log_test(f"Frontend Route {route}", "FAIL", f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Frontend Route {route}", "FAIL", f"Error: {str(e)}")
                
        return success_count == total_tests
            
    def test_backend_api_endpoints(self) -> bool:
        """バックエンドAPI エンドポイントの基本テスト"""
        success_count = 0
        total_tests = 0
        
        # GET /tasks - タスク一覧取得
        total_tests += 1
        try:
            response = requests.get(f"{self.backend_url}/tasks")
            if response.status_code == 200:
                tasks = response.json()
                self.log_test("GET /tasks", "PASS", f"Retrieved {len(tasks)} tasks")
                success_count += 1
            else:
                self.log_test("GET /tasks", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /tasks", "FAIL", f"Error: {str(e)}")
            
        # POST /tasks - タスク作成
        total_tests += 1
        test_task = {
            "title": "統合テスト用タスク (Updated)",
            "description": "Vite + React Router DOM統合テストで作成されたテストタスク",
            "dueDate": "2025-07-25",
            "assignee": "統合テスト担当者",
            "status": "pending"
        }
        
        try:
            response = requests.post(f"{self.backend_url}/tasks", json=test_task)
            if response.status_code == 201:
                created_task = response.json()
                task_id = created_task.get("id")
                if task_id:
                    self.created_task_ids.append(task_id)
                    self.log_test("POST /tasks", "PASS", f"Created task ID: {task_id}")
                    success_count += 1
                else:
                    self.log_test("POST /tasks", "FAIL", "Task created but no ID returned")
            else:
                response_text = response.text[:200] if response.text else "No response text"
                self.log_test("POST /tasks", "FAIL", f"Status: {response.status_code}, Response: {response_text}")
        except Exception as e:
            self.log_test("POST /tasks", "FAIL", f"Error: {str(e)}")
            
        return success_count == total_tests
        
    def test_crud_operations(self) -> bool:
        """CRUD操作の統合テスト"""
        if not self.created_task_ids or self.created_task_ids[0] is None:
            self.log_test("CRUD Test", "SKIP", "No valid task IDs available for testing")
            return True  # スキップは成功として扱う
            
        task_id = self.created_task_ids[0]
        success_count = 0
        total_tests = 0
        
        # GET /tasks/{id} - 特定タスク取得
        total_tests += 1
        try:
            response = requests.get(f"{self.backend_url}/tasks/{task_id}")
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
            "title": "統合テスト用タスク (更新済み - Vite版)",
            "description": "Vite + React Router DOMで更新されたテストタスク",
            "dueDate": "2025-07-26",
            "assignee": "統合テスト担当者（更新）",
            "status": "in_progress"
        }
        
        try:
            response = requests.put(f"{self.backend_url}/tasks/{task_id}", json=update_data)
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
            response = requests.delete(f"{self.backend_url}/tasks/{task_id}")
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
            response = requests.get(f"{self.backend_url}/tasks/999999")
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
            response = requests.post(f"{self.backend_url}/tasks", json=invalid_task)
            if response.status_code in [400, 422]:  # BadRequest or Validation Error
                self.log_test("Validation Error Handling", "PASS", "Correctly rejects invalid data")
                success_count += 1
            else:
                self.log_test("Validation Error Handling", "FAIL", f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Validation Error Handling", "FAIL", f"Error: {str(e)}")
            
        return success_count == total_tests
        
    def test_cors_configuration(self) -> bool:
        """CORS設定テスト（フロントエンド・バックエンド連携用）"""
        try:
            headers = {
                'Origin': self.frontend_url,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            # プリフライトリクエストをテスト
            response = requests.options(f"{self.backend_url}/tasks", headers=headers)
            
            if response.status_code == 200:
                cors_headers = response.headers
                if 'Access-Control-Allow-Origin' in cors_headers:
                    self.log_test("CORS Configuration", "PASS", "CORS headers properly configured")
                    return True
                else:
                    self.log_test("CORS Configuration", "WARN", "CORS headers missing but OPTIONS successful")
                    return True
            else:
                self.log_test("CORS Configuration", "FAIL", f"OPTIONS request failed: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("CORS Configuration", "FAIL", f"Error: {str(e)}")
            return False
        
    def cleanup(self):
        """テスト後のクリーンアップ"""
        for task_id in self.created_task_ids:
            try:
                requests.delete(f"{self.backend_url}/tasks/{task_id}")
            except:
                pass
                
    def generate_report(self) -> Dict[str, Any]:
        """テスト結果レポートを生成"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        warning_tests = len([r for r in self.test_results if r["status"] == "WARN"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        report = {
            "test_environment": {
                "backend_url": self.backend_url,
                "frontend_url": self.frontend_url,
                "frontend_framework": "Vite + React + React Router DOM v6.28.0",
                "backend_framework": "FastAPI"
            },
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "warnings": warning_tests,
                "skipped": skipped_tests,
                "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%"
            },
            "test_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
        
        return report
        
    def run_all_tests(self) -> bool:
        """全テストを実行"""
        print("=== 統合テスト開始 (更新版) ===")
        print(f"フロントエンド: {self.frontend_url} (Vite + React)")
        print(f"バックエンド: {self.backend_url} (FastAPI)")
        print("=" * 50)
        
        # バックエンドヘルスチェック
        if not self.test_backend_health_check():
            print("❌ バックエンドが利用できません。テストを中止します。")
            return False
            
        # フロントエンドヘルスチェック
        frontend_ok = self.test_frontend_health_check()
        if not frontend_ok:
            print("⚠️ フロントエンドが利用できませんが、バックエンドテストは継続します。")
        
        # フロントエンドルートテスト
        if frontend_ok:
            self.test_frontend_routes()
            
        # バックエンドAPIテスト
        self.test_backend_api_endpoints()
        
        # CRUD操作テスト
        self.test_crud_operations()
        
        # エラーハンドリングテスト
        self.test_error_handling()
        
        # CORS設定テスト
        self.test_cors_configuration()
        
        # クリーンアップ
        self.cleanup()
        
        # レポート生成
        report = self.generate_report()
        
        print("\n" + "=" * 50)
        print("📊 テスト結果サマリー")
        print("=" * 50)
        print(f"🧪 総テスト数: {report['summary']['total_tests']}")
        print(f"✅ 成功: {report['summary']['passed']}")
        print(f"❌ 失敗: {report['summary']['failed']}")
        print(f"⚠️ 警告: {report['summary']['warnings']}")
        print(f"⏭️ スキップ: {report['summary']['skipped']}")
        print(f"📈 成功率: {report['summary']['success_rate']}")
        print("=" * 50)
        
        # レポートファイル保存
        report_filename = f"integration_test_report_updated_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"📄 詳細レポート: {report_filename}")
            
        return report['summary']['failed'] == 0

def main():
    """メイン実行関数"""
    print("🚀 タスク管理アプリ統合テスト (更新版)")
    print("Vite + React Router DOM + FastAPI 連携確認")
    print("=" * 60)
    
    tester = IntegrationTester()
    
    print("🔍 環境確認:")
    print(f"   フロントエンド: {tester.frontend_url}")
    print(f"   バックエンド: {tester.backend_url}")
    print("💡 フロントエンド・バックエンドが起動していることを確認してください。")
    print("")
    
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 全ての統合テストが成功しました！")
        print("✨ フロントエンドとバックエンドの連携が正常に動作しています。")
        sys.exit(0)
    else:
        print("\n💥 一部のテストが失敗しました。")
        print("🔧 詳細レポートを確認して問題を修正してください。")
        sys.exit(1)

if __name__ == "__main__":
    main()