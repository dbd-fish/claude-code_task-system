import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/tasks", "routes/tasks.tsx"),
  route("/tasks/new", "routes/tasks/new.tsx"),
  route("/tasks/:id", "routes/tasks/detail.tsx"),
  route("/tasks/:id/edit", "routes/tasks/edit.tsx"),
] satisfies RouteConfig;