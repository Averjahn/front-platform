## platform-front

Фронтенд-проект на **Vue 3** с использованием **Vite**, **Vue Router** и **Axios**.

### Стек

- **Сборщик**: Vite
- **Фреймворк**: Vue 3 (Options API, JavaScript)
- **Маршрутизация**: Vue Router 4
- **HTTP-клиент**: Axios

### Структура

- `src/views/` — страницевые компоненты (`HomeView`, `AboutView`, `LoginView`, `DashboardView`)
- `src/components/` — переиспользуемые UI-компоненты (`NavBar`)
- `src/router/` — конфигурация маршрутов (`index.js`) с guard'ами
- `src/services/api.js` — Axios instance с `baseURL`, `withCredentials` и обработкой 401/403
- `src/store/auth.js` — простой auth-state (текущий пользователь и его роль)

### Установка и запуск

```bash
cd platform-front
npm install
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`.

