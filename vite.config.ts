import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        commesse: path.resolve(__dirname, "commesse.html"),
      },
    },
  },
});
