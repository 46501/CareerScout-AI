import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() => {
  console.log('Web running on http://localhost:5173');
  return {
    plugins: [react()],
    envDir: '../../',
    server: {
      port: 5173
    }
  }
})
