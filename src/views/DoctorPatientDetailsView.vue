<template>
  <div class="patient-details-page">
    <h1 class="page-title">Подробности по пациенту</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error && patient" class="patient-content">
      <!-- Patient Info Section -->
      <div class="patient-info-section">
        <div class="patient-photo">
          <img
            v-if="patient.avatarUrl"
            :src="patient.avatarUrl"
            :alt="getPatientName()"
            class="photo-image"
          />
          <div v-else class="photo-placeholder">
            <svg width="80" height="80" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="#9ca3af"/>
              <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="#9ca3af"/>
            </svg>
          </div>
        </div>
        <div class="patient-details">
          <h2 class="patient-name">{{ getPatientName() }}</h2>
          <div class="detail-item">
            <span class="detail-label">Текущий тариф:</span>
            <span class="detail-value">{{ patient.tariff?.title || 'Не назначен' }}</span>
          </div>
          <div class="detail-item" v-if="patient.birthDate">
            <span class="detail-label">Дата рождения:</span>
            <span class="detail-value">{{ formatDate(patient.birthDate) }}</span>
          </div>
          <div class="detail-item" v-if="patient.trustedContact">
            <span class="detail-label">Доверенный контакт:</span>
            <span class="detail-value">{{ patient.trustedContact }}</span>
          </div>
        </div>
      </div>

      <!-- Test Results Table -->
      <div class="test-results-section">
        <h3 class="section-title">Результаты тестов</h3>
        <div class="table-container">
          <table class="test-results-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Время</th>
                <th>Категория</th>
                <th>Раздел</th>
                <th>Подраздел</th>
                <th>Задание</th>
                <th>Верных</th>
                <th>Неверных</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(session, index) in testSessions" :key="session.id" :class="{ 'row-even': index % 2 === 1 }">
                <td>{{ formatDate(session.startedAt) }}</td>
                <td>{{ formatTime(session.startedAt) }}</td>
                <td>{{ getCategory(session) }}</td>
                <td>{{ getSection(session) }}</td>
                <td>{{ getSubsection(session) }}</td>
                <td>{{ getTask(session) }}</td>
                <td>{{ session.correct || '-' }}</td>
                <td>{{ session.incorrect || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="testSessions.length === 0" class="no-results">
            <p>Нет результатов тестов</p>
          </div>
        </div>
      </div>

      <!-- Recommendations and Notes -->
      <div class="recommendations-notes-section">
        <!-- Left: Recommendations -->
        <div class="recommendations-panel">
          <h3 class="panel-title recommendations-title">Назначения и рекомендации</h3>
          
          <!-- Current Recommendation -->
          <div v-if="currentRecommendation" class="current-entry">
            <div class="entry-header">
              <span class="entry-date">{{ formatDate(currentRecommendation.date) }}</span>
              <div class="entry-actions">
                <button class="action-btn edit-btn" @click="editRecommendation(currentRecommendation)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9447 1.58933C12.1731 1.4936 12.4173 1.44336 12.6663 1.44336C12.9154 1.44336 13.1596 1.4936 13.388 1.58933C13.6164 1.68506 13.8243 1.82445 13.9997 2.00001C14.1752 2.17557 14.3146 2.38347 14.4103 2.61187C14.5061 2.84027 14.5563 3.08443 14.5563 3.33334C14.5563 3.58226 14.5061 3.82642 14.4103 4.05482C14.3146 4.28322 14.1752 4.49112 13.9997 4.66668L5.33301 13.3333L1.33301 14.6667L2.66634 10.6667L11.333 2.00001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn delete-btn" @click="deleteRecommendation(currentRecommendation.id)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4H3.33333H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.33301 4V2.66667C5.33301 2.31305 5.47349 1.97391 5.72354 1.72386C5.97359 1.47381 6.31272 1.33334 6.66634 1.33334H9.33301C9.68663 1.33334 10.0258 1.47381 10.2758 1.72386C10.5259 1.97391 10.6663 2.31305 10.6663 2.66667V4M12.6663 4V13.3333C12.6663 13.687 12.5259 14.0261 12.2758 14.2761C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97359 14.5262 3.72354 14.2761C3.47349 14.0261 3.33301 13.687 3.33301 13.3333V4H12.6663Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <p class="entry-text">{{ currentRecommendation.text }}</p>
          </div>

          <div v-if="currentRecommendation && previousRecommendations.length > 0" class="separator"></div>

          <!-- Previous Recommendations -->
          <div v-if="previousRecommendations.length > 0" class="previous-entries">
            <h4 class="previous-title">Предыдущие рекомендации</h4>
            <div v-for="rec in previousRecommendations" :key="rec.id" class="previous-entry">
              <span class="entry-date">{{ formatDate(rec.date) }}</span>
              <p class="entry-text">{{ rec.text }}</p>
            </div>
          </div>

          <!-- New Recommendation Form -->
          <div class="new-entry-form">
            <h4 class="form-title recommendations-title">Новое назначение и рекомендация пациенту</h4>
            <textarea
              v-model="newRecommendation"
              class="form-textarea"
              placeholder="Введите рекомендацию..."
              rows="4"
            ></textarea>
            <button class="form-button recommendations-button" @click="addRecommendation" :disabled="!newRecommendation.trim()">
              Добавить
            </button>
          </div>
        </div>

        <!-- Right: Notes -->
        <div class="notes-panel">
          <h3 class="panel-title notes-title">Заметки по пациенту</h3>
          
          <!-- Current Note -->
          <div v-if="currentNote" class="current-entry">
            <div class="entry-header">
              <span class="entry-date">{{ formatDate(currentNote.date) }}</span>
              <div class="entry-actions">
                <button class="action-btn edit-btn" @click="editNote(currentNote)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9447 1.58933C12.1731 1.4936 12.4173 1.44336 12.6663 1.44336C12.9154 1.44336 13.1596 1.4936 13.388 1.58933C13.6164 1.68506 13.8243 1.82445 13.9997 2.00001C14.1752 2.17557 14.3146 2.38347 14.4103 2.61187C14.5061 2.84027 14.5563 3.08443 14.5563 3.33334C14.5563 3.58226 14.5061 3.82642 14.4103 4.05482C14.3146 4.28322 14.1752 4.49112 13.9997 4.66668L5.33301 13.3333L1.33301 14.6667L2.66634 10.6667L11.333 2.00001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn delete-btn" @click="deleteNote(currentNote.id)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4H3.33333H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.33301 4V2.66667C5.33301 2.31305 5.47349 1.97391 5.72354 1.72386C5.97359 1.47381 6.31272 1.33334 6.66634 1.33334H9.33301C9.68663 1.33334 10.0258 1.47381 10.2758 1.72386C10.5259 1.97391 10.6663 2.31305 10.6663 2.66667V4M12.6663 4V13.3333C12.6663 13.687 12.5259 14.0261 12.2758 14.2761C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97359 14.5262 3.72354 14.2761C3.47349 14.0261 3.33301 13.687 3.33301 13.3333V4H12.6663Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <p class="entry-text">{{ currentNote.text }}</p>
          </div>

          <div v-if="currentNote && previousNotes.length > 0" class="separator"></div>

          <!-- Previous Notes -->
          <div v-if="previousNotes.length > 0" class="previous-entries">
            <h4 class="previous-title">Предыдущие заметки</h4>
            <div v-for="note in previousNotes" :key="note.id" class="previous-entry">
              <span class="entry-date">{{ formatDate(note.date) }}</span>
              <p class="entry-text">{{ note.text }}</p>
            </div>
          </div>

          <!-- New Note Form -->
          <div class="new-entry-form">
            <h4 class="form-title notes-title">Новая заметка</h4>
            <textarea
              v-model="newNote"
              class="form-textarea"
              placeholder="Введите заметку..."
              rows="4"
            ></textarea>
            <button class="form-button notes-button" @click="addNote" :disabled="!newNote.trim()">
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'DoctorPatientDetailsView',
  data() {
    return {
      patient: null,
      loading: false,
      error: null,
      testSessions: [],
      recommendations: [],
      notes: [],
      newRecommendation: '',
      newNote: '',
      editingRecommendation: null,
      editingNote: null
    };
  },
  computed: {
    currentRecommendation() {
      return this.recommendations.find(r => r.isCurrent) || this.recommendations[0] || null;
    },
    previousRecommendations() {
      const current = this.currentRecommendation;
      return this.recommendations.filter(r => r.id !== current?.id).slice(0, 2);
    },
    currentNote() {
      return this.notes.find(n => n.isCurrent) || this.notes[0] || null;
    },
    previousNotes() {
      const current = this.currentNote;
      return this.notes.filter(n => n.id !== current?.id).slice(0, 2);
    }
  },
  async mounted() {
    await this.loadPatientData();
  },
  methods: {
    async loadPatientData() {
      this.loading = true;
      this.error = null;
      const patientId = this.$route.params.id;

      try {
        const response = await api.get(`/doctor/patient/${patientId}/data`);
        this.patient = response.data;
        
        // Собираем все сессии из назначений
        this.testSessions = [];
        if (this.patient.assignments) {
          this.patient.assignments.forEach(assignment => {
            if (assignment.sessions) {
              assignment.sessions.forEach(session => {
                this.testSessions.push({
                  ...session,
                  assignment: assignment
                });
              });
            }
          });
        }
        
        // Сортируем по дате (новые первые)
        this.testSessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
        
        // Загружаем рекомендации и заметки из medicalData
        this.loadRecommendationsAndNotes();
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки данных пациента';
        console.error('Error loading patient data:', err);
      } finally {
        this.loading = false;
      }
    },
    loadRecommendationsAndNotes() {
      if (!this.patient.medicalData) return;
      
      this.recommendations = [];
      this.notes = [];
      
      this.patient.medicalData.forEach(item => {
        if (item.type === 'recommendation') {
          this.recommendations.push({
            id: item.id,
            date: item.createdAt,
            text: item.data.text || item.data.content || '',
            isCurrent: item.data.isCurrent !== false
          });
        } else if (item.type === 'note') {
          this.notes.push({
            id: item.id,
            date: item.createdAt,
            text: item.data.text || item.data.content || '',
            isCurrent: item.data.isCurrent !== false
          });
        }
      });
      
      // Сортируем по дате
      this.recommendations.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    getPatientName() {
      if (!this.patient?.user) return 'Неизвестно';
      const { lastName, firstName, middleName } = this.patient.user;
      return [lastName, firstName, middleName].filter(Boolean).join(' ') || 'Не указано';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getCategory(session) {
      return session.assignment?.trainer?.section?.split('.')[0] || 'Тесты';
    },
    getSection(session) {
      const section = session.assignment?.trainer?.section;
      if (!section) return '-';
      // Парсим секцию типа "1.1" или "1.2"
      const parts = section.split('.');
      if (parts.length >= 2) {
        const sectionMap = {
          '1': 'Известные ряды понятий',
          '2': 'Фразы и предложения, знакомые с детства'
        };
        return sectionMap[parts[0]] || section;
      }
      return section;
    },
    getSubsection(session) {
      const trainer = session.assignment?.trainer;
      if (!trainer) return '-';
      // Используем описание тренажёра как подраздел
      return trainer.description || trainer.title || '-';
    },
    getTask(session) {
      // Генерируем ID задания на основе тренажёра и сессии
      const trainerId = session.assignment?.trainer?.id?.substring(0, 3) || '000';
      const sessionNum = this.testSessions.filter(s => s.assignment?.trainer?.id === session.assignment?.trainer?.id).indexOf(session) + 1;
      return `${trainerId}-${sessionNum}`;
    },
    async addRecommendation() {
      if (!this.newRecommendation.trim()) return;
      
      try {
        await api.post(`/doctor/patient/${this.patient.id}/medical-data`, {
          type: 'recommendation',
          data: {
            text: this.newRecommendation,
            isCurrent: true
          }
        });
        this.newRecommendation = '';
        await this.loadPatientData();
      } catch (err) {
        console.error('Error adding recommendation:', err);
        alert('Ошибка при добавлении рекомендации');
      }
    },
    async addNote() {
      if (!this.newNote.trim()) return;
      
      try {
        await api.post(`/doctor/patient/${this.patient.id}/medical-data`, {
          type: 'note',
          data: {
            text: this.newNote,
            isCurrent: true
          }
        });
        this.newNote = '';
        await this.loadPatientData();
      } catch (err) {
        console.error('Error adding note:', err);
        alert('Ошибка при добавлении заметки');
      }
    },
    editRecommendation(rec) {
      this.editingRecommendation = rec;
      this.newRecommendation = rec.text;
    },
    editNote(note) {
      this.editingNote = note;
      this.newNote = note.text;
    },
    async deleteRecommendation(id) {
      if (!confirm('Удалить эту рекомендацию?')) return;
      
      try {
        await api.delete(`/doctor/patient/${this.patient.id}/medical-data/${id}`);
        await this.loadPatientData();
      } catch (err) {
        console.error('Error deleting recommendation:', err);
        alert('Ошибка при удалении рекомендации');
      }
    },
    async deleteNote(id) {
      if (!confirm('Удалить эту заметку?')) return;
      
      try {
        await api.delete(`/doctor/patient/${this.patient.id}/medical-data/${id}`);
        await this.loadPatientData();
      } catch (err) {
        console.error('Error deleting note:', err);
        alert('Ошибка при удалении заметки');
      }
    }
  }
};
</script>

<style scoped>
.patient-details-page {
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

.patient-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Patient Info Section */
.patient-info-section {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  padding: 30px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.patient-photo {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.patient-details {
  flex: 1;
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

.detail-item {
  display: flex;
  gap: 12px;
}

.detail-label {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  min-width: 180px;
}

.detail-value {
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
}

/* Test Results Section */
.test-results-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.table-container {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.test-results-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  table-layout: auto;
}

.test-results-table thead {
  background: #00CED1;
}

.test-results-table th {
  padding: 16px 18px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  font-size: 15px;
  letter-spacing: 0.3px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.test-results-table th:first-child {
  padding-left: 24px;
}

.test-results-table th:last-child {
  padding-right: 24px;
}

.test-results-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.test-results-table tbody tr:last-child {
  border-bottom: none;
}

.test-results-table tbody tr:hover {
  background: #f0fdfd;
}

.test-results-table tbody tr.row-even {
  background: #f9fafb;
}

.test-results-table tbody tr.row-even:hover {
  background: #f0fdfd;
}

.test-results-table td {
  padding: 16px 18px;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.5;
}

.test-results-table td:first-child {
  padding-left: 24px;
}

.test-results-table td:last-child {
  padding-right: 24px;
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

/* Recommendations and Notes Section */
.recommendations-notes-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.recommendations-panel,
.notes-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.recommendations-title {
  color: #ef4444;
}

.notes-title {
  color: #00CED1;
}

.current-entry {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entry-date {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.entry-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.edit-btn {
  color: #FF8C00;
}

.edit-btn:hover {
  background: rgba(255, 140, 0, 0.1);
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.entry-text {
  margin: 0;
  color: #1e293b;
  line-height: 1.6;
}

.separator {
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
}

.previous-entries {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.previous-title {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.previous-entry {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.previous-entry .entry-date {
  font-size: 12px;
  color: #9ca3af;
}

.previous-entry .entry-text {
  font-size: 14px;
  color: #6b7280;
}

.new-entry-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  background: #ffffff;
  color: #1e293b;
}

.form-textarea:focus {
  outline: none;
  border-color: #00CED1;
  box-shadow: 0 0 0 3px rgba(0, 206, 209, 0.1);
}

.form-button {
  padding: 10px 20px;
  border: 2px solid;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.form-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recommendations-button {
  color: #ef4444;
  border-color: #ef4444;
}

.recommendations-button:hover:not(:disabled) {
  background: #ef4444;
  color: #ffffff;
}

.notes-button {
  color: #00CED1;
  border-color: #00CED1;
}

.notes-button:hover:not(:disabled) {
  background: #00CED1;
  color: #ffffff;
}

@media (max-width: 1200px) {
  .recommendations-notes-section {
    grid-template-columns: 1fr;
  }

  .test-results-table th,
  .test-results-table td {
    padding: 14px 16px;
    font-size: 14px;
  }

  .test-results-table th:first-child,
  .test-results-table td:first-child {
    padding-left: 20px;
  }

  .test-results-table th:last-child,
  .test-results-table td:last-child {
    padding-right: 20px;
  }
}

@media (max-width: 768px) {
  .patient-details-page {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .patient-info-section {
    flex-direction: column;
    padding: 20px;
  }

  .patient-photo {
    width: 150px;
    height: 150px;
  }

  .test-results-table th,
  .test-results-table td {
    padding: 10px 12px;
    font-size: 13px;
  }

  .test-results-table th {
    white-space: normal;
  }
}
</style>
