# Документация Frontend

## Оглавление

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Безопасность](#безопасность)
3. [Аутентификация и авторизация](#аутентификация-и-авторизация)
4. [Структура проекта](#структура-проекта)
5. [Роутинг](#роутинг)
6. [Управление состоянием](#управление-состоянием)
7. [API интеграция](#api-интеграция)
8. [Компоненты](#компоненты)
9. [Стилизация](#стилизация)
10. [Логические связи](#логические-связи)

---

## Обзор архитектуры

### Технологический стек

- **Framework**: Vue 3 (Composition API)
- **Router**: Vue Router 4
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **State Management**: Vue Reactive API (простой store)

### Архитектурные принципы

1. **Компонентный подход**: Переиспользуемые компоненты для header, модальных окон
2. **Разделение по ролям**: Отдельные компоненты для разных ролей пользователей
3. **Централизованная стилизация**: CSS переменные и общие стили
4. **API абстракция**: Централизованный Axios instance с interceptors
5. **Защита маршрутов**: Route guards для проверки аутентификации

---

## Безопасность

### 1. Хранение токенов

**Реализация**: HttpOnly cookies (управляется backend)

**Обоснование**:
- HttpOnly cookies недоступны для JavaScript, защита от XSS
- Cookies автоматически отправляются с каждым запросом
- Backend устанавливает cookies при логине

**Альтернатива**: Для мобильных приложений токен может храниться в localStorage, но это менее безопасно.

### 2. Защита от XSS

**Реализация**:
- Vue автоматически экранирует данные в шаблонах
- Использование `v-html` только для доверенного контента (не используется в текущей реализации)

**Рекомендации**:
- Никогда не используйте `v-html` с пользовательским контентом
- Валидируйте все данные перед отображением

### 3. CSRF защита

**Реализация**: SameSite cookies (управляется backend)

**Примечание**: Backend настраивает cookies с атрибутом SameSite для защиты от CSRF атак.

### 4. Валидация данных

**Реализация**: Валидация на уровне форм

```vue
<input
  v-model="formData.email"
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
/>
```

**Обоснование**:
- HTML5 валидация предотвращает отправку некорректных данных
- Дополнительная валидация на backend (двойная проверка)

### 5. Защита маршрутов

**Реализация**: Route guards в `router/index.js`

```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuth();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  next();
});
```

**Логика**:
- Проверка наличия пользователя в localStorage
- Перенаправление на логин при отсутствии аутентификации
- Сохранение целевого маршрута для редиректа после логина

---

## Аутентификация и авторизация

### Процесс аутентификации

#### 1. Логин

**Компонент**: `LoginView.vue`

**Процесс**:
1. Пользователь вводит email и password
2. Отправка POST запроса на `/api/auth/login`
3. Backend устанавливает HttpOnly cookie с JWT токеном
4. Токен также возвращается в теле ответа
5. Сохранение данных пользователя в localStorage и store

```javascript
// platform-front/src/views/LoginView.vue
const response = await api.post('/auth/login', {
  email: formData.email,
  password: formData.password,
});

// Сохранение пользователя
localStorage.setItem('user', JSON.stringify(response.data.user));
auth.setUser(response.data.user);

// Редирект на dashboard
router.push('/dashboard');
```

#### 2. Проверка аутентификации

**Реализация**: `checkAuth()` в `router/index.js`

```javascript
function checkAuth() {
  const user = localStorage.getItem('user');
  return !!user;
}
```

**Ограничения**:
- Проверка только наличия пользователя в localStorage
- Не проверяет валидность токена (это делает backend)
- При истечении токена backend вернет 401, и пользователь будет перенаправлен на логин

#### 3. Автоматический logout при 401/403

**Реализация**: Axios interceptor в `services/api.js`

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        // Очистка данных пользователя
        localStorage.removeItem('user');
        auth.clearUser();

        // Редирект на логин
        if (router.currentRoute.value.name !== 'login') {
          router.push('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);
```

**Обоснование**:
- Автоматическая очистка данных при истечении токена
- Предотвращение доступа к защищенным маршрутам с невалидным токеном

#### 4. Logout

**Реализация**: В компонентах профиля

```javascript
async handleLogout() {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Ошибка при выходе:', err);
  } finally {
    auth.clearUser();
    localStorage.removeItem('user');
    router.push('/login');
  }
}
```

**Логика**:
- Отправка запроса на logout (опционально, для инвалидации токена на backend)
- Очистка локальных данных
- Редирект на логин

### Ролевая авторизация

**Реализация**: Проверка роли пользователя в компонентах

```vue
<template>
  <div v-if="userRole === 'ADMIN'">
    <!-- Контент для администратора -->
  </div>
  <div v-else-if="userRole === 'DOCTOR'">
    <!-- Контент для врача -->
  </div>
  <div v-else-if="userRole === 'PATIENT'">
    <!-- Контент для пациента -->
  </div>
</template>

<script>
computed: {
  userRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  }
}
</script>
```

**Обоснование**:
- Backend проверяет права доступа к API endpoints
- Frontend скрывает UI элементы для неавторизованных ролей
- Это UX улучшение, не заменяет проверку на backend

---

## Структура проекта

```
platform-front/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── AdminHeader.vue
│   │   ├── DoctorHeader.vue
│   │   ├── PatientHeader.vue
│   │   ├── EditProfileModal.vue
│   │   ├── TariffModal.vue
│   │   └── DatePicker.vue
│   ├── views/               # Страницы приложения
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── PatientProfileView.vue
│   │   ├── PatientAssignmentsView.vue
│   │   ├── PatientDiaryView.vue
│   │   ├── PatientAchievementsView.vue
│   │   ├── PatientTrainersView.vue
│   │   ├── DoctorPatientsView.vue
│   │   ├── DoctorPatientDetailsView.vue
│   │   ├── DoctorTrainersView.vue
│   │   ├── AdminPatientsView.vue
│   │   ├── AdminAddPatientView.vue
│   │   ├── AdminAppointmentsView.vue
│   │   ├── AdminDocumentsView.vue
│   │   ├── AdminPatientDocumentsView.vue
│   │   └── AdminProfileView.vue
│   ├── router/
│   │   └── index.js         # Конфигурация роутинга
│   ├── services/
│   │   └── api.js           # Axios instance с interceptors
│   ├── store/
│   │   └── auth.js          # Простой store для аутентификации
│   ├── styles/
│   │   ├── colors.css       # CSS переменные для цветов
│   │   └── common.css       # Общие стили
│   ├── App.vue              # Корневой компонент
│   └── main.js              # Точка входа
├── .env.local               # Переменные окружения
└── vite.config.js           # Конфигурация Vite
```

### Принцип организации компонентов

**Header компоненты**:
- `AdminHeader.vue` - для администратора
- `DoctorHeader.vue` - для врача
- `PatientHeader.vue` - для пациента

**Обоснование**: Разные роли имеют разные навигационные меню и функциональность.

**Модальные окна**:
- `EditProfileModal.vue` - редактирование профиля
- `TariffModal.vue` - выбор тарифа

**Обоснование**: Переиспользуемые компоненты для общих операций.

---

## Роутинг

### Конфигурация маршрутов

**Файл**: `router/index.js`

```javascript
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/patient/profile',
    name: 'patient-profile',
    component: PatientProfileView,
    meta: { requiresAuth: true }
  },
  // ...
];
```

### Route Guards

**Реализация**: `beforeEach` hook

```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuth();

  // Требуется аутентификация
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Требуется отсутствие аутентификации (для логина)
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }

  next();
});
```

**Логика**:
- `requiresAuth: true` - маршрут доступен только аутентифицированным пользователям
- `requiresGuest: true` - маршрут доступен только неаутентифицированным пользователям (например, логин)
- Сохранение целевого маршрута в query параметре для редиректа после логина

### Динамические маршруты

```javascript
{
  path: '/doctor/patient/:id',
  name: 'doctor-patient-details',
  component: () => import('@/views/DoctorPatientDetailsView.vue'),
  meta: { requiresAuth: true }
}
```

**Использование**:
```vue
<template>
  <div>
    <h1>Пациент {{ patientId }}</h1>
  </div>
</template>

<script>
export default {
  computed: {
    patientId() {
      return this.$route.params.id;
    }
  }
}
</script>
```

---

## Управление состоянием

### Простой Store (Vue Reactive API)

**Файл**: `store/auth.js`

```javascript
import { reactive, readonly } from 'vue';

const state = reactive({
  user: null
});

function setUser(user) {
  state.user = user;
}

function clearUser() {
  state.user = null;
}

export function useAuthStore() {
  return {
    state: readonly(state),
    setUser,
    clearUser
  };
}
```

**Использование**:
```vue
<script>
import { useAuthStore } from '@/store/auth';

export default {
  setup() {
    const auth = useAuthStore();
    
    // Установка пользователя
    auth.setUser(userData);
    
    // Получение пользователя
    const user = auth.state.user;
    
    return { auth, user };
  }
}
</script>
```

**Обоснование**:
- Простое решение для небольшого приложения
- Не требует дополнительных библиотек (Vuex/Pinia)
- `readonly()` предотвращает прямую модификацию state

**Ограничения**:
- Состояние не персистится между перезагрузками страницы
- Используется `localStorage` для персистентности

### Персистентность данных

**Реализация**: `localStorage`

```javascript
// Сохранение
localStorage.setItem('user', JSON.stringify(userData));

// Загрузка
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Очистка
localStorage.removeItem('user');
```

**Обоснование**:
- Простота реализации
- Данные сохраняются между сессиями

**Ограничения**:
- `localStorage` доступен для JavaScript (риск XSS)
- Ограничение размера (~5-10MB)
- Синхронный API (может блокировать UI)

**Рекомендация**: Для production рассмотреть использование `sessionStorage` для чувствительных данных или серверной сессии.

---

## API интеграция

### Axios Instance

**Файл**: `services/api.js`

```javascript
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // Важно для cookies
});
```

**Настройки**:
- `baseURL`: Базовый URL API (из переменных окружения)
- `timeout`: Таймаут запросов (10 секунд)
- `withCredentials: true`: Отправка cookies с каждым запросом (обязательно для HttpOnly cookies)

### Request Interceptor

```javascript
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Назначение**: Логирование запросов для отладки

### Response Interceptor

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        // Исключение для iframe token запроса
        const isIframeTokenRequest = error.config?.url?.includes('/auth/iframe-token');
        
        if (!isIframeTokenRequest) {
          // Очистка данных пользователя
          localStorage.removeItem('user');
          auth.clearUser();

          // Редирект на логин
          if (router.currentRoute.value.name !== 'login') {
            router.push('/login');
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
```

**Логика**:
- Автоматический logout при 401/403
- Исключение для специальных endpoints (например, iframe token)
- Редирект на логин при ошибке авторизации

### Использование API

**Пример**:
```vue
<script>
import api from '@/services/api';

export default {
  data() {
    return {
      profileData: null,
      loading: false,
      error: null
    };
  },
  async mounted() {
    await this.loadProfile();
  },
  methods: {
    async loadProfile() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/patient/profile');
        this.profileData = response.data;
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки профиля';
        console.error('Error loading profile:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

**Паттерны**:
- Всегда обрабатывайте ошибки в try-catch
- Показывайте состояние загрузки пользователю
- Логируйте ошибки для отладки

---

## Компоненты

### Header компоненты

#### PatientHeader.vue

**Назначение**: Навигация для пациента

**Структура**:
- Верхняя панель: название центра, телефон
- Навигационное меню: ссылки на разделы пациента

**Навигационные ссылки**:
- Мой профиль
- Назначения врача
- Мой дневник
- Мои достижения
- Каталог заданий

**Особенности**:
- Иконки для каждого раздела
- Активное состояние текущего маршрута
- Адаптивный дизайн

#### DoctorHeader.vue

**Назначение**: Навигация для врача

**Навигационные ссылки**:
- Мои пациенты
- Тренажеры
- Приемы
- Документы
- Мой профиль

#### AdminHeader.vue

**Назначение**: Навигация для администратора

**Навигационные ссылки**:
- Пациенты
- Приемы
- Документы
- Мой профиль

### Модальные окна

#### EditProfileModal.vue

**Назначение**: Редактирование профиля пациента

**Функциональность**:
- Загрузка аватара
- Редактирование ФИО
- Редактирование даты рождения
- Редактирование доверенного контакта

**Безопасность**:
- Валидация размера файла (5MB)
- Валидация типа файла (только изображения)
- Валидация обязательных полей (имя, фамилия)

**Процесс**:
1. Загрузка аватара (если выбран) → `PUT /api/patient/profile/avatar`
2. Обновление данных профиля → `PUT /api/patient/profile`
3. Обновление данных в компоненте родителя
4. Закрытие модального окна

#### TariffModal.vue

**Назначение**: Выбор тарифа для пациента

**Функциональность**:
- Отображение списка доступных тарифов
- Выделение текущего тарифа
- Выбор нового тарифа
- Подтверждение выбора

**Процесс**:
1. Загрузка списка тарифов → `GET /api/tariffs`
2. Выбор тарифа пользователем
3. Подтверждение → `PUT /api/patient/tariff`
4. Обновление профиля

---

## Стилизация

### CSS переменные

**Файл**: `styles/colors.css`

```css
:root {
  /* Основные цвета */
  --color-teal: #00CED1;
  --color-teal-dark: #00A8AB;
  --color-teal-light: #B2EBF2;
  
  /* Фоны */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  
  /* Текст */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  
  /* Отступы */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

**Обоснование**:
- Централизованное управление цветами
- Легкость изменения темы
- Консистентность дизайна

### Общие стили

**Файл**: `styles/common.css`

**Содержимое**:
- Стили для страниц (`.patient-profile-page`, `.doctor-patients-page`, etc.)
- Стили для заголовков (`.page-title`)
- Утилитарные классы

**Принципы**:
- Переиспользуемые классы
- Минимальное дублирование кода
- Адаптивность через media queries

### Scoped стили

**Использование**: `<style scoped>` в компонентах

**Обоснование**:
- Изоляция стилей компонента
- Предотвращение конфликтов стилей
- Локальные стили для специфичных компонентов

---

## Логические связи

### 1. Связь между компонентами

#### Родитель-потомок

**Пример**: `PatientProfileView.vue` → `EditProfileModal.vue`

```vue
<!-- PatientProfileView.vue -->
<template>
  <EditProfileModal
    :is-open="showEditProfileModal"
    :profile-data="profileData"
    @close="showEditProfileModal = false"
    @profile-updated="handleProfileUpdated"
  />
</template>

<script>
methods: {
  handleProfileUpdated() {
    // Обновление данных после редактирования
    this.loadProfile();
  }
}
</script>
```

**Логика**:
- Родительский компонент управляет состоянием модального окна
- Потомок эмитит события для обновления данных родителя
- Данные передаются через props

#### Коммуникация через события

```vue
<!-- EditProfileModal.vue -->
<script>
methods: {
  async handleSubmit() {
    await api.put('/patient/profile', updateData);
    this.$emit('profile-updated'); // Эмит события
    this.closeModal();
  }
}
</script>
```

### 2. Связь с API

#### Загрузка данных

**Паттерн**: Загрузка данных в `mounted()` hook

```vue
<script>
export default {
  data() {
    return {
      data: null,
      loading: false,
      error: null
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const response = await api.get('/endpoint');
        this.data = response.data;
      } catch (err) {
        this.error = err?.response?.data?.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

#### Обновление данных

**Паттерн**: Метод для обновления данных

```vue
<script>
methods: {
  async updateData(newData) {
    try {
      await api.put('/endpoint', newData);
      await this.loadData(); // Перезагрузка данных
    } catch (err) {
      this.error = err?.response?.data?.message;
    }
  }
}
</script>
```

### 3. Условный рендеринг по ролям

**Реализация**: Проверка роли пользователя

```vue
<template>
  <div v-if="userRole === 'ADMIN'">
    <!-- Контент для администратора -->
  </div>
  <div v-else-if="userRole === 'DOCTOR'">
    <!-- Контент для врача -->
  </div>
  <div v-else-if="userRole === 'PATIENT'">
    <!-- Контент для пациента -->
  </div>
</template>

<script>
computed: {
  userRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  }
}
</script>
```

**Обоснование**:
- Разные UI для разных ролей
- Backend проверяет права доступа, frontend улучшает UX

### 4. Динамические маршруты

**Пример**: Просмотр деталей пациента врачом

```javascript
// router/index.js
{
  path: '/doctor/patient/:id',
  name: 'doctor-patient-details',
  component: DoctorPatientDetailsView
}
```

```vue
<!-- DoctorPatientDetailsView.vue -->
<script>
export default {
  data() {
    return {
      patientId: null,
      patientData: null
    };
  },
  computed: {
    patientId() {
      return this.$route.params.id;
    }
  },
  async mounted() {
    await this.loadPatientData();
  },
  methods: {
    async loadPatientData() {
      const response = await api.get(`/doctor/patients/${this.patientId}`);
      this.patientData = response.data;
    }
  }
}
</script>
```

**Логика**:
- ID пациента из URL параметра
- Загрузка данных пациента по ID
- Backend проверяет, что пациент связан с врачом

---

## Переменные окружения

### Конфигурация

**Файл**: `.env.local`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Использование**:
```javascript
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

**Важно**:
- Переменные окружения должны начинаться с `VITE_` для Vite
- Файл `.env.local` не коммитится в git (в `.gitignore`)

### Разные окружения

**Development**:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Production**:
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## Лучшие практики

### 1. Обработка ошибок

**Всегда обрабатывайте ошибки**:
```vue
<script>
methods: {
  async loadData() {
    try {
      const response = await api.get('/endpoint');
      this.data = response.data;
    } catch (err) {
      // Показываем пользователю понятное сообщение
      this.error = err?.response?.data?.message || 'Произошла ошибка';
      console.error('Error:', err); // Логируем для отладки
    }
  }
}
</script>
```

### 2. Состояния загрузки

**Показывайте состояние загрузки**:
```vue
<template>
  <div v-if="loading">Загрузка...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <!-- Контент -->
  </div>
</template>
```

### 3. Валидация форм

**Валидируйте данные перед отправкой**:
```vue
<script>
methods: {
  async handleSubmit() {
    // Проверка обязательных полей
    if (!this.formData.email || !this.formData.password) {
      this.error = 'Заполните все обязательные поля';
      return;
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.error = 'Некорректный email';
      return;
    }

    // Отправка данных
    await api.post('/endpoint', this.formData);
  }
}
</script>
```

### 4. Оптимизация производительности

**Lazy loading компонентов**:
```javascript
// router/index.js
{
  path: '/patient/diary',
  component: () => import('@/views/PatientDiaryView.vue')
}
```

**Обоснование**: Компоненты загружаются только при необходимости, уменьшая начальный размер bundle.

### 5. Консистентность стилей

**Используйте CSS переменные**:
```css
.button {
  background: var(--color-teal);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

**Обоснование**: Легкость изменения темы и консистентность дизайна.

---

## Заключение

Данная документация описывает архитектуру, безопасность и логику работы frontend приложения. При разработке новых функций следуйте описанным принципам и практикам для обеспечения безопасности, производительности и поддерживаемости кода.
