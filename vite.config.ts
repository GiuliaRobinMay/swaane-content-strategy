import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build can be opened from any folder or host.
export default defineConfig({
  base: './',
  plugins: [react()],
})
