<template>
  <div class="patient-diary-page">
    <h1 class="page-title">Мой дневник</h1>

    <!-- Previous Entry Section -->
    <div v-if="lastEntry" class="previous-entry">
      <div class="entry-date-section">
        <h2 class="entry-date">{{ formattedDate(lastEntry.date) }}</h2>
        <div class="entry-summary">
          <div class="summary-item">
            <span class="summary-label">Погода:</span>
            <span class="summary-value">{{ lastEntry.weather }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Настроение:</span>
            <span class="summary-value">{{ lastEntry.mood }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Самочувствие:</span>
            <span class="summary-value">{{ lastEntry.wellbeing }}</span>
          </div>
        </div>
      </div>
      <div class="entry-content">
        <p class="entry-text">{{ lastEntry.content }}</p>
      </div>
    </div>

    <!-- New Entry Section -->
    <div class="new-entry-section">
      <h2 class="section-title">Новая запись в дневнике:</h2>
      
      <div class="new-entry-form">
        <div class="form-left">
          <div class="form-group">
            <label class="form-label">Какая сегодня погода?</label>
            <select v-model="newEntry.weather" class="form-select">
              <option value="Ясно">Ясно</option>
              <option value="Облачно">Облачно</option>
              <option value="Дождь">Дождь</option>
              <option value="Снег">Снег</option>
              <option value="Туман">Туман</option>
              <option value="Ветрено">Ветрено</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Какое сегодня настроение?</label>
            <select v-model="newEntry.mood" class="form-select">
              <option value="Бодрое">Бодрое</option>
              <option value="Спокойное">Спокойное</option>
              <option value="Подавленное">Подавленное</option>
              <option value="Тревожное">Тревожное</option>
              <option value="Радостное">Радостное</option>
              <option value="Усталое">Усталое</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Какое сегодня самочувствие?</label>
            <select v-model="newEntry.wellbeing" class="form-select">
              <option value="Хорошее">Хорошее</option>
              <option value="Нормальное">Нормальное</option>
              <option value="Плохое">Плохое</option>
              <option value="Отличное">Отличное</option>
              <option value="Слабое">Слабое</option>
            </select>
          </div>
        </div>

        <div class="form-right">
          <label class="form-label">Хочу записать в дневник:</label>
          <textarea
            v-model="newEntry.content"
            class="form-textarea"
            placeholder="Опишите свой день..."
            rows="10"
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button 
          class="save-button" 
          @click="saveEntry"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PatientDiaryView',
  data() {
    return {
      entries: [],
      lastEntry: null,
      newEntry: {
        weather: 'Ясно',
        mood: 'Бодрое',
        wellbeing: 'Хорошее',
        content: ''
      },
      loading: false,
      error: null,
      success: null
    };
  },
  computed: {
    isFormValid() {
      return this.newEntry.content.trim().length > 0;
    }
  },
  async mounted() {
    await this.loadEntries();
  },
  methods: {
    async loadEntries() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/patient/diary');
        this.entries = response.data;
        if (this.entries.length > 0) {
          this.lastEntry = this.entries[0];
        }
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки записей';
        console.error('Error loading entries:', err);
      } finally {
        this.loading = false;
      }
    },
    async saveEntry() {
      if (!this.isFormValid) {
        this.error = 'Пожалуйста, заполните текст записи';
        return;
      }

      this.loading = true;
      this.error = null;
      this.success = null;

      try {
        const response = await api.post('/patient/diary', this.newEntry);
        
        // Добавляем новую запись в начало списка
        this.entries.unshift(response.data);
        this.lastEntry = response.data;

        // Очищаем форму
        this.newEntry = {
          weather: 'Ясно',
          mood: 'Бодрое',
          wellbeing: 'Хорошее',
          content: ''
        };

        this.success = 'Запись успешно сохранена';
        setTimeout(() => {
          this.success = null;
        }, 3000);
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка сохранения записи';
        console.error('Error saving entry:', err);
      } finally {
        this.loading = false;
      }
    },
    formattedDate(dateString) {
      const date = new Date(dateString);
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .patient-diary-page */

/* Previous Entry Section */
.previous-entry {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
}

.entry-date-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.entry-date {
  font-size: 24px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #ef4444;
}

.entry-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.entry-content {
  display: flex;
  align-items: flex-start;
}

.entry-text {
  font-size: 16px;
  line-height: 1.6;
  color: #1e293b;
  margin: 0;
  text-align: justify;
}

/* New Entry Section */
.new-entry-section {
  background: var(--color-teal-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.new-entry-form {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.form-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231e293b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.form-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.form-textarea {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  line-height: 1.6;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.form-textarea::placeholder {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.save-button {
  padding: 14px 32px;
  background: #1e293b;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #ffffff;
  background: rgba(239, 68, 68, 0.3);
  padding: 12px;
  border-radius: 6px;
  margin: 0;
  font-size: 14px;
}

.success-message {
  color: #ffffff;
  background: rgba(34, 197, 94, 0.3);
  padding: 12px;
  border-radius: 6px;
  margin: 0;
  font-size: 14px;
}

@media (max-width: 968px) {
  .previous-entry {
    grid-template-columns: 1fr;
  }

  .new-entry-form {
    grid-template-columns: 1fr;
  }
}
</style>
