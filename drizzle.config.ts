import { defineConfig } from "drizzle-kit";

// Generation requires no connection. Application is a separate explicit script.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
});
