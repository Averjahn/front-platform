<template>
  <div class="admin-add-patient-page">
    <h1 class="page-title">Добавить пациента</h1>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="patient-form">
        <div class="form-row">
          <div class="form-group">
            <label for="email" class="form-label">Email <span class="required">*</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="patient@example.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="login" class="form-label">Логин <span class="required">*</span></label>
            <input
              id="login"
              v-model="form.login"
              type="text"
              class="form-input"
              placeholder="patient_login"
              required
              minlength="3"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password" class="form-label">Пароль <span class="required">*</span></label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Минимум 6 символов"
              required
              minlength="6"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="birthDate" class="form-label">Дата рождения</label>
            <input
              id="birthDate"
              v-model="form.birthDate"
              type="date"
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="lastName" class="form-label">Фамилия</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="form-input"
              placeholder="Иванов"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="firstName" class="form-label">Имя</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="form-input"
              placeholder="Иван"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="middleName" class="form-label">Отчество</label>
            <input
              id="middleName"
              v-model="form.middleName"
              type="text"
              class="form-input"
              placeholder="Иванович"
              :disabled="loading"
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-cancel" @click="handleCancel" :disabled="loading">
            Отмена
          </button>
          <button type="submit" class="btn btn-submit" :disabled="loading">
            {{ loading ? 'Создание...' : 'Создать пациента' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminAddPatientView',
  data() {
    return {
      form: {
        email: '',
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        middleName: '',
        birthDate: ''
      },
      loading: false,
      error: null
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.error = null;

      try {
        const payload = {
          email: this.form.email,
          login: this.form.login,
          password: this.form.password,
          ...(this.form.firstName && { firstName: this.form.firstName }),
          ...(this.form.lastName && { lastName: this.form.lastName }),
          ...(this.form.middleName && { middleName: this.form.middleName }),
          ...(this.form.birthDate && { birthDate: this.form.birthDate })
        };

        await api.post('/admin/patients', payload);
        this.$router.push('/admin/patients');
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка при создании пациента';
        console.error('Error creating patient:', err);
      } finally {
        this.loading = false;
      }
    },
    handleCancel() {
      this.$router.push('/admin/patients');
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .admin-add-patient-page */

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 30px 0;
}

.form-container {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.patient-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.required {
  color: #ef4444;
}

.form-input {
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-50);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.error-message {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ffffff;
  border-color: #6b7280;
  color: #6b7280;
}

.btn-cancel:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #4b5563;
  color: #4b5563;
}

.btn-submit {
  background: #FF8C00;
  border-color: #FF8C00;
  color: #ffffff;
}

.btn-submit:hover:not(:disabled) {
  background: #e67e00;
  border-color: #e67e00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
}

@media (max-width: 768px) {
  .admin-add-patient-page {
    padding: 20px;
  }

  .form-container {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
