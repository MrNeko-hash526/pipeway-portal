import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    // bind to all interfaces so both localhost and network clients can reach the dev server
    server: {
      host: '::',        // use '0.0.0.0' if you prefer IPv4 only
      port: 8080,
      strictPort: false, // try another port if 8080 is busy
      hmr: {
        overlay: true,   // show runtime errors in browser overlay
      },
    },

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // keep existing defaults for build / optimize if any
  }
})
