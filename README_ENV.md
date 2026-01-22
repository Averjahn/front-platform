# Настройка переменных окружения для фронтенда

## Локальная разработка

Создай файл `.env.local` в корне проекта `platform-front`:

```env
VITE_API_BASE_URL=http://localhost:54112/api
```

**Важно**: `.env.local` уже в `.gitignore`, он не попадёт в репозиторий.

## Production (Vercel)

В настройках проекта на Vercel → **Environment Variables**:

```env
VITE_API_BASE_URL=https://твой-бэкенд-домен/api
```

Например:
- Если бэкенд на Render: `https://test-back-jx77.onrender.com/api`
- Если бэкенд на твоём компьютере через Cloudflare Tunnel: `https://xxxxx.trycloudflare.com/api`
- Если бэкенд на Timeweb Cloud: `https://xxx.app.timeweb.cloud/api`

## После изменения .env.local

Перезапусти dev-сервер:

```bash
npm run dev
```

Vite автоматически подхватит новые переменные.
