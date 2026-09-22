import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content.ts"),
      name: "JobApplicationAssistantContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
  },
});
