import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // タスク管理アプリのReact Router設定
  appDirectory: "app",
  buildDirectory: "build",
  // View Transition APIを有効化
  future: {
    unstable_viewTransition: true,
  },
} satisfies Config;