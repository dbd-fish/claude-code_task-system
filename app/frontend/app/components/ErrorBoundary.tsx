import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * アプリケーション全体のエラーを捕捉するコンポーネント
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーが発生しました:', error);
    console.error('エラー情報:', errorInfo);
    
    // ここで外部ログ収集サービスに送信することも可能
    // logErrorToService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          margin: "2rem"
        }}>
          <div style={{
            fontSize: "4rem",
            marginBottom: "1rem"
          }}>
            ⚠️
          </div>
          <h2 style={{
            color: "#dc3545",
            marginBottom: "1rem"
          }}>
            申し訳ございません
          </h2>
          <p style={{
            color: "#6c757d",
            marginBottom: "2rem",
            maxWidth: "500px",
            lineHeight: "1.6"
          }}>
            予期しないエラーが発生しました。<br />
            ページを再読み込みしていただくか、しばらく時間をおいてから再度お試しください。
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0056b3";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#007bff";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ページを再読み込み
            </button>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                boxShadow: "0 2px 4px rgba(108, 117, 125, 0.2)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5a6268";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6c757d";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              前のページに戻る
            </button>
          </div>
          {this.state.error && process.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginTop: "2rem", 
              textAlign: "left", 
              maxWidth: "600px",
              width: "100%"
            }}>
              <summary style={{ 
                cursor: "pointer", 
                color: "#dc3545",
                fontWeight: "bold"
              }}>
                開発者向けエラー情報
              </summary>
              <pre style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "4px",
                border: "1px solid #dee2e6",
                overflow: "auto",
                fontSize: "0.875rem",
                marginTop: "0.5rem"
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}