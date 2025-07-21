#!/usr/bin/env python3
"""
モックバックエンドを使用した統合テスト
実際のバックエンドサーバーなしでAPI連携をテスト
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import time
import requests
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class MockAPIHandler(BaseHTTPRequestHandler):
    """モックAPIのハンドラー"""
    
    # モックデータストレージ
    tasks_db = [
        {
            "id": 1,
            "title": "React Routerの学習",
            "description": "React Router V7の基本機能を理解する",
            "dueDate": "2025-07-25",
            "assignee": "田中太郎",
            "status": "in_progress",
            "createdAt": "2025-07-20",
            "updatedAt": "2025-07-20"
        },
        {
            "id": 2,
            "title": "API設計",
            "description": "タスク管理用のAPI仕様を設計する",
            "dueDate": "2025-07-23",
            "assignee": "佐藤花子",
            "status": "pending",
            "createdAt": "2025-07-20",
            "updatedAt": "2025-07-20"
        }
    ]
    next_id = 3
    
    def _send_json_response(self, data, status_code=200):
        """JSON レスポンスを送信"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
        
    def _get_request_body(self):
        """リクエストボディを取得"""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
            return json.loads(body.decode('utf-8'))
        return {}
        
    def do_OPTIONS(self):
        """CORS プリフライトリクエストに対応"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_GET(self):
        """GETリクエストハンドラー"""
        path = urlparse(self.path).path
        
        if path == '/health':
            self._send_json_response({"status": "ok", "message": "Mock API is running"})
            
        elif path == '/tasks':
            self._send_json_response(self.tasks_db)
            
        elif path.startswith('/tasks/'):
            task_id = int(path.split('/')[-1])
            task = next((t for t in self.tasks_db if t['id'] == task_id), None)
            if task:
                self._send_json_response(task)
            else:
                self._send_json_response({"error": "Task not found"}, 404)
                
        else:
            self._send_json_response({"error": "Endpoint not found"}, 404)
            
    def do_POST(self):
        """POSTリクエストハンドラー"""
        path = urlparse(self.path).path
        
        if path == '/tasks':
            data = self._get_request_body()
            
            # バリデーション
            if not data.get('title'):
                self._send_json_response({"error": "Title is required"}, 400)
                return
                
            new_task = {
                "id": self.next_id,
                "title": data['title'],
                "description": data.get('description', ''),
                "dueDate": data.get('dueDate'),
                "assignee": data.get('assignee', ''),
                "status": data.get('status', 'pending'),
                "createdAt": datetime.now().isoformat()[:10],
                "updatedAt": datetime.now().isoformat()[:10]
            }
            
            self.tasks_db.append(new_task)
            MockAPIHandler.next_id += 1
            self._send_json_response(new_task, 201)
            
        else:
            self._send_json_response({"error": "Endpoint not found"}, 404)
            
    def do_PUT(self):
        """PUTリクエストハンドラー"""
        path = urlparse(self.path).path
        
        if path.startswith('/tasks/'):
            task_id = int(path.split('/')[-1])
            task = next((t for t in self.tasks_db if t['id'] == task_id), None)
            
            if not task:
                self._send_json_response({"error": "Task not found"}, 404)
                return
                
            data = self._get_request_body()
            
            # タスクを更新
            task.update({
                "title": data.get('title', task['title']),
                "description": data.get('description', task['description']),
                "dueDate": data.get('dueDate', task['dueDate']),
                "assignee": data.get('assignee', task['assignee']),
                "status": data.get('status', task['status']),
                "updatedAt": datetime.now().isoformat()[:10]
            })
            
            self._send_json_response(task)
            
        else:
            self._send_json_response({"error": "Endpoint not found"}, 404)
            
    def do_DELETE(self):
        """DELETEリクエストハンドラー"""
        path = urlparse(self.path).path
        
        if path.startswith('/tasks/'):
            task_id = int(path.split('/')[-1])
            task = next((t for t in self.tasks_db if t['id'] == task_id), None)
            
            if task:
                self.tasks_db.remove(task)
                self.send_response(204)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
            else:
                self._send_json_response({"error": "Task not found"}, 404)
                
        else:
            self._send_json_response({"error": "Endpoint not found"}, 404)
            
    def log_message(self, format, *args):
        """ログメッセージを抑制"""
        pass

class MockBackendTester:
    """モックバックエンドテスター（Vite + React Router DOM対応）"""
    
    def __init__(self):
        self.server = None
        self.server_thread = None
        self.base_url = "http://localhost:8001"
        self.frontend_url = "http://localhost:3000"  # Vite dev server
        self.test_results = []
        
    def start_mock_server(self):
        """モックサーバーを起動"""
        self.server = HTTPServer(('localhost', 8001), MockAPIHandler)
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.daemon = True
        self.server_thread.start()
        
        # サーバーが起動するまで待機
        time.sleep(1)
        print("モックAPIサーバーが http://localhost:8001 で起動しました")
        
    def stop_mock_server(self):
        """モックサーバーを停止"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            
    def log_test(self, test_name: str, status: str, details: str = ""):
        """テスト結果を記録"""
        result = {
            "test_name": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"[{status}] {test_name}: {details}")
        
    def run_api_tests(self):
        """API テストを実行"""
        print("\n=== API 連携テスト開始 ===")
        
        # ヘルスチェック
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                self.log_test("Mock API Health Check", "PASS", "Mock server is responding")
            else:
                self.log_test("Mock API Health Check", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Mock API Health Check", "FAIL", f"Error: {str(e)}")
            
        # タスク一覧取得
        try:
            response = requests.get(f"{self.base_url}/tasks")
            if response.status_code == 200:
                tasks = response.json()
                self.log_test("GET /tasks", "PASS", f"Retrieved {len(tasks)} tasks")
            else:
                self.log_test("GET /tasks", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /tasks", "FAIL", f"Error: {str(e)}")
            
        # タスク作成
        test_task = {
            "title": "統合テスト用タスク",
            "description": "モックAPIで作成されたテストタスク",
            "dueDate": "2025-07-25",
            "assignee": "テスト担当者",
            "status": "pending"
        }
        
        created_task_id = None
        try:
            response = requests.post(f"{self.base_url}/tasks", json=test_task)
            if response.status_code == 201:
                created_task = response.json()
                created_task_id = created_task['id']
                self.log_test("POST /tasks", "PASS", f"Created task ID: {created_task_id}")
            else:
                self.log_test("POST /tasks", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("POST /tasks", "FAIL", f"Error: {str(e)}")
            
        # タスク詳細取得
        if created_task_id:
            try:
                response = requests.get(f"{self.base_url}/tasks/{created_task_id}")
                if response.status_code == 200:
                    task = response.json()
                    self.log_test("GET /tasks/{id}", "PASS", f"Retrieved task: {task['title']}")
                else:
                    self.log_test("GET /tasks/{id}", "FAIL", f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("GET /tasks/{id}", "FAIL", f"Error: {str(e)}")
                
        # タスク更新
        if created_task_id:
            update_data = {
                "title": "統合テスト用タスク（更新済み）",
                "status": "in_progress"
            }
            try:
                response = requests.put(f"{self.base_url}/tasks/{created_task_id}", json=update_data)
                if response.status_code == 200:
                    self.log_test("PUT /tasks/{id}", "PASS", "Task updated successfully")
                else:
                    self.log_test("PUT /tasks/{id}", "FAIL", f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("PUT /tasks/{id}", "FAIL", f"Error: {str(e)}")
                
        # タスク削除
        if created_task_id:
            try:
                response = requests.delete(f"{self.base_url}/tasks/{created_task_id}")
                if response.status_code == 204:
                    self.log_test("DELETE /tasks/{id}", "PASS", "Task deleted successfully")
                else:
                    self.log_test("DELETE /tasks/{id}", "FAIL", f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("DELETE /tasks/{id}", "FAIL", f"Error: {str(e)}")
                
        # エラーハンドリングテスト
        try:
            response = requests.get(f"{self.base_url}/tasks/999999")
            if response.status_code == 404:
                self.log_test("404 Error Handling", "PASS", "Correctly returns 404 for non-existent task")
            else:
                self.log_test("404 Error Handling", "FAIL", f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("404 Error Handling", "FAIL", f"Error: {str(e)}")
            
        # バリデーションエラーテスト
        invalid_task = {"title": ""}  # 空のタイトル
        try:
            response = requests.post(f"{self.base_url}/tasks", json=invalid_task)
            if response.status_code == 400:
                self.log_test("Validation Error", "PASS", "Correctly rejects invalid data")
            else:
                self.log_test("Validation Error", "FAIL", f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Validation Error", "FAIL", f"Error: {str(e)}")
            
    def generate_report(self):
        """テスト結果レポートを生成"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        report = {
            "test_type": "Mock Backend Integration Test",
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%"
            },
            "test_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"\n=== テスト結果サマリー ===")
        print(f"総テスト数: {total_tests}")
        print(f"成功: {passed_tests}")
        print(f"失敗: {failed_tests}")
        print(f"成功率: {report['summary']['success_rate']}")
        
        return report
        
    def run_tests(self):
        """全テストを実行"""
        print("=== モックバックエンド統合テスト開始 ===")
        
        try:
            self.start_mock_server()
            self.run_api_tests()
            
            report = self.generate_report()
            
            # レポートファイル保存
            with open("mock_integration_test_report.json", "w", encoding="utf-8") as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
                
            return report['summary']['failed'] == 0
            
        finally:
            self.stop_mock_server()

def main():
    """メイン実行関数"""
    tester = MockBackendTester()
    
    success = tester.run_tests()
    
    if success:
        print("\n✅ 全てのモック統合テストが成功しました！")
        return True
    else:
        print("\n❌ 一部のテストが失敗しました。")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)