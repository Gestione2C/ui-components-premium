import { defineConfig } from "vite";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build "file singolo": npm run build:single  ->  dist-single/commesse.html (apribile con doppio clic)
export default defineConfig({
  plugins: [viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  build: {
    outDir: "dist-single",
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { input: path.resolve(__dirname, "commesse.html") },
  },
});
