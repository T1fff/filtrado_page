import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "/filtrado_page/",
  plugins: [react()],
})
