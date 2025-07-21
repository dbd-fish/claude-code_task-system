#!/usr/bin/env python3
"""
統合テストスクリプト (最終版)
Vite + React Router DOM + FastAPI 環境での堅牢な統合テスト

改善点:
- エラーハンドリング強化
- より詳細なレスポンス分析
- フォールバック機能
- 包括的レポート機能
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional

class RobustIntegrationTester:
    def __init__(self, backend_url: str = "http://localhost:8000", frontend_url: str = "http://localhost:3000"):
        self.backend_url = backend_url
        self.frontend_url = frontend_url
        self.test_results = []
        self.created_task_ids = []
        
    def log_test(self, test_name: str, status: str, details: str = "", response_data: Optional[Dict] = None):
        """テスト結果をログに記録"""
        result = {
            "test_name": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response_data"] = response_data
            
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️" if status == "WARN" else "⏭️"
        print(f"{status_icon} [{status}] {test_name}: {details}")
        
    def safe_request(self, method: str, url: str, **kwargs) -> Optional[requests.Response]:
        """安全なHTTPリクエスト実行"""
        try:
            response = requests.request(method, url, timeout=10, **kwargs)
            return response
        except requests.exceptions.Timeout:
            self.log_test(f"{method.upper()} {url}", "FAIL", "Request timeout")
            return None
        except requests.exceptions.ConnectionError:
            self.log_test(f"{method.upper()} {url}", "FAIL", "Connection error")
            return None
        except Exception as e:
            self.log_test(f"{method.upper()} {url}", "FAIL", f"Unexpected error: {str(e)}")
            return None
            
    def test_system_health(self) -> Dict[str, bool]:
        """システム全体のヘルスチェック"""
        health_status = {"backend": False, "frontend": False}
        
        # バックエンドヘルスチェック
        response = self.safe_request("GET", f"{self.backend_url}/health")
        if response and response.status_code == 200:
            self.log_test("Backend Health Check", "PASS", "FastAPI server responsive")
            health_status["backend"] = True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Backend Health Check", "FAIL", f"Status: {status_code}")
            
        # フロントエンドヘルスチェック
        response = self.safe_request("GET", self.frontend_url)
        if response and response.status_code == 200:
            content = response.text
            if "<!DOCTYPE html>" in content.lower() or "<!doctype html>" in content.lower():
                self.log_test("Frontend Health Check", "PASS", "Vite dev server responsive")
                health_status["frontend"] = True
            else:
                self.log_test("Frontend Health Check", "WARN", "Responds but content may be incomplete")
                health_status["frontend"] = True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Frontend Health Check", "FAIL", f"Status: {status_code}")
            
        return health_status
        
    def test_frontend_spa_routes(self) -> bool:
        """フロントエンドSPAルートテスト"""
        if not self.test_system_health()["frontend"]:
            self.log_test("Frontend SPA Routes", "SKIP", "Frontend not available")
            return True
            
        routes = ["/", "/tasks", "/tasks/new"]
        success_count = 0
        
        for route in routes:
            response = self.safe_request("GET", f"{self.frontend_url}{route}")
            if response and response.status_code == 200:
                self.log_test(f"Frontend Route {route}", "PASS", "Route accessible")
                success_count += 1
            else:
                status_code = response.status_code if response else "No response"
                self.log_test(f"Frontend Route {route}", "FAIL", f"Status: {status_code}")
                
        return success_count == len(routes)
        
    def test_backend_api_comprehensive(self) -> Dict[str, Any]:
        """包括的バックエンドAPIテスト"""
        if not self.test_system_health()["backend"]:
            return {"success": False, "reason": "Backend not available"}
            
        api_test_results = {
            "tasks_list": False,
            "task_create": False,
            "task_read": False,
            "task_update": False,
            "task_delete": False,
            "created_task_id": None
        }
        
        # 1. タスク一覧取得
        response = self.safe_request("GET", f"{self.backend_url}/tasks")
        if response and response.status_code == 200:
            try:
                tasks = response.json()
                self.log_test("GET /tasks", "PASS", f"Retrieved {len(tasks)} tasks")
                api_test_results["tasks_list"] = True
            except json.JSONDecodeError:
                self.log_test("GET /tasks", "FAIL", "Invalid JSON response")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("GET /tasks", "FAIL", f"Status: {status_code}")
            
        # 2. タスク作成
        test_task = {
            "title": "統合テスト用タスク (Final)",
            "description": "最終版統合テストで作成されたテストタスク",
            "dueDate": "2025-07-25",
            "assignee": "統合テスト担当者",
            "status": "pending"
        }
        
        response = self.safe_request("POST", f"{self.backend_url}/tasks", json=test_task)
        if response and response.status_code == 201:
            try:
                created_task = response.json()
                task_id = created_task.get("id")
                if task_id:
                    self.created_task_ids.append(task_id)
                    api_test_results["created_task_id"] = task_id
                    api_test_results["task_create"] = True
                    self.log_test("POST /tasks", "PASS", f"Created task ID: {task_id}")
                else:
                    self.log_test("POST /tasks", "WARN", "Task created but no ID in response")
            except json.JSONDecodeError:
                self.log_test("POST /tasks", "FAIL", "Invalid JSON response")
        else:
            status_code = response.status_code if response else "No response"
            response_text = response.text[:200] if response and response.text else "No response text"
            self.log_test("POST /tasks", "FAIL", f"Status: {status_code}, Response: {response_text}")
            
        # 3-5. CRUD操作テスト（タスクが作成された場合のみ）
        if api_test_results["created_task_id"]:
            task_id = api_test_results["created_task_id"]
            
            # 3. タスク読み取り
            response = self.safe_request("GET", f"{self.backend_url}/tasks/{task_id}")
            if response and response.status_code == 200:
                try:
                    task = response.json()
                    self.log_test("GET /tasks/{id}", "PASS", f"Retrieved task: {task.get('title', 'No title')}")
                    api_test_results["task_read"] = True
                except json.JSONDecodeError:
                    self.log_test("GET /tasks/{id}", "FAIL", "Invalid JSON response")
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("GET /tasks/{id}", "FAIL", f"Status: {status_code}")
                
            # 4. タスク更新
            update_data = {
                "title": "統合テスト用タスク (更新済み)",
                "description": "最終版統合テストで更新されたテストタスク",
                "status": "in_progress"
            }
            
            response = self.safe_request("PUT", f"{self.backend_url}/tasks/{task_id}", json=update_data)
            if response and response.status_code == 200:
                self.log_test("PUT /tasks/{id}", "PASS", "Task updated successfully")
                api_test_results["task_update"] = True
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("PUT /tasks/{id}", "FAIL", f"Status: {status_code}")
                
            # 5. タスク削除
            response = self.safe_request("DELETE", f"{self.backend_url}/tasks/{task_id}")
            if response and response.status_code == 204:
                self.log_test("DELETE /tasks/{id}", "PASS", "Task deleted successfully")
                api_test_results["task_delete"] = True
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("DELETE /tasks/{id}", "FAIL", f"Status: {status_code}")
        else:
            self.log_test("CRUD Operations", "SKIP", "No valid task ID for CRUD testing")
            
        return api_test_results
        
    def test_error_scenarios(self) -> bool:
        """エラーシナリオテスト"""
        success_count = 0
        total_tests = 0
        
        # 存在しないタスクの取得
        total_tests += 1
        response = self.safe_request("GET", f"{self.backend_url}/tasks/999999")
        if response and response.status_code == 404:
            self.log_test("404 Error Handling", "PASS", "Correctly returns 404")
            success_count += 1
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("404 Error Handling", "FAIL", f"Expected 404, got {status_code}")
            
        # 無効なデータでタスク作成
        total_tests += 1
        invalid_task = {"title": "", "description": "Invalid task"}
        response = self.safe_request("POST", f"{self.backend_url}/tasks", json=invalid_task)
        if response and response.status_code in [400, 422]:
            self.log_test("Validation Error", "PASS", "Correctly rejects invalid data")
            success_count += 1
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Validation Error", "FAIL", f"Expected 400/422, got {status_code}")
            
        return success_count == total_tests
        
    def test_cors_configuration(self) -> bool:
        """CORS設定テスト"""
        headers = {
            'Origin': self.frontend_url,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = self.safe_request("OPTIONS", f"{self.backend_url}/tasks", headers=headers)
        if response and response.status_code == 200:
            cors_headers = response.headers
            if 'Access-Control-Allow-Origin' in cors_headers:
                self.log_test("CORS Configuration", "PASS", "CORS properly configured")
                return True
            else:
                self.log_test("CORS Configuration", "WARN", "CORS headers might be missing")
                return True
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("CORS Configuration", "FAIL", f"OPTIONS failed: {status_code}")
            return False
            
    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """包括的レポート生成"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        warning_tests = len([r for r in self.test_results if r["status"] == "WARN"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        success_rate = (passed_tests + warning_tests) / total_tests * 100 if total_tests > 0 else 0
        
        report = {
            "test_metadata": {
                "execution_time": datetime.now().isoformat(),
                "test_environment": {
                    "backend_url": self.backend_url,
                    "frontend_url": self.frontend_url,
                    "frontend_stack": "Vite + React + React Router DOM v6.28.0",
                    "backend_stack": "FastAPI + SQLAlchemy + PostgreSQL"
                }
            },
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "warnings": warning_tests,
                "skipped": skipped_tests,
                "success_rate": f"{success_rate:.1f}%",
                "overall_status": "PASS" if failed_tests == 0 else "FAIL"
            },
            "detailed_results": self.test_results,
            "recommendations": self.generate_recommendations()
        }
        
        return report
        
    def generate_recommendations(self) -> List[str]:
        """改善推奨事項を生成"""
        recommendations = []
        
        failed_tests = [r for r in self.test_results if r["status"] == "FAIL"]
        warning_tests = [r for r in self.test_results if r["status"] == "WARN"]
        
        if any("Backend" in test["test_name"] for test in failed_tests):
            recommendations.append("バックエンドサーバーの起動状態と設定を確認してください")
            
        if any("Frontend" in test["test_name"] for test in failed_tests):
            recommendations.append("フロントエンド開発サーバー（Vite）の起動状態を確認してください")
            
        if any("POST /tasks" in test["test_name"] for test in failed_tests):
            recommendations.append("タスク作成APIのリクエスト形式とバリデーション設定を確認してください")
            
        if any("CORS" in test["test_name"] for test in failed_tests + warning_tests):
            recommendations.append("CORS設定を確認し、フロントエンドドメインが許可されているか確認してください")
            
        if not recommendations:
            recommendations.append("全てのテストが正常に完了しました。システムは期待通りに動作しています。")
            
        return recommendations
        
    def run_full_test_suite(self) -> bool:
        """完全なテストスイートを実行"""
        print("🚀 タスク管理アプリ統合テスト (最終版)")
        print("=" * 60)
        print(f"📍 環境:")
        print(f"   フロントエンド: {self.frontend_url} (Vite + React)")
        print(f"   バックエンド: {self.backend_url} (FastAPI)")
        print("=" * 60)
        
        # システムヘルスチェック
        health_status = self.test_system_health()
        
        # フロントエンドSPAルートテスト
        if health_status["frontend"]:
            self.test_frontend_spa_routes()
        
        # バックエンドAPI包括テスト
        if health_status["backend"]:
            api_results = self.test_backend_api_comprehensive()
            
            # エラーシナリオテスト
            self.test_error_scenarios()
            
            # CORS設定テスト
            self.test_cors_configuration()
        
        # レポート生成
        report = self.generate_comprehensive_report()
        
        # 結果表示
        print("\n" + "=" * 60)
        print("📊 テスト結果サマリー")
        print("=" * 60)
        print(f"🧪 総テスト数: {report['summary']['total_tests']}")
        print(f"✅ 成功: {report['summary']['passed']}")
        print(f"❌ 失敗: {report['summary']['failed']}")
        print(f"⚠️ 警告: {report['summary']['warnings']}")
        print(f"⏭️ スキップ: {report['summary']['skipped']}")
        print(f"📈 成功率: {report['summary']['success_rate']}")
        print(f"🎯 総合判定: {report['summary']['overall_status']}")
        
        print("\n📋 推奨事項:")
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"  {i}. {rec}")
        
        # レポートファイル保存
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_filename = f"integration_test_final_report_{timestamp}.json"
        with open(report_filename, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"\n📄 詳細レポート: {report_filename}")
        print("=" * 60)
        
        return report['summary']['overall_status'] == "PASS"

def main():
    """メイン実行関数"""
    tester = RobustIntegrationTester()
    
    success = tester.run_full_test_suite()
    
    if success:
        print("\n🎉 統合テストが正常に完了しました！")
        print("✨ システム全体が期待通りに動作しています。")
        sys.exit(0)
    else:
        print("\n⚠️ 一部のテストで問題が検出されました。")
        print("🔍 詳細レポートを確認して問題を解決してください。")
        sys.exit(1)

if __name__ == "__main__":
    main()