import Navigation from "./Navigation";
import Breadcrumb from "./Breadcrumb";

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * 共通ページレイアウトコンポーネント
 * ナビゲーションとパンくずナビゲーションを含む
 */
export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navigation />
      <Breadcrumb />
      <main style={{ 
        flex: 1,
        animation: "fade-in 0.3s ease-in-out",
        willChange: "transform, opacity"
      }}>
        {children}
      </main>
    </div>
  );
}