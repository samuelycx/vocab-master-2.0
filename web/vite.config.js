import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const localBackend = env.VITE_LOCAL_BACKEND_URL || 'http://localhost:3002'

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: localBackend,
          changeOrigin: true,
        },
        '/uploads': {
          target: localBackend,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
  }
})
