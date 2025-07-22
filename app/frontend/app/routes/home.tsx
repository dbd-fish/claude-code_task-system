import { Link } from "react-router";
import type { Route } from "./+types/home";
import PageLayout from "~/components/PageLayout";

export const meta: Route.MetaFunction = () => {
  return [{ title: "ホーム - タスク管理アプリ" }];
};

export default function Home() {
  return (
    <PageLayout>
      <div style={{ padding: "2rem" }}>
        <h1>タスク管理アプリ</h1>
        <p>React Router V7を使用したタスク管理アプリケーションです。</p>
        
        <nav style={{ marginTop: "2rem" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "1rem" }}>
              <Link to="/tasks" viewTransition className="nav-transition" style={{ 
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                display: "inline-block"
              }}>
                タスク一覧を見る
              </Link>
            </li>
            <li>
              <Link to="/tasks/new" viewTransition className="nav-transition" style={{ 
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                display: "inline-block"
              }}>
                新しいタスクを作成
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </PageLayout>
  );
}