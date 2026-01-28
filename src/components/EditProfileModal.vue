<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Редактирование профиля</h2>
        <button class="modal-close" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <form @submit.prevent="handleSubmit" class="edit-profile-form">
          <!-- Avatar Upload -->
          <div class="form-section">
            <label class="form-section-label">Фотография профиля</label>
            <div class="avatar-upload-section">
              <div class="avatar-preview">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Preview"
                  class="avatar-preview-image"
                />
                <div v-else-if="currentAvatar" class="avatar-preview-image">
                  <img :src="getAvatarUrl(currentAvatar)" alt="Current avatar" />
                </div>
                <div v-else class="avatar-placeholder">
                  <svg width="60" height="60" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="#9ca3af"/>
                    <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="#9ca3af"/>
                  </svg>
                </div>
              </div>
              <div class="avatar-upload-controls">
                <label for="avatar-upload" class="btn-upload">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3V17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  {{ avatarFile ? 'Изменить фото' : 'Загрузить фото' }}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                  class="avatar-input"
                />
                <button
                  v-if="avatarPreview || currentAvatar"
                  type="button"
                  @click="removeAvatar"
                  class="btn-remove-avatar"
                >
                  Удалить фото
                </button>
              </div>
            </div>
          </div>

          <!-- Personal Info -->
          <div class="form-section">
            <label class="form-section-label">Личные данные</label>
            
            <div class="form-group">
              <label for="lastName" class="form-label">Фамилия *</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                class="form-input"
                placeholder="Введите фамилию"
                required
              />
            </div>

            <div class="form-group">
              <label for="firstName" class="form-label">Имя *</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                class="form-input"
                placeholder="Введите имя"
                required
              />
            </div>

            <div class="form-group">
              <label for="middleName" class="form-label">Отчество</label>
              <input
                id="middleName"
                v-model="formData.middleName"
                type="text"
                class="form-input"
                placeholder="Введите отчество"
              />
            </div>

            <div class="form-group">
              <label for="birthDate" class="form-label">Дата рождения</label>
              <input
                id="birthDate"
                v-model="formData.birthDate"
                type="date"
                class="form-input"
                :max="maxDate"
              />
            </div>

            <div class="form-group">
              <label for="trustedContact" class="form-label">Доверенный контакт</label>
              <input
                id="trustedContact"
                v-model="formData.trustedContact"
                type="text"
                class="form-input"
                placeholder="+7 999 123-45-67"
              />
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal" :disabled="saving">Отмена</button>
        <button
          class="btn-confirm"
          @click="handleSubmit"
          :disabled="saving || !isFormValid"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'EditProfileModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    profileData: {
      type: Object,
      default: null,
    },
  },
  emits: ['close', 'profile-updated'],
  data() {
    return {
      formData: {
        firstName: '',
        lastName: '',
        middleName: '',
        birthDate: '',
        trustedContact: '',
      },
      avatarFile: null,
      avatarPreview: null,
      currentAvatar: null,
      saving: false,
      error: null,
      success: null,
    };
  },
  computed: {
    isFormValid() {
      return this.formData.firstName && this.formData.lastName;
    },
    maxDate() {
      const today = new Date();
      today.setFullYear(today.getFullYear() - 1); // Минимум 1 год
      return today.toISOString().split('T')[0];
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal && this.profileData) {
        this.initForm();
      } else {
        this.resetForm();
      }
    },
    profileData: {
      handler(newVal) {
        if (newVal && this.isOpen) {
          this.initForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    initForm() {
      if (!this.profileData) return;

      const user = this.profileData.user || {};
      this.formData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        middleName: user.middleName || '',
        birthDate: this.profileData.birthDate
          ? new Date(this.profileData.birthDate).toISOString().split('T')[0]
          : '',
        trustedContact: this.profileData.trustedContact || '',
      };
      this.currentAvatar = this.profileData.avatarUrl;
      this.avatarPreview = null;
      this.avatarFile = null;
      this.avatarRemoved = false;
      this.error = null;
      this.success = null;
    },
    resetForm() {
      this.formData = {
        firstName: '',
        lastName: '',
        middleName: '',
        birthDate: '',
        trustedContact: '',
      };
      this.avatarFile = null;
      this.avatarPreview = null;
      this.currentAvatar = null;
      this.avatarRemoved = false;
      this.error = null;
      this.success = null;
    },
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Размер файла не должен превышать 5MB';
        event.target.value = '';
        return;
      }

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        this.error = 'Файл должен быть изображением';
        event.target.value = '';
        return;
      }

      this.avatarFile = file;
      this.avatarRemoved = false; // Сбрасываем флаг удаления при выборе нового файла
      this.error = null;

      // Создаем preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeAvatar() {
      this.avatarFile = null;
      this.avatarPreview = null;
      this.currentAvatar = null;
      this.avatarRemoved = true;
      const input = document.getElementById('avatar-upload');
      if (input) input.value = '';
    },
    getAvatarUrl(avatarUrl) {
      if (!avatarUrl) return '';
      if (avatarUrl.startsWith('http')) return avatarUrl;
      const apiBaseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
      return `${apiBaseUrl.replace('/api', '')}${avatarUrl}`;
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        this.error = 'Пожалуйста, заполните обязательные поля (Имя и Фамилия)';
        return;
      }

      this.saving = true;
      this.error = null;
      this.success = null;

      try {
        // Сначала загружаем аватар, если он был выбран
        if (this.avatarFile) {
          const formData = new FormData();
          formData.append('avatar', this.avatarFile);

          try {
            await api.put('/patient/profile/avatar', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (err) {
            console.error('Error uploading avatar:', err);
            this.error = err?.response?.data?.message || 'Ошибка при загрузке аватара';
            this.saving = false;
            return;
          }
        }

        // Обновляем данные профиля
        const updateData = {
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          middleName: this.formData.middleName || null,
          birthDate: this.formData.birthDate || null,
          trustedContact: this.formData.trustedContact || null,
        };

        // Если аватар был удален
        if (this.avatarRemoved) {
          updateData.avatarUrl = null;
        }

        await api.put('/patient/profile', updateData);

        this.success = 'Профиль успешно обновлен';
        this.$emit('profile-updated');

        // Закрываем модальное окно через 1 секунду
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка при сохранении профиля';
        console.error('Error updating profile:', err);
      } finally {
        this.saving = false;
      }
    },
    closeModal() {
      this.resetForm();
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  box-sizing: border-box;
}

.modal-container {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--color-text-primary);
}

.modal-content {
  padding: var(--spacing-xl);
  overflow-y: auto;
  flex: 1;
}

.error-message {
  padding: var(--spacing-md);
  background: var(--color-error-50);
  border: 1px solid var(--color-error-light);
  border-radius: var(--radius-md);
  color: var(--color-error-dark);
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
}

.success-message {
  padding: var(--spacing-md);
  background: var(--color-success-50);
  border: 1px solid var(--color-success-light);
  border-radius: var(--radius-md);
  color: var(--color-success-dark);
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
}

.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-section-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-bg-tertiary);
}

.avatar-upload-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.avatar-input {
  display: none;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-teal);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-upload:hover {
  background: var(--color-teal-dark);
  transform: translateY(-1px);
}

.btn-remove-avatar {
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-remove-avatar:hover {
  background: var(--color-error-50);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--spacing-md);
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
  border-color: var(--color-teal);
  box-shadow: 0 0 0 3px var(--color-teal-50);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  padding: var(--spacing-md) var(--spacing-xl);
  background: transparent;
  color: var(--color-text-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--color-bg-secondary);
  border-color: var(--color-text-tertiary);
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-teal);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-confirm:hover:not(:disabled) {
  background: var(--color-teal-dark);
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--spacing-lg);
  }

  .avatar-preview {
    width: 120px;
    height: 120px;
  }
}
</style>
