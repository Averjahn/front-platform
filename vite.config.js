import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    open: true,
    // Разрешаем доступ через внешние туннели (tuna, ngrok и т.п.)
    // Явно перечисляем хосты, чтобы избежать ошибок Vite
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      // текущий tuna-хост
      'tb5789-95-37-212-211.ru.tuna.am',
      // на случай смены хоста — общий шаблон под tuna
      '.tuna.am'
    ]
  }
});

