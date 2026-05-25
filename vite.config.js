import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  // Strip verbose logs from production bundles so user IDs, emails,
  // and other diagnostic detail aren't shipped to the browser console.
  // We keep console.warn / console.error so genuine failures are still
  // visible to anyone debugging from devtools.
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.debug', 'console.info'],
  },
})
