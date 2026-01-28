import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/store/auth';

// Если задан VITE_API_BASE_URL, используем его (для Render/Vercel и др.),
// иначе по умолчанию localhost:3000 для локальной разработки.
// Примечание: порт может меняться, настрой через .env.local
function resolveBaseUrl() {
  // 1) Явно задано в env — это приоритет (правильный способ для продакшена)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  // 2) Автоподстановка для продакшен-сборок, если env не задан
  // (чтобы фронт не пытался ходить на localhost после деплоя)
  try {
    const host = window?.location?.hostname || '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal) {
      // Ваш задеплоенный backend на Render
      return 'https://test-back-jx77.onrender.com/api';
    }
  } catch {
    // ignore (например, если окружение без window)
  }

  // 3) Фолбэк для локальной разработки
  return 'http://localhost:3000/api';
}

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Логируем запросы для отладки
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        // Не перенаправляем на логин для запроса токена iframe
        const isIframeTokenRequest = error.config?.url?.includes('/auth/iframe-token');
        
        if (!isIframeTokenRequest) {
          // Очищаем данные пользователя из localStorage и store
          localStorage.removeItem('user');
          
          // Очищаем пользователя из store
          const auth = useAuthStore();
          auth.clearUser();

          if (router.currentRoute.value.name !== 'login') {
            router.push('/login');
          }

          console.error(`Ошибка авторизации (${status}): доступ запрещен`);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

