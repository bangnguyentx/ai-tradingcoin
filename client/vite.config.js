import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// cấu hình build Vite
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist"
  },
  server: {
    port: 3000
  }
});
