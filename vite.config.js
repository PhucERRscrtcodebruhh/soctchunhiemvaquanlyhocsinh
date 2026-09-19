import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Nếu chạy trên Vercel thì lấy '/', nếu build cho GitHub Pages thì lấy sub-path
  base: process.env.VERCEL ? '/' : '/soctchunhiemvaquanlyhocsinh/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})