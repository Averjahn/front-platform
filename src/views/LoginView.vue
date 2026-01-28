<template>
  <div class="login-page">
    <!-- Header -->
    <header class="login-header">
      <div class="header-left">
        <div class="logo">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Hands -->
            <path d="M10 35 Q10 25 15 20 Q20 15 25 20 Q25 15 30 12 Q35 15 35 20 Q40 15 45 20 Q50 25 50 35 Q50 45 45 50 Q40 45 35 50 Q30 55 25 50 Q20 45 15 50 Q10 45 10 35 Z" fill="#00CED1" opacity="0.3"/>
            <!-- Brain -->
            <path d="M20 25 Q25 18 30 20 Q35 18 40 25 Q40 32 35 38 Q30 42 25 38 Q20 32 20 25 Z" fill="#00CED1"/>
            <!-- Brain details -->
            <path d="M25 25 Q27 23 30 25 Q33 23 35 25" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <path d="M25 30 Q27 28 30 30 Q33 28 35 30" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <ellipse cx="27" cy="27" rx="2" ry="2.5" fill="#ffffff"/>
            <ellipse cx="33" cy="27" rx="2" ry="2.5" fill="#ffffff"/>
          </svg>
        </div>
        <div class="header-text">
          <div class="center-name-wrapper">
            <h1 class="center-name">ЦЕНТР ПАТОЛОГИИ РЕЧИ</h1>
            <h2 class="center-name-sub">И НЕЙРОРЕАБИЛИТАЦИИ</h2>
          </div>
          <p class="center-description">Система обучения и реабилитации<br>пациентов с нарушением речи</p>
        </div>
      </div>
      <div class="header-right">
        <a href="tel:+79999999999" class="phone">+7 999 999-99-99</a>
      </div>
    </header>

    <!-- Main Content -->
    <main class="login-main">
      <div class="login-container">
        <h2 class="login-title">Вход в систему обучения и реабилитации пациентов с нарушением речи</h2>
        
        <!-- Role Tabs -->
        <div class="role-tabs">
          <button
            v-for="role in roles"
            :key="role.value"
            @click="selectedRole = role.value"
            class="role-tab"
            :class="{
              'role-tab-active': selectedRole === role.value,
              [`role-tab-${role.value.toLowerCase()}`]: selectedRole === role.value
            }"
          >
            {{ role.label }}
          </button>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form" :style="getFormStyle()">
          <div class="form-group">
            <label for="email" class="form-label">Логин</label>
            <input
              id="email"
              v-model="form.email"
              type="text"
              class="form-input"
              placeholder="Введите логин"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Пароль</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Введите пароль"
              required
              :disabled="loading"
            />
          </div>

          <p v-if="error" class="error-message">
            {{ error }}
          </p>

          <button type="submit" class="login-button" :disabled="loading">
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const auth = useAuthStore();
    return { router, route, auth };
  },
  data() {
    return {
      selectedRole: 'PATIENT',
      roles: [
        { value: 'PATIENT', label: 'Пациент' },
        { value: 'DOCTOR', label: 'Врач' },
        { value: 'ADMIN', label: 'Администратор' }
      ],
      form: {
        email: '',
        password: ''
      },
      loading: false,
      error: null,
      // Тестовые данные для автозаполнения
      testCredentials: {
        PATIENT: {
          email: 'patient1@example.com',
          password: 'password123'
        },
        DOCTOR: {
          email: 'doctor@example.com',
          password: 'password123'
        },
        ADMIN: {
          email: 'admin@example.com',
          password: 'password123'
        }
      }
    };
  },
  mounted() {
    // Добавляем обработчик клавиатуры
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    // Удаляем обработчик при размонтировании компонента
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      // Проверяем комбинацию Shift + Q
      if (event.shiftKey && event.key === 'Q') {
        event.preventDefault();
        this.fillTestCredentials();
      }
    },
    fillTestCredentials() {
      // Заполняем логин и пароль в зависимости от выбранного таба
      const credentials = this.testCredentials[this.selectedRole];
      if (credentials) {
        this.form.email = credentials.email;
        this.form.password = credentials.password;
        // Показываем краткое уведомление (опционально)
        console.log(`Заполнены данные для ${this.selectedRole}`);
      }
    },
    getFormStyle() {
      const colors = {
        PATIENT: { bg: '#00CED1' },
        DOCTOR: { bg: '#4169E1' },
        ADMIN: { bg: '#FF8C00' }
      };
      const bgColor = colors[this.selectedRole] || colors.PATIENT;
      return {
        backgroundColor: bgColor.bg
      };
    },
    async handleLogin() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/login', {
          email: this.form.email,
          password: this.form.password
        });

        const user = response.data.user;

        this.auth.setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        // Перенаправляем в зависимости от роли
        let redirect = this.route.query.redirect;
        if (!redirect) {
          if (user.role === 'PATIENT') {
            redirect = '/patient/profile';
          } else if (user.role === 'DOCTOR') {
            redirect = '/doctor/patients';
          } else if (user.role === 'ADMIN') {
            redirect = '/dashboard';
          } else {
            redirect = '/dashboard';
          }
        }
        this.router.push(redirect);
      } catch (err) {
        this.error = err?.response?.data?.message || 'Неверный логин или пароль';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Header */
.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  /* background: var(--gradient-primary); */
  /* border-bottom: 1px solid rgba(0, 206, 209, 0.2); */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.logo {
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.center-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.center-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.center-name-sub {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.center-description {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.header-right {
  flex-shrink: 0;
  margin-left: 24px;
}

.phone {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-teal-light);
  text-decoration: none;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.6);
}

.phone:hover {
  color: var(--color-teal-dark);
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

/* Main Content */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  min-height: calc(100vh - 200px);
}

.login-container {
  width: 100%;
  max-width: 500px;
  text-align: center;
  padding: var(--spacing-lg);
  box-sizing: border-box;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 30px 0;
  line-height: 1.4;
}

/* Role Tabs */
.role-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  background: #f3f4f6;
  /* border-radius: 0 8px; */
  /* padding: 4px; */
  overflow: hidden;
}

.role-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  /* border-radius: 6px; */
  position: relative;
}

.role-tab:hover {
  color: #1e293b;
  background: rgba(255, 255, 255, 0.5);
}

.role-tab-active {
  color: #fff;
  font-weight: 600;
}

.role-tab-active.role-tab-patient {
  background: #00CED1;
}

.role-tab-active.role-tab-doctor {
  background: #4169E1;
}

.role-tab-active.role-tab-admin {
  background: #FF8C00;
}

/* Login Form */
.login-form {
  background: #00CED1;
  padding: 30px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin: 0 0 16px 0;
  padding: 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  text-align: left;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: #1e293b;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  background: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .login-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .header-left {
    flex-direction: column;
    text-align: center;
  }

  .center-name {
    font-size: 14px;
    max-width: 100%;
  }

  .login-title {
    font-size: 20px;
  }

  .role-tab {
    font-size: 14px;
    padding: 10px 12px;
  }

  .login-form {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .login-title {
    font-size: 18px;
  }

  .role-tabs {
    flex-direction: column;
    gap: 4px;
  }

  .role-tab {
    border-radius: 6px;
  }
}
</style>
