import { Link, useParams, useNavigate } from "react-router";
import type { Route } from "./+types/detail";
import { deleteTask } from "../../lib/api";

export const meta: Route.MetaFunction = ({ params }) => {
  return [{ title: `タスク詳細 - タスク${params.id} - タスク管理アプリ` }];
};

// サンプルデータ（後でAPIから取得）
const sampleTasks = [
  {
    id: 1,
    title: "React Routerの学習",
    description: "React Router V7の基本機能を理解する。ルーティング、フォーム処理、データローディングなどの機能を実装し、実際のプロジェクトで活用できるレベルまで習得する。",
    dueDate: "2025-07-25",
    assignee: "田中太郎",
    status: "in_progress" as const,
    createdAt: "2025-07-20",
    updatedAt: "2025-07-21"
  },
  {
    id: 2,
    title: "API設計",
    description: "タスク管理用のAPI仕様を設計する",
    dueDate: "2025-07-23",
    assignee: "佐藤花子",
    status: "pending" as const,
    createdAt: "2025-07-20",
    updatedAt: "2025-07-20"
  }
];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const taskId = parseInt(id || "0", 10);
  const task = sampleTasks.find(t => t.id === taskId);

  if (!task) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>タスクが見つかりません</h1>
        <p>指定されたタスクは存在しません。</p>
        <Link to="/tasks" viewTransition style={{ color: "#007bff" }}>タスク一覧に戻る</Link>
      </div>
    );
  }

  const getStatusLabel = (status: typeof task.status) => {
    switch (status) {
      case 'pending': return '未着手';
      case 'in_progress': return '進行中';
      case 'completed': return '完了';
      default: return status;
    }
  };

  const getStatusColor = (status: typeof task.status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'in_progress': return '#17a2b8';
      case 'completed': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/tasks" viewTransition style={{ 
          color: "#007bff",
          textDecoration: "none"
        }}>
          ← タスク一覧に戻る
        </Link>
      </div>

      <div style={{ 
        maxWidth: "800px",
        backgroundColor: "#f8f9fa",
        padding: "2rem",
        borderRadius: "8px",
        border: "1px solid #ddd"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <h1 style={{ margin: 0, color: "#495057" }}>{task.title}</h1>
          <span 
            style={{ 
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "white",
              backgroundColor: getStatusColor(task.status)
            }}
          >
            {getStatusLabel(task.status)}
          </span>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#495057", marginBottom: "0.5rem" }}>説明</h3>
          <p style={{ lineHeight: "1.6", color: "#6c757d" }}>
            {task.description}
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>担当者</h4>
            <p style={{ margin: 0, color: "#6c757d" }}>{task.assignee}</p>
          </div>
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>期限</h4>
            <p style={{ margin: 0, color: "#6c757d" }}>{task.dueDate}</p>
          </div>
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>作成日</h4>
            <p style={{ margin: 0, color: "#6c757d" }}>{task.createdAt}</p>
          </div>
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>更新日</h4>
            <p style={{ margin: 0, color: "#6c757d" }}>{task.updatedAt}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            to={`/tasks/${task.id}/edit`}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#ffc107",
              color: "black",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: "bold"
            }}
          >
            編集
          </Link>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "bold"
            }}
            onClick={async () => {
              if (confirm("このタスクを削除しますか？")) {
                try {
                  await deleteTask(taskId);
                  alert("タスクが削除されました");
                  navigate("/tasks");
                } catch (error) {
                  console.error("削除エラー:", error);
                  alert("タスクの削除に失敗しました");
                }
              }
            }}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}