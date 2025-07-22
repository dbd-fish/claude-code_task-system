import React from "react";

/**
 * ローディングスピナーコンポーネント
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function LoadingSpinner({ 
  message = "読み込み中...", 
  size = "medium",
  color = "#007bff"
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: "20px",
    medium: "40px",
    large: "60px"
  };

  const spinnerSize = sizeMap[size];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div 
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid ${color}20`,
          borderTop: `3px solid ${color}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem"
        }}
      />
      
      {message && (
        <p style={{
          color: "#6c757d",
          margin: 0,
          fontSize: "0.9rem"
        }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * インラインローディングコンポーネント（小さなスピナー）
 */
export function InlineSpinner({ color = "#007bff" }: { color?: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginLeft: "0.5rem"
      }}
    />
  );
}