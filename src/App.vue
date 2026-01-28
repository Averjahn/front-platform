<template>
  <div class="app">
    <PatientHeader v-if="showPatientHeader" />
    <DoctorHeader v-else-if="showDoctorHeader" />
    <AdminHeader v-else-if="showAdminHeader" />
    <NavBar v-else-if="showNavBar" />
    <main class="app-main" :class="{ 'app-main-full': showPatientHeader || showDoctorHeader || showAdminHeader }">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { RouterView, useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import PatientHeader from './components/PatientHeader.vue';
import DoctorHeader from './components/DoctorHeader.vue';
import AdminHeader from './components/AdminHeader.vue';
import { useAuthStore } from './store/auth';

export default {
  name: 'App',
  components: {
    NavBar,
    PatientHeader,
    DoctorHeader,
    AdminHeader,
    RouterView
  },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  computed: {
    user() {
      return this.auth.state.user;
    },
    isAuthenticated() {
      return !!this.user;
    },
    isLoginPage() {
      return this.$route.name === 'login';
    },
    showNavBar() {
      // Не показываем меню на странице логина
      if (this.isLoginPage) return false;
      // Не показываем меню, если пользователь не авторизован
      if (!this.isAuthenticated) return false;
      // Показываем NavBar только если нет роли или роль не соответствует заголовкам
      return this.user.role !== 'PATIENT' && this.user.role !== 'DOCTOR' && this.user.role !== 'ADMIN';
    },
    showPatientHeader() {
      // Не показываем меню на странице логина или если не авторизован
      if (this.isLoginPage || !this.isAuthenticated) return false;
      return this.user?.role === 'PATIENT';
    },
    showDoctorHeader() {
      // Не показываем меню на странице логина или если не авторизован
      if (this.isLoginPage || !this.isAuthenticated) return false;
      return this.user?.role === 'DOCTOR';
    },
    showAdminHeader() {
      // Не показываем меню на странице логина или если не авторизован
      if (this.isLoginPage || !this.isAuthenticated) return false;
      return this.user?.role === 'ADMIN';
    }
  },
  mounted() {
    // Загружаем пользователя из localStorage, если его нет в store
    // Но только если мы не на странице логина
    if (!this.isLoginPage && !this.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          this.auth.setUser(parsed);
        } catch (e) {
          console.error('Ошибка при загрузке данных пользователя:', e);
          // Очищаем поврежденные данные
          localStorage.removeItem('user');
        }
      }
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-lg);
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  background: var(--color-bg-primary);
  box-sizing: border-box;
}

.app-main-full {
  padding: 0;
  max-width: 100%;
  background: var(--color-bg-secondary);
  width: 100%;
  box-sizing: border-box;
}

/* Улучшенная типографика */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text-primary);
}

p {
  margin: 0;
  line-height: 1.6;
}

/* Улучшенные кнопки */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Улучшенные формы */
input, select, textarea {
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

/* Плавные переходы */
a, button, .nav-item {
  transition: all 0.2s ease;
}

/* Улучшенная доступность */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .app-main {
    padding: 1.5rem 1rem;
  }
}
</style>

