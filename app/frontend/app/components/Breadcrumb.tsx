import { Link, useLocation } from "react-router";

/**
 * パンくずナビゲーションコンポーネント
 */
export default function Breadcrumb() {
  const location = useLocation();
  // const params = useParams(); // 将来の実装用（現在未使用）

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ path: "/", label: "ホーム" }];

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    // パスに基づいてパンくずを生成
    if (pathSegments[0] === "tasks") {
      breadcrumbs.push({ path: "/tasks", label: "タスク一覧" });

      if (pathSegments[1] === "new") {
        breadcrumbs.push({ path: "/tasks/new", label: "新規作成" });
      } else if (pathSegments[1] && pathSegments[1] !== "new") {
        const taskId = pathSegments[1];
        breadcrumbs.push({ path: `/tasks/${taskId}`, label: `タスク ${taskId}` });

        if (pathSegments[2] === "edit") {
          breadcrumbs.push({ path: `/tasks/${taskId}/edit`, label: "編集" });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // ホームページでは表示しない
  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav style={{
      backgroundColor: "#f8f9fa",
      padding: "0.75rem 0",
      borderBottom: "1px solid #dee2e6"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1rem"
      }}>
        <ol style={{
          display: "flex",
          flexWrap: "wrap",
          margin: 0,
          padding: 0,
          listStyle: "none",
          fontSize: "0.875rem"
        }}>
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} style={{
              display: "flex",
              alignItems: "center"
            }}>
              {index > 0 && (
                <span style={{
                  margin: "0 0.5rem",
                  color: "#6c757d"
                }}>
                  /
                </span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span style={{
                  color: "#6c757d",
                  fontWeight: "normal"
                }}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  viewTransition
                  style={{
                    color: "#007bff",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}