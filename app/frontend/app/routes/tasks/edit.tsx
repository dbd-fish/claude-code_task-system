import { Form, Link, redirect, useParams, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/edit";
import { getTask, updateTask } from "~/lib/api";
import { getStatusLabel, getStatusColor } from "~/lib/utils";
import type { Task, TaskStatus } from "~/lib/types";
import { useState, useEffect } from "react";

export const meta: Route.MetaFunction = ({ params }) => {
  return [{ title: `タスク編集 - タスク${params.id} - タスク管理アプリ` }];
};

export async function loader({ params }: Route.LoaderArgs): Promise<{ task: Task | null }> {
  try {
    const taskId = parseInt(params.id || "0", 10);
    if (isNaN(taskId) || taskId <= 0) {
      return { task: null };
    }
    
    const task = await getTask(taskId);
    return { task };
  } catch (error) {
    console.error('タスク取得エラー:', error);
    // APIエラーの場合はサンプルデータを返す
    const taskId = parseInt(params.id || "0", 10);
    const sampleTasks = [
      {
        id: 1,
        title: "React Routerの学習",
        description: "React Router V7の基本機能を理解する。ルーティング、フォーム処理、データローディングなどの機能を実装し、実際のプロジェクトで活用できるレベルまで習得する。",
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
    ];
    
    const task = sampleTasks.find(t => t.id === taskId) || null;
    return { task };
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const taskId = parseInt(params.id || "0", 10);
  
  // フォームデータの取得とバリデーション
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const assignee = formData.get("assignee") as string;
  const status = formData.get("status") as TaskStatus;

  // バリデーションエラーチェック
  const errors: Record<string, string> = {};
  
  if (!title || title.trim().length === 0) {
    errors.title = "タスクタイトルは必須です";
  } else if (title.trim().length > 100) {
    errors.title = "タスクタイトルは100文字以内で入力してください";
  }
  
  if (description && description.length > 500) {
    errors.description = "タスク説明は500文字以内で入力してください";
  }
  
  if (!dueDate) {
    errors.dueDate = "期限は必須です";
  }
  
  if (!assignee || assignee.trim().length === 0) {
    errors.assignee = "担当者は必須です";
  } else if (assignee.trim().length > 50) {
    errors.assignee = "担当者名は50文字以内で入力してください";
  }
  
  if (!status || !["pending", "in_progress", "completed"].includes(status)) {
    errors.status = "有効なステータスを選択してください";
  }
  
  // バリデーションエラーがある場合はエラーを返す
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      formData: { title, description, dueDate, assignee, status }
    };
  }

  const updateData = {
    title: title.trim(),
    description: description.trim(),
    dueDate,
    assignee: assignee.trim(),
    status
  };

  try {
    // APIでタスクデータを更新
    await updateTask(taskId, updateData);
    
    // 成功時はタスク詳細ページにリダイレクト
    return redirect(`/tasks/${taskId}`);
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return {
      success: false,
      errors: { general: "タスクの更新に失敗しました。しばらくしてから再度お試しください。" },
      formData: { title, description, dueDate, assignee, status }
    };
  }
}

export default function EditTask() {
  const { task } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // フォームの初期値設定
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    dueDate: task?.dueDate || "",
    assignee: task?.assignee || "",
    status: task?.status || "pending" as TaskStatus
  });
  
  // actionDataからフォームデータを復元（エラー時）
  useEffect(() => {
    if (actionData?.formData) {
      setFormData(actionData.formData);
    } else if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        assignee: task.assignee,
        status: task.status
      });
    }
  }, [actionData, task]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!task) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>タスクが見つかりません</h1>
        <p>指定されたタスクは存在しません。</p>
        <Link to="/tasks" viewTransition style={{ color: "#007bff" }}>タスク一覧に戻る</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>タスク編集</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to={`/tasks/${task.id}`} viewTransition style={{ 
            color: "#007bff",
            textDecoration: "none"
          }}>
            ← タスク詳細に戻る
          </Link>
          <Link to="/tasks" viewTransition style={{ 
            color: "#007bff",
            textDecoration: "none"
          }}>
            タスク一覧に戻る
          </Link>
        </div>
      </div>

      {/* エラーメッセージ表示 */}
      {actionData?.errors?.general && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "0.75rem",
          borderRadius: "4px",
          border: "1px solid #f5c6cb",
          marginBottom: "1rem",
          maxWidth: "600px"
        }}>
          {actionData.errors.general}
        </div>
      )}

      <Form method="post" style={{ maxWidth: "600px" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            タスクタイトル *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: `1px solid ${actionData?.errors?.title ? "#dc3545" : "#ccc"}`,
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            placeholder="タスクのタイトルを入力してください"
          />
          {actionData?.errors?.title && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.title}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            タスク説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: `1px solid ${actionData?.errors?.description ? "#dc3545" : "#ccc"}`,
              borderRadius: "4px",
              fontSize: "1rem",
              resize: "vertical"
            }}
            placeholder="タスクの詳細説明を入力してください"
          />
          {actionData?.errors?.description && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.description}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="dueDate" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            期限 *
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            required
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: `1px solid ${actionData?.errors?.dueDate ? "#dc3545" : "#ccc"}`,
              borderRadius: "4px",
              fontSize: "1rem"
            }}
          />
          {actionData?.errors?.dueDate && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.dueDate}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="assignee" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            担当者 *
          </label>
          <input
            type="text"
            id="assignee"
            name="assignee"
            required
            value={formData.assignee}
            onChange={(e) => handleInputChange("assignee", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: `1px solid ${actionData?.errors?.assignee ? "#dc3545" : "#ccc"}`,
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            placeholder="担当者名を入力してください"
          />
          {actionData?.errors?.assignee && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.assignee}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label htmlFor="status" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            ステータス *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: `1px solid ${actionData?.errors?.status ? "#dc3545" : "#ccc"}`,
              borderRadius: "4px",
              fontSize: "1rem"
            }}
          >
            <option value="pending">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
          </select>
          {actionData?.errors?.status && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {actionData.errors.status}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? "更新中..." : "変更を保存"}
          </button>
          <Link
            to={`/tasks/${task.id}`}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              display: "inline-block"
            }}
          >
            キャンセル
          </Link>
        </div>
      </Form>
    </div>
  );
}