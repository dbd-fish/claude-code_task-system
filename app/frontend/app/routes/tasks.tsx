import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/tasks";
import { getTasks } from "~/lib/api";
import { getStatusLabel, getStatusColor, getDueDateColor } from "~/lib/utils";
import type { Task } from "~/lib/types";
import { useState, useMemo } from "react";
import PageLayout from "~/components/PageLayout";

export const meta: Route.MetaFunction = () => {
  return [{ title: "タスク一覧 - タスク管理アプリ" }];
};

export async function loader(): Promise<{ tasks: Task[] }> {
  try {
    const tasks = await getTasks();
    return { tasks };
  } catch (error) {
    console.error('タスク取得エラー:', error);
    // APIエラーの場合はサンプルデータを返す
    return {
      tasks: [
        {
          id: 1,
          title: "React Routerの学習",
          description: "React Router V7の基本機能を理解する",
          dueDate: "2025-07-25",
          assignee: "田中太郎",
          status: "in_progress" as const
        },
        {
          id: 2,
          title: "API設計",
          description: "タスク管理用のAPI仕様を設計する",
          dueDate: "2025-07-23",
          assignee: "佐藤花子",
          status: "pending" as const
        }
      ]
    };
  }
}

export default function Tasks() {
  const { tasks } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");

  // フィルタリングとソートされたタスクリスト
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesAssignee;
    });

    // ソート処理
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title, 'ja');
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "status":
          const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        case "assignee":
          return a.assignee.localeCompare(b.assignee, 'ja');
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, assigneeFilter, sortBy]);

  // ユニークな担当者リストを取得
  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.assignee)));
  }, [tasks]);

  return (
    <PageLayout>
      <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>タスク一覧 ({filteredAndSortedTasks.length}件)</h1>
        <div>
          <Link to="/tasks/new" viewTransition style={{ 
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            marginRight: "1rem"
          }}>
            新規作成
          </Link>
          <Link to="/" viewTransition style={{ 
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px"
          }}>
            ホームに戻る
          </Link>
        </div>
      </div>

      {/* 検索・フィルタセクション */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1.5rem", 
        borderRadius: "8px", 
        marginBottom: "2rem",
        border: "1px solid #ddd"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#495057" }}>検索・フィルタ</h3>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          {/* 検索ボックス */}
          <div>
            <label htmlFor="search" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              キーワード検索
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="タイトル、説明、担当者で検索"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
          </div>

          {/* ステータスフィルタ */}
          <div>
            <label htmlFor="statusFilter" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              ステータス
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            >
              <option value="all">すべて</option>
              <option value="pending">未着手</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
            </select>
          </div>

          {/* 担当者フィルタ */}
          <div>
            <label htmlFor="assigneeFilter" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              担当者
            </label>
            <select
              id="assigneeFilter"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            >
              <option value="all">すべて</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          {/* ソート */}
          <div>
            <label htmlFor="sortBy" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              並び順
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            >
              <option value="dueDate">期限順</option>
              <option value="title">タイトル順</option>
              <option value="status">ステータス順</option>
              <option value="assignee">担当者順</option>
            </select>
          </div>
        </div>

        {/* フィルタリセットボタン */}
        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setAssigneeFilter("all");
            setSortBy("dueDate");
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          フィルタをリセット
        </button>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}>
          {tasks.length === 0 ? (
            <p>タスクがありません。新しいタスクを作成してください。</p>
          ) : (
            <p>検索条件に一致するタスクがありません。</p>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {filteredAndSortedTasks.map((task) => (
            <div 
              key={task.id} 
              style={{ 
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "#f8f9fa"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, color: "#495057" }}>
                  <Link to={`/tasks/${task.id}`} viewTransition style={{ textDecoration: "none", color: "inherit" }}>
                    {task.title}
                  </Link>
                </h3>
                <span 
                  style={{ 
                    padding: "0.25rem 0.5rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: getStatusColor(task.status)
                  }}
                >
                  {getStatusLabel(task.status)}
                </span>
              </div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d" }}>{task.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#6c757d" }}>
                <span>担当者: {task.assignee}</span>
                <span style={{ color: getDueDateColor(task.dueDate) }}>
                  期限: {task.dueDate}
                </span>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Link 
                  to={`/tasks/${task.id}`}
                  viewTransition
                  style={{ 
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    marginRight: "0.5rem"
                  }}
                >
                  詳細
                </Link>
                <Link 
                  to={`/tasks/${task.id}/edit`}
                  viewTransition
                  style={{ 
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#ffc107",
                    color: "black",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "0.8rem"
                  }}
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </PageLayout>
  );
}