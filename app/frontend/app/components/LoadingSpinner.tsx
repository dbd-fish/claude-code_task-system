/**
 * ローディングスピナーコンポーネント
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export default function LoadingSpinner({ 
  message = "読み込み中...", 
  size = "medium" 
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: "20px",
    medium: "40px",
    large: "60px"
  };

  return (
    <div className="page-loading">
      <div 
        className="loading-spinner"
        style={{
          width: sizeMap[size],
          height: sizeMap[size]
        }}
      />
      <p style={{ 
        color: "#6c757d", 
        fontSize: "0.9rem",
        margin: 0 
      }}>
        {message}
      </p>
    </div>
  );
}