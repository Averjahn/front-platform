<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="brand">
        <span class="brand-dot"></span>
        <span class="brand-title">platform-front</span>
      </div>

      <nav class="nav-links">
        <RouterLink
          to="/"
          class="nav-link"
          :class="{ 'nav-link--active': $route.name === 'home' }"
        >
          Главная
        </RouterLink>
        <RouterLink
          to="/about"
          class="nav-link"
          :class="{ 'nav-link--active': $route.name === 'about' }"
        >
          О проекте
        </RouterLink>
        <RouterLink
          v-if="isAuthenticated"
          to="/dashboard"
          class="nav-link"
          :class="{ 'nav-link--active': $route.name === 'dashboard' }"
        >
          Панель
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="nav-link"
          :class="{ 'nav-link--active': $route.name === 'login' }"
        >
          Вход
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'NavBar',
  components: {
    RouterLink
  },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  computed: {
    isAuthenticated() {
      return !!this.auth.state.user;
    }
  }
};
</script>

<style scoped>
.navbar {
  /* position: sticky; */
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  background: #00CED1;
  box-shadow: 0 0 8px rgba(0, 206, 209, 0.4);
}

.brand-title {
  font-weight: 600;
  letter-spacing: 0.03em;
  color: #1e293b;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #6b7280;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
}

.nav-link:hover {
  color: #1e293b;
  background-color: #f3f4f6;
  transform: translateY(-1px);
}

.nav-link--active {
  color: #ffffff;
  background: #00CED1;
  font-weight: 500;
}
</style>

