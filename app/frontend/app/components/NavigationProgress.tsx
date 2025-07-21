import { useNavigation } from "react-router";
import { useEffect, useState } from "react";

/**
 * ナビゲーション進行状況を表示するプログレスバーコンポーネント
 */
export default function NavigationProgress() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (navigation.state === "loading") {
      setProgress(30);
      const timer1 = setTimeout(() => setProgress(60), 100);
      const timer2 = setTimeout(() => setProgress(90), 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (navigation.state === "idle") {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  if (progress === 0) {
    return null;
  }

  return (
    <div className="progress-bar">
      <div 
        className="progress-bar-fill"
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? "width 0.2s ease-out" : "width 0.3s ease"
        }}
      />
    </div>
  );
}