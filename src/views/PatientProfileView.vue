<template>
  <div class="patient-profile-page">
    <div class="profile-header">
      <h1 class="page-title">Мой профиль</h1>
      <button @click="handleLogout" class="btn btn-logout">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17L2 12M2 12L7 7M2 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Выйти
      </button>
    </div>

    <div class="profile-content">
      <!-- Left Column: Patient Info -->
      <div class="profile-left">
        <div class="profile-image-section">
          <div class="profile-image-wrapper">
            <img
              v-if="profileData?.avatarUrl"
              :src="getAvatarUrl(profileData.avatarUrl)"
              :alt="fullName"
              class="profile-image"
            />
            <div v-else class="profile-image-placeholder">
              <svg width="60" height="60" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="#9ca3af"/>
                <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="#9ca3af"/>
              </svg>
            </div>
          </div>
          <button class="edit-button" @click="editProfile">
            Редактировать данные
          </button>
        </div>

        <div class="profile-info">
          <h2 class="patient-name">{{ fullName }}</h2>
          <div class="info-item">
            <span class="info-label">Дата рождения:</span>
            <span class="info-value">{{ formattedBirthDate }}</span>
          </div>
          <div class="info-item" v-if="profileData?.trustedContact">
            <span class="info-label">Доверенный контакт:</span>
            <span class="info-value">{{ profileData.trustedContact }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Tariff Info -->
      <div class="profile-right">
        <div class="tariff-section">
          <h3 class="section-title">Текущий тариф:</h3>
          <div v-if="profileData?.tariff" class="tariff-info">
            <h4 class="tariff-name">"{{ profileData.tariff.title }}"</h4>
            <div class="tariff-payment">
              <span>Оплата: {{ formatPrice(profileData.tariff.price) }} руб/мес</span>
              <span v-if="profileData.tariff.discount > 0" class="tariff-discount">
                Ежеквартально (экономия {{ profileData.tariff.discount }}%)
              </span>
            </div>
            <div class="tariff-options">
              <h5 class="options-title">В тариф входит:</h5>
              <div
                v-for="option in profileData.tariff.options"
                :key="option.id"
                class="option-item"
              >
                <span class="option-title">{{ option.title }}</span>
                <span class="option-description">{{ option.description || 'Описание опции сервиса 1' }}</span>
              </div>
            </div>
            <div class="tariff-actions">
              <button class="btn-primary" @click="viewTariffs">
                Посмотреть другие тарифы
              </button>
              <button class="btn-outline" @click="changeTariff">
                Сменить тариф
              </button>
            </div>
          </div>
          <div v-else class="no-tariff">
            <p>Тариф не назначен</p>
            <button class="btn-primary" @click="viewTariffs">
              Выбрать тариф
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tariff Modal -->
    <TariffModal
      :is-open="showTariffModal"
      :current-tariff-id="profileData?.tariff?.id"
      @close="showTariffModal = false"
      @tariff-selected="handleTariffSelected"
    />

    <!-- Edit Profile Modal -->
    <EditProfileModal
      :is-open="showEditProfileModal"
      :profile-data="profileData"
      @close="showEditProfileModal = false"
      @profile-updated="handleProfileUpdated"
    />

    <!-- Doctor Section -->
    <div class="doctor-section">
      <h3 class="section-title">Мой лечащий врач:</h3>
      <div v-if="doctor" class="doctor-info">
        <div class="doctor-image-wrapper">
          <img
            v-if="doctor.avatarUrl"
            :src="getAvatarUrl(doctor.avatarUrl)"
            :alt="doctorName"
            class="doctor-image"
          />
          <div v-else class="doctor-image-placeholder">
            <svg width="60" height="60" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="#9ca3af"/>
              <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="#9ca3af"/>
            </svg>
          </div>
        </div>
        <div class="doctor-details">
          <h4 class="doctor-name">{{ doctorName }}</h4>
          <p class="doctor-specialty">врач-логопед</p>
          <button class="btn-primary consultation-btn" @click="requestConsultation">
            Обратиться за консультацией
          </button>
        </div>
      </div>
      <div v-else class="no-doctor">
        <p>Врач не назначен</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import api from '@/services/api';
import TariffModal from '@/components/TariffModal.vue';
import EditProfileModal from '@/components/EditProfileModal.vue';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'PatientProfileView',
  components: {
    TariffModal,
    EditProfileModal,
  },
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    return { router, auth };
  },
  data() {
    return {
      profileData: null,
      doctor: null,
      loading: false,
      error: null,
      showTariffModal: false,
    };
  },
  computed: {
    fullName() {
      if (!this.profileData?.user) return 'Загрузка...';
      const { firstName, lastName, middleName } = this.profileData.user;
      return [lastName, firstName, middleName].filter(Boolean).join(' ') || 'Пользователь';
    },
    formattedBirthDate() {
      if (!this.profileData?.birthDate) return 'Не указана';
      const date = new Date(this.profileData.birthDate);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    doctorName() {
      if (!this.doctor?.user) return '';
      const { firstName, lastName, middleName } = this.doctor.user;
      return [lastName, firstName, middleName].filter(Boolean).join(' ') || '';
    }
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
        
        // Получаем первого врача из списка
        if (this.profileData.doctors && this.profileData.doctors.length > 0) {
          const doctorRelation = this.profileData.doctors[0];
          if (doctorRelation.doctor) {
            this.doctor = doctorRelation.doctor;
          }
        }
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки профиля';
        console.error('Error loading profile:', err);
      } finally {
        this.loading = false;
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat('ru-RU').format(price);
    },
    getAvatarUrl(avatarUrl) {
      if (!avatarUrl) return '';
      if (avatarUrl.startsWith('http')) return avatarUrl;
      const apiBaseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
      return `${apiBaseUrl.replace('/api', '')}${avatarUrl}`;
    },
    editProfile() {
      this.showEditProfileModal = true;
    },
    async handleProfileUpdated() {
      // Перезагружаем профиль после обновления
      await this.loadProfile();
    },
    viewTariffs() {
      // Проверяем авторизацию перед открытием модального окна
      const user = localStorage.getItem('user');
      if (!user) {
        alert('Необходимо войти в систему для просмотра тарифов');
        this.$router.push('/login');
        return;
      }
      this.showTariffModal = true;
    },
    changeTariff() {
      // Проверяем авторизацию перед открытием модального окна
      const user = localStorage.getItem('user');
      if (!user) {
        alert('Необходимо войти в систему для смены тарифа');
        this.$router.push('/login');
        return;
      }
      this.showTariffModal = true;
    },
    async handleTariffSelected(tariffId) {
      // Перезагружаем профиль после выбора тарифа
      await this.loadProfile();
      this.showTariffModal = false;
    },
    requestConsultation() {
      // TODO: Реализовать запрос консультации
      console.log('Request consultation');
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
/* Используем общие стили из common.css для .patient-profile-page */

.profile-header {
  position: relative;
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-header .page-title {
  margin: 0;
}

.btn-logout {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* .page-title - используем общие стили из common.css */

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
  transform: translateY(-50%) translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn-logout:hover svg {
  stroke: #ffffff;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.profile-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-image-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-image-wrapper {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-tertiary);
  box-shadow: var(--shadow-sm);
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
  background: var(--color-border);
}

.edit-button {
  padding: 12px 24px;
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  width: fit-content;
}

.edit-button:hover {
  background: var(--color-accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.patient-name {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
}

.info-value {
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
}

.profile-right {
  display: flex;
  flex-direction: column;
}

.tariff-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #00CED1;
  margin: 0;
}

.tariff-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tariff-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.tariff-payment {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 16px;
  color: #1e293b;
}

.tariff-discount {
  color: #ef4444;
  font-weight: 500;
}

.tariff-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.options-title {
  font-size: 18px;
  font-weight: 600;
  color: #00CED1;
  margin: 0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #e0f7fa;
  border-radius: 8px;
}

.option-title {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  min-width: 150px;
}

.option-description {
  font-size: 14px;
  color: #6b7280;
  flex: 1;
}

.tariff-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--color-teal);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--color-teal-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-outline {
  padding: 12px 24px;
  background: transparent;
  color: var(--color-teal);
  border: 2px solid var(--color-teal);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-outline:hover {
  background: var(--color-teal);
  color: var(--color-white);
  transform: translateY(-1px);
}

.no-tariff {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.no-tariff p {
  margin: 0;
  font-size: 16px;
}

.no-tariff .btn-primary {
  width: 100%;
  max-width: 300px;
}

.no-doctor {
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

.doctor-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 40px;
  border-top: 1px solid #e5e7eb;
}

.doctor-info {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.doctor-image-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.doctor-image,
.doctor-image-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.doctor-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.doctor-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.doctor-name {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.doctor-specialty {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.consultation-btn {
  width: fit-content;
  margin-top: 8px;
}

@media (max-width: 968px) {
  .profile-header {
    position: relative;
    padding-bottom: 60px;
  }

  .btn-logout {
    position: absolute;
    right: 0;
    top: auto;
    bottom: 0;
    transform: none;
  }

  .btn-logout:hover {
    transform: translateY(-1px);
  }

  .profile-content {
    grid-template-columns: 1fr;
  }

  .tariff-actions {
    flex-direction: column;
  }

  .doctor-info {
    flex-direction: column;
  }
}
</style>
