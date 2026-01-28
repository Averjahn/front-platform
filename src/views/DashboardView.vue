<template>
  <section class="view">
    <div class="dashboard-header">
      <h1 class="view-title">Панель управления</h1>
      <button @click="handleLogout" class="btn btn-secondary">
        Выйти
      </button>
    </div>

    <div class="card">
      <h2>Добро пожаловать!</h2>
      <p v-if="user" class="login-as">
        Вы вошли как <strong>{{ user.role }}</strong>
      </p>
      <div v-if="user" class="user-info">
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p v-if="user.firstName || user.lastName">
          <strong>Имя:</strong> {{ fullName }}
        </p>
        <p v-if="user.role">
          <strong>Роль:</strong> {{ roleLabel }}
        </p>
      </div>
    </div>
  </section>
</template>

<script>
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    return { router, auth };
  },
  computed: {
    user() {
      return this.auth.state.user;
    },
    fullName() {
      if (!this.user) return '';
      const parts = [this.user.firstName, this.user.middleName, this.user.lastName].filter(Boolean);
      return parts.join(' ') || 'Не указано';
    },
    roleLabel() {
      if (!this.user?.role) return 'Не указано';
      const roles = {
        ADMIN: 'Администратор',
        DOCTOR: 'Врач',
        PATIENT: 'Пациент'
      };
      return roles[this.user.role] || this.user.role;
    }
  },
  mounted() {
    if (!this.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          this.auth.setUser(parsed);
        } catch (e) {
          console.error('Ошибка при загрузке данных пользователя:', e);
          this.handleLogout();
          return;
        }
      }
    }

    if (!this.user) {
      this.router.push('/login');
    }
  },
  methods: {
    async handleLogout() {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.error('Ошибка при выходе:', err);
      } finally {
        this.auth.clearUser();
        localStorage.removeItem('user');
        this.router.push('/login');
      }
    }
  }
};
</script>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-title {
  font-size: 2rem;
  margin: 0;
  color: var(--color-teal-light);
  font-weight: 600;
}

.btn-secondary {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-error);
  color: var(--color-error);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-base);
  font-size: 15px;
}

.btn-secondary:hover {
  background: var(--color-error);
  color: var(--color-text-inverse);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 600;
}

.login-as {
  margin: 0 0 1rem;
  color: #6b7280;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info p {
  margin: 0;
  color: #1e293b;
}

.user-info strong {
  color: #00CED1;
  margin-right: 0.5rem;
  font-weight: 600;
}
</style>

