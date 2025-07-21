import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/new";
import { createTask } from "~/lib/api";
import { getTodayString } from "~/lib/utils";
import { useState, useEffect } from "react";
import type { CreateTaskData } from "~/lib/types";

export const meta: Route.MetaFunction = () => {
  return [{ title: "新規タスク作成 - タスク管理アプリ" }];
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  
  // フォームデータの取得とバリデーション
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const assignee = formData.get("assignee") as string;

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
  } else {
    const today = new Date();
    const due = new Date(dueDate);
    if (due < today) {
      errors.dueDate = "期限は今日以降で設定してください";
    }
  }
  
  if (!assignee || assignee.trim().length === 0) {
    errors.assignee = "担当者は必須です";
  } else if (assignee.trim().length > 50) {
    errors.assignee = "担当者名は50文字以内で入力してください";
  }
  
  // バリデーションエラーがある場合はエラーを返す
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      formData: { title, description, dueDate, assignee }
    };
  }

  const taskData: CreateTaskData = {
    title: title.trim(),
    description: description.trim(),
    dueDate,
    assignee: assignee.trim()
  };

  try {
    // APIにタスクデータを送信
    await createTask(taskData);
    
    // 成功時はタスク一覧ページにリダイレクト
    return redirect("/tasks");
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return {
      success: false,
      errors: { general: "タスクの作成に失敗しました。しばらくしてから再度お試しください。" },
      formData: { title, description, dueDate, assignee }
    };
  }
}

export default function NewTask() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // フォームの初期値設定
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: getTodayString(),
    assignee: ""
  });
  
  // actionDataからフォームデータを復元（エラー時）
  useEffect(() => {
    if (actionData?.formData) {
      setFormData(actionData.formData);
    }
  }, [actionData]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>新規タスク作成</h1>
        <Link to="/tasks" viewTransition style={{ 
          color: "#007bff",
          textDecoration: "none"
        }}>
          ← タスク一覧に戻る
        </Link>
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
            min={getTodayString()}
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

        <div style={{ marginBottom: "2rem" }}>
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

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isSubmitting ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? "作成中..." : "タスクを作成"}
          </button>
          <Link
            to="/tasks"
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