import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./styles/transitions.css";
import NavigationProgress from "./components/NavigationProgress";

import type { Route } from "./+types/root";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "タスク管理アプリ" },
    { name: "description", content: "React Router V7を使用したタスク管理アプリケーション" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NavigationProgress />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラーが発生しました";
  if (isRouteErrorResponse(error)) {
    message = error.data || error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div>
      <h1>予期しないエラーが発生しました</h1>
      <p>{message}</p>
    </div>
  );
}