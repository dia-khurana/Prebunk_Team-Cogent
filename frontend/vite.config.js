import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server needs to be reachable from the live-preview host, so bind to 0.0.0.0.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // The live-preview host differs per session; allow any host so the preview works.
    allowedHosts: true,
  },
});
