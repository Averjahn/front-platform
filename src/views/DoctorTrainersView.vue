<template>
  <div class="doctor-trainers-page">
    <h1 class="page-title">Каталог заданий</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="trainers-content">
      <!-- Left Panel: Sections -->
      <div class="sections-panel">
        <h2 class="sections-title">1. Макеты тренажеров</h2>
        <p class="sections-subtitle">Тренажеры в подразделе {{ selectedSection || '1.1. Тренажеры' }}</p>
        
        <ul v-if="sections.length > 0" class="sections-list">
          <li 
            v-for="section in sections" 
            :key="section"
            @click="selectSection(section)"
            class="section-item"
            :class="{ 'section-item-active': selectedSection === section }"
          >
            {{ section }}. Тренажеры
          </li>
        </ul>
      </div>

      <!-- Right Panel: Trainers List -->
      <div v-if="selectedSection" class="trainers-panel">
        <div class="trainers-header">
          <h3 class="trainers-list-title">{{ selectedSection }}. Тренажеры</h3>
        </div>
        
        <div v-if="loadingTrainers" class="loading-trainers">
          <p>Загрузка тренажеров...</p>
        </div>

        <div v-else-if="trainers.length === 0" class="no-trainers">
          <p>Нет тренажеров в этом разделе</p>
        </div>

        <ul v-else class="trainers-list">
          <li 
            v-for="(trainer, index) in trainers" 
            :key="trainer.id" 
            @click="openTrainer(trainer)"
            class="trainer-item"
          >
            <span class="trainer-number">{{ formatTrainerNumber(trainer.section, index + 1) }}</span>
            <span class="trainer-title">{{ trainer.title }}</span>
          </li>
        </ul>
      </div>

      <div v-else class="trainers-panel trainers-panel-empty">
        <p class="empty-message">Выберите раздел слева для просмотра тренажеров</p>
      </div>
    </div>

    <!-- Iframe Modal -->
    <div v-if="selectedTrainer" class="iframe-modal" @click.self="closeTrainer">
      <div class="iframe-container">
        <button @click="closeTrainer" class="close-iframe-button" aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div v-if="loadingToken" class="iframe-loading">
          <p>Загрузка...</p>
        </div>
        <iframe 
          v-else-if="iframeUrl"
          ref="trainerIframe"
          :src="iframeUrl" 
          class="trainer-iframe"
          frameborder="0"
          allowfullscreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          referrerpolicy="no-referrer-when-downgrade"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'DoctorTrainersView',
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      sections: [],
      trainers: [],
      selectedSection: null,
      selectedTrainer: null,
      iframeToken: null,
      loading: false,
      loadingTrainers: false,
      loadingToken: false,
      error: null,
      trainerIframe: null
    };
  },
  computed: {
    user() {
      return this.auth.state.user;
    },
    iframeUrl() {
      if (!this.selectedTrainer || !this.iframeToken) return '';
      
      const baseUrl = this.selectedTrainer.iframeUrl;
      
      // Базовый URL API берём из axios-инстанса (учитывает VITE_API_BASE_URL, туннели и т.п.)
      // Если вдруг там ничего нет, по умолчанию используем локальный backend.
      const apiBaseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
      
      try {
        // Пытаемся создать URL объект
        const url = new URL(baseUrl);
        
        // Добавляем userId если есть пользователь
        if (this.user?.id) {
          url.searchParams.set('userId', this.user.id);
        }
        
        // Добавляем токен
        url.searchParams.set('token', this.iframeToken);
        
        // Для режима просмотра врачом передаём специальный assignmentId
        url.searchParams.set('assignmentId', 'preview');
        
        // Добавляем apiBaseUrl для v0 проекта
        url.searchParams.set('apiBaseUrl', apiBaseUrl);
        
        return url.toString();
      } catch (e) {
        // Если baseUrl не является валидным URL, возвращаем как есть
        // и добавляем параметры вручную
        const separator = baseUrl.includes('?') ? '&' : '?';
        const params = [];
        
        if (this.user?.id) {
          params.push(`userId=${this.user.id}`);
        }
        
        params.push(`token=${this.iframeToken}`);
        params.push('assignmentId=preview');
        params.push(`apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`);
        
        return `${baseUrl}${separator}${params.join('&')}`;
      }
    }
  },
  async mounted() {
    // Загружаем пользователя из localStorage если его нет в store
    if (!this.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          this.auth.setUser(parsed);
        } catch (e) {
          console.error('Ошибка при загрузке данных пользователя:', e);
        }
      }
    }
    
    await this.loadSections();
    // По умолчанию загружаем первую секцию
    if (this.sections.length > 0) {
      this.selectSection(this.sections[0]);
    }
  },
  methods: {
    async loadSections() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/trainers/sections');
        this.sections = response.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки разделов';
        console.error('Error loading sections:', err);
      } finally {
        this.loading = false;
      }
    },
    async selectSection(section) {
      this.selectedSection = section;
      this.loadingTrainers = true;
      this.trainers = [];
      
      try {
        const response = await api.get(`/trainers?section=${section}`);
        this.trainers = response.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки тренажеров';
        console.error('Error loading trainers:', err);
        this.trainers = [];
      } finally {
        this.loadingTrainers = false;
      }
    },
    formatTrainerNumber(section, index) {
      // Форматируем номер как "1.1.1", "1.1.2" и т.д.
      return `${section}.${index}`;
    },
    async openTrainer(trainer) {
      this.selectedTrainer = trainer;
      this.iframeToken = null;
      this.loadingToken = true;
      this.error = null;
      
      try {
        console.log('Requesting iframe token...');
        console.log('API base URL:', api.defaults.baseURL);
        console.log('User:', this.user);
        
        // Получаем токен для iframe
        const response = await api.post('/auth/iframe-token', {}, {
          timeout: 15000, // Увеличиваем таймаут
          withCredentials: true
        });
        
        console.log('Iframe token response:', response);
        
        if (response.data && response.data.token) {
          this.iframeToken = response.data.token;
          console.log('Iframe token received:', this.iframeToken.substring(0, 20) + '...');
          // Блокируем прокрутку страницы когда открыт модальный
          document.body.style.overflow = 'hidden';
        } else {
          throw new Error('Токен не получен от сервера');
        }
      } catch (err) {
        console.error('Error loading iframe token:', err);
        console.error('Error details:', {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          message: err?.message,
          code: err?.code,
          config: {
            url: err?.config?.url,
            method: err?.config?.method,
            baseURL: err?.config?.baseURL
          }
        });
        
        let errorMessage = 'Ошибка загрузки токена для iframe';
        
        if (err?.code === 'ECONNREFUSED' || err?.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:3000';
        } else if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
          errorMessage = 'Превышено время ожидания ответа от сервера';
        } else if (err?.response?.status === 401) {
          errorMessage = 'Ошибка авторизации. Пожалуйста, войдите заново.';
        } else if (err?.response?.status === 404) {
          errorMessage = 'Эндпоинт не найден. Убедитесь, что бэкенд запущен и перезапущен после изменений.';
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
        this.selectedTrainer = null;
        alert(`Ошибка: ${errorMessage}`);
      } finally {
        this.loadingToken = false;
      }
    },
    closeTrainer() {
      this.selectedTrainer = null;
      this.iframeToken = null;
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
    },
    onIframeLoad() {
      // Отправляем параметры через postMessage после загрузки iframe
      if (this.$refs.trainerIframe && this.iframeToken && this.user) {
        const iframeWindow = this.$refs.trainerIframe.contentWindow;
        if (iframeWindow) {
          // Получаем apiBaseUrl из iframeUrl
          try {
            const url = new URL(this.iframeUrl);
            const apiBaseUrl = url.searchParams.get('apiBaseUrl') || api.defaults.baseURL;
            
            iframeWindow.postMessage({
              type: 'INIT_PARAMS',
              token: this.iframeToken,
              userId: this.user.id,
              assignmentId: 'preview',
              apiBaseUrl: apiBaseUrl
            }, '*'); // В production замени '*' на конкретный origin v0 проекта
          } catch (e) {
            console.warn('Не удалось отправить параметры через postMessage:', e);
          }
        }
      }
    }
  },
  beforeUnmount() {
    // Восстанавливаем прокрутку при размонтировании компонента
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
.doctor-trainers-page {
  max-width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
  background: #ffffff;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #00CED1;
  text-align: center;
  margin: 0 0 40px 0;
}

.loading,
.error-message {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
}

.trainers-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Left Panel: Sections */
.sections-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.sections-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.sections-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.sections-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.section-item-active {
  background: #00CED1;
  border-color: #00CED1;
  color: #ffffff;
  font-weight: 600;
}

.section-item-active:hover {
  background: #00a8b0;
  border-color: #00a8b0;
}

/* Right Panel: Trainers List */
.trainers-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.trainers-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.trainers-list-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.trainers-panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-message {
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.loading-trainers {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-trainers p {
  font-size: 16px;
  margin: 0;
}

.no-trainers {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-trainers p {
  font-size: 16px;
  margin: 0;
}

.trainers-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trainer-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.trainer-item:hover {
  background: #f9fafb;
  border-color: #00CED1;
  box-shadow: 0 2px 4px rgba(0, 206, 209, 0.1);
  transform: translateY(-1px);
}

.trainer-number {
  font-size: 15px;
  font-weight: 600;
  color: #ef4444;
  min-width: 80px;
}

.trainer-title {
  font-size: 15px;
  color: #1e293b;
  line-height: 1.5;
  flex: 1;
}

@media (max-width: 1200px) {
  .trainers-content {
    grid-template-columns: 250px 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .doctor-trainers-page {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .trainers-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .sections-panel {
    padding: 20px;
  }

  .trainers-panel {
    padding: 20px;
  }

  .trainers-list-title {
    font-size: 20px;
  }

  .trainer-item {
    padding: 12px 16px;
  }

  .trainer-number {
    font-size: 14px;
    min-width: 60px;
  }

  .trainer-title {
    font-size: 14px;
  }
}

/* Iframe Modal */
.iframe-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.iframe-container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  max-height: 900px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.close-iframe-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #1e293b;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.close-iframe-button:hover {
  background: #ffffff;
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.05);
}

.iframe-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #6b7280;
  font-size: 16px;
}

.trainer-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

@media (max-width: 768px) {
  .iframe-modal {
    padding: 0;
  }

  .iframe-container {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .close-iframe-button {
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
  }
}
</style>
