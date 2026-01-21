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
  gap: 1.5rem;
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
  color: #00CED1;
  font-weight: 600;
}

.btn-secondary {
  background: #ffffff;
  border: 2px solid #ef4444;
  color: #ef4444;
  padding: 0.6rem 1.3rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
}

.btn-secondary:hover {
  background: #ef4444;
  color: #ffffff;
  transform: translateY(-1px);
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

