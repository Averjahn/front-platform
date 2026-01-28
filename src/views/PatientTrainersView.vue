<template>
  <div class="patient-trainers-page">
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
          <button v-if="selectedSection" @click="closeTrainersList" class="close-button" aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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
  name: 'PatientTrainersView',
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
      assignments: [], // Все назначения пациента
      loading: false,
      loadingTrainers: false,
      loadingToken: false,
      loadingAssignment: false,
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
      const apiBaseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
      
      // Ищем назначение для этого конкретного тренажера
      // Структура: assignment.trainer.id
      const assignmentForTrainer = this.assignments.find(
        a => a.trainer && a.trainer.id === this.selectedTrainer.id
      );
      
      // Используем assignmentId для этого тренажера, если есть
      // Иначе используем первое назначение или 'preview'
      const assignmentId = assignmentForTrainer?.id || 
                          (this.assignments.length > 0 ? this.assignments[0].id : null) || 
                          'preview';
      
      try {
        const url = new URL(baseUrl);
        
        if (this.user?.id) {
          url.searchParams.set('userId', this.user.id);
        }
        
        url.searchParams.set('token', this.iframeToken);
        url.searchParams.set('assignmentId', assignmentId);
        url.searchParams.set('apiBaseUrl', apiBaseUrl);
        
        return url.toString();
      } catch (e) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        const params = [];
        
        if (this.user?.id) {
          params.push(`userId=${this.user.id}`);
        }
        
        params.push(`token=${this.iframeToken}`);
        params.push(`assignmentId=${assignmentId}`);
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
    
    // Загружаем назначения пациента
    await this.loadAssignments();
    
    // Загружаем разделы
    await this.loadSections();
    
    // По умолчанию загружаем первую секцию
    if (this.sections.length > 0) {
      this.selectSection(this.sections[0]);
    }
  },
  methods: {
    async loadAssignments() {
      if (!this.user?.id) return;
      
      this.loadingAssignment = true;
      try {
        // Получаем назначения пациента (включая тренажеры)
        // Используем /patient/trainers, который возвращает полную информацию о назначениях
        const response = await api.get('/patient/trainers');
        if (response.data && Array.isArray(response.data)) {
          this.assignments = response.data;
        }
      } catch (err) {
        console.error('Error loading assignments:', err);
        // Не блокируем работу, если не удалось загрузить назначения
        this.assignments = [];
      } finally {
        this.loadingAssignment = false;
      }
    },
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
    closeTrainersList() {
      this.selectedSection = null;
      this.trainers = [];
    },
    formatTrainerNumber(section, index) {
      return `${section}.${index}`;
    },
    async openTrainer(trainer) {
      this.selectedTrainer = trainer;
      this.iframeToken = null;
      this.loadingToken = true;
      this.error = null;
      
      try {
        // Получаем токен для iframe
        const response = await api.post('/auth/iframe-token', {}, {
          timeout: 15000,
          withCredentials: true
        });
        
        if (response.data && response.data.token) {
          this.iframeToken = response.data.token;
          document.body.style.overflow = 'hidden';
        } else {
          throw new Error('Токен не получен от сервера');
        }
      } catch (err) {
        console.error('Error loading iframe token:', err);
        
        let errorMessage = 'Ошибка загрузки токена для iframe';
        
        if (err?.code === 'ECONNREFUSED' || err?.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен';
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
      document.body.style.overflow = '';
    },
    onIframeLoad() {
      if (this.$refs.trainerIframe && this.iframeToken && this.user) {
        const iframeWindow = this.$refs.trainerIframe.contentWindow;
        if (iframeWindow) {
          try {
            const url = new URL(this.iframeUrl);
            const apiBaseUrl = url.searchParams.get('apiBaseUrl') || api.defaults.baseURL;
            const assignmentId = url.searchParams.get('assignmentId') || 'preview';
            
            iframeWindow.postMessage({
              type: 'INIT_PARAMS',
              token: this.iframeToken,
              userId: this.user.id,
              assignmentId: assignmentId,
              apiBaseUrl: apiBaseUrl
            }, '*');
          } catch (e) {
            console.warn('Не удалось отправить параметры через postMessage:', e);
          }
        }
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .patient-trainers-page */

/* .page-title - используем общие стили из common.css */

.loading,
.error-message {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-tertiary);
}

.error-message {
  color: var(--color-error-dark);
  background: var(--color-error-50);
  border: 1px solid var(--color-error-light);
  border-radius: var(--radius-md);
}

.trainers-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* Left Panel: Sections */
.sections-panel {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  height: fit-content;
}

.sections-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.sections-subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: 1.5;
}

.sections-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.section-item {
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.section-item:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
}

.section-item-active {
  background: var(--color-teal-light);
  border-color: var(--color-teal-light);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.section-item-active:hover {
  background: var(--color-teal-dark);
  border-color: var(--color-teal-dark);
}

/* Right Panel: Trainers List */
.trainers-panel {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.trainers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
}

.trainers-list-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  padding: 0;
}

.close-button:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
  color: var(--color-text-primary);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.trainers-panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-message {
  font-size: 16px;
  color: var(--color-text-tertiary);
  text-align: center;
  margin: 0;
}

.loading-trainers {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  color: var(--color-text-tertiary);
}

.loading-trainers p {
  font-size: 16px;
  margin: 0;
}

.no-trainers {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  color: var(--color-text-tertiary);
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
  gap: var(--spacing-md);
}

.trainer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: pointer;
}

.trainer-item:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-teal-light);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.trainer-number {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-error);
  min-width: 80px;
}

.trainer-title {
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.5;
  flex: 1;
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
  padding: var(--spacing-md);
}

.iframe-container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  max-height: 900px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.close-iframe-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  z-index: 1001;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.close-iframe-button:hover {
  background: var(--color-bg-primary);
  border-color: var(--color-error);
  color: var(--color-error);
  transform: scale(1.05);
}

.iframe-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-text-tertiary);
  font-size: 16px;
}

.trainer-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

@media (max-width: 1200px) {
  .trainers-content {
    grid-template-columns: 250px 1fr;
    gap: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .patient-trainers-page {
    padding: var(--spacing-md) var(--spacing-md);
  }


  .trainers-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .sections-panel {
    padding: var(--spacing-md);
  }

  .trainers-panel {
    padding: var(--spacing-md);
  }

  .trainers-list-title {
    font-size: 20px;
  }

  .trainer-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .trainer-number {
    font-size: 14px;
    min-width: 60px;
  }

  .trainer-title {
    font-size: 14px;
  }

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
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    width: 36px;
    height: 36px;
  }
}
</style>
