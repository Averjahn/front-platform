import axios from 'axios';
import router from '@/router';

// Если задан VITE_API_BASE_URL, используем его (для Render/Vercel и др.),
// иначе по умолчанию localhost:54112 для локальной разработки.
// Примечание: порт может меняться, настрой через .env.local
const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:54112/api';

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
          localStorage.removeItem('user');

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

