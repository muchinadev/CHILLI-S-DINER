import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // pg's Pool() doesn't open a connection until first query, so a
    // syntactically valid placeholder is enough for pure-logic unit tests
    // that never touch the database.
    env: {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      SESSION_SECRET: "test-secret",
    },
  },
});
