<template>
  <div class="admin-profile-page">
    <div class="profile-header">
      <h1 class="page-title">Мой профиль</h1>
      <button @click="handleLogout" class="btn btn-logout">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17L2 12M2 12L7 7M2 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Выйти
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error && user" class="profile-container">
      <div class="profile-card">
        <div class="profile-main">
          <div class="profile-image-section">
            <div class="profile-image-wrapper">
              <img
                v-if="user.avatarUrl"
                :src="user.avatarUrl"
                :alt="fullName"
                class="profile-image"
              />
              <div v-else class="profile-image-placeholder">
                <svg width="80" height="80" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="#9ca3af"/>
                  <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="#9ca3af"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="profile-info-section">
            <h2 class="profile-name">{{ fullName }}</h2>
            <div class="profile-role">{{ roleLabel }}</div>
          </div>
        </div>
        <div class="profile-details">
          <h3 class="details-title">Личная информация</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ user.email || 'Не указано' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Фамилия:</span>
              <span class="info-value">{{ user.lastName || 'Не указано' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Имя:</span>
              <span class="info-value">{{ user.firstName || 'Не указано' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Отчество:</span>
              <span class="info-value">{{ user.middleName || 'Не указано' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Логин:</span>
              <span class="info-value">{{ user.login || 'Не указано' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Дата регистрации:</span>
              <span class="info-value">{{ formattedCreatedAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'AdminProfileView',
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    return { router, auth };
  },
  data() {
    return {
      loading: false,
      error: null
    };
  },
  computed: {
    user() {
      return this.auth.state.user;
    },
    fullName() {
      if (!this.user) return 'Не указано';
      const parts = [this.user.lastName, this.user.firstName, this.user.middleName].filter(Boolean);
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
    },
    formattedCreatedAt() {
      if (!this.user?.createdAt) return 'Не указано';
      const date = new Date(this.user.createdAt);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
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
    } else {
      // Загружаем актуальную информацию о профиле
      this.loadProfile();
    }
  },
  methods: {
    async loadProfile() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/users/me');
        this.auth.setUser(response.data);
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки профиля';
        console.error('Error loading profile:', err);
      } finally {
        this.loading = false;
      }
    },
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
/* Используем общие стили из common.css для .admin-profile-page */

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #ffffff;
  border: 2px solid #ef4444;
  color: #ef4444;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout svg {
  stroke: #ef4444;
}

.btn-logout:hover {
  background: #ef4444;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn-logout:hover svg {
  stroke: #ffffff;
}

.loading,
.error-message {
  padding: 20px;
  text-align: center;
  font-size: 16px;
}

.error-message {
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 30px;
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.profile-image-section {
  flex-shrink: 0;
}

.profile-image-wrapper {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
}

.profile-image,
.profile-image-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.profile-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.profile-role {
  font-size: 18px;
  font-weight: 500;
  color: #6b7280;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #FF8C00;
  color: #ffffff;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

@media (max-width: 768px) {
  .admin-profile-page {
    padding: 20px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-logout {
    width: 100%;
    justify-content: center;
  }

  .profile-card {
    padding: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
