import { Link, useLocation } from "react-router";

/**
 * 共通ナビゲーションコンポーネント
 */
export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "ホーム", icon: "🏠" },
    { path: "/tasks", label: "タスク一覧", icon: "📋" },
    { path: "/tasks/new", label: "新規作成", icon: "➕" }
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      backgroundColor: "#343a40",
      padding: "1rem 0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* ロゴ・ブランド名 */}
        <Link 
          to="/" 
          viewTransition
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <span>📝</span>
          タスク管理アプリ
        </Link>

        {/* ナビゲーションメニュー */}
        <div style={{
          display: "flex",
          gap: "0.5rem"
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              viewTransition
              style={{
                color: isActive(item.path) ? "#fff" : "#adb5bd",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: isActive(item.path) ? "#495057" : "transparent",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: isActive(item.path) ? "bold" : "normal"
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "#495057";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#adb5bd";
                }
              }}
            >
              <span>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* レスポンシブ対応のスタイル */}
      <style>{`
        @media (max-width: 768px) {
          .nav-label {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}