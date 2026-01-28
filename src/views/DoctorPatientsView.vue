<template>
  <div class="doctor-patients-page">
    <h1 class="page-title">Пациенты</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="patients-table-container">
      <table class="patients-table">
        <thead>
          <tr>
            <th>№</th>
            <th>ФИО</th>
            <th>Тариф</th>
            <th>Заметки</th>
            <th>Дата последней активности</th>
            <th>Средняя оценка</th>
            <th>Подробности по пациенту</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(patient, index) in patients" :key="patient.id" :class="{ 'row-even': index % 2 === 1 }">
            <td class="number-cell">{{ index + 1 }}</td>
            <td class="name-cell">{{ getPatientName(patient) }}</td>
            <td class="tariff-cell">{{ patient.tariff?.title || 'Не назначен' }}</td>
            <td class="notes-cell">
              <span v-if="getRecommendedTrainers(patient).length > 0">
                Рекомендованы упражнения: {{ getRecommendedTrainers(patient).join(', ') }}
              </span>
              <span v-else class="no-notes">Нет заметок</span>
            </td>
            <td class="date-cell">{{ formatDate(getLastActivityDate(patient)) }}</td>
            <td class="rating-cell">
              <div class="rating-indicator" :class="getRatingClass(getAverageRating(patient))"></div>
            </td>
            <td class="details-cell">
              <button class="details-button" @click="viewPatientDetails(patient.id)">
                Подробности
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="patients.length === 0" class="no-patients">
        <p>У вас пока нет назначенных пациентов</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'DoctorPatientsView',
  data() {
    return {
      patients: [],
      loading: false,
      error: null
    };
  },
  async mounted() {
    await this.loadPatients();
  },
  methods: {
    async loadPatients() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/doctor/patients');
        this.patients = response.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки списка пациентов';
        console.error('Error loading patients:', err);
      } finally {
        this.loading = false;
      }
    },
    getPatientName(patient) {
      if (!patient.user) return 'Неизвестно';
      const { lastName, firstName, middleName } = patient.user;
      return [lastName, firstName, middleName].filter(Boolean).join(' ') || 'Не указано';
    },
    getRecommendedTrainers(patient) {
      // Получаем названия тренажёров из назначений
      if (!patient.assignments || patient.assignments.length === 0) return [];
      
      const trainers = patient.assignments
        .map(a => {
          if (!a.trainer) return null;
          // Форматируем как "Раздел/Подраздел" или просто название
          const section = a.trainer.section || '';
          const title = a.trainer.title || '';
          if (section && title) {
            return `${section} ${title}`;
          }
          return title || section;
        })
        .filter(Boolean)
        .slice(0, 2); // Показываем максимум 2
      
      return trainers;
    },
    getLastActivityDate(patient) {
      // Ищем последнюю активность в сессиях тестов
      if (!patient.assignments || patient.assignments.length === 0) return null;
      
      let lastDate = null;
      patient.assignments.forEach(assignment => {
        if (assignment.sessions && assignment.sessions.length > 0) {
          const session = assignment.sessions[0];
          const sessionDate = new Date(session.startedAt);
          if (!lastDate || sessionDate > lastDate) {
            lastDate = sessionDate;
          }
        }
      });
      
      return lastDate;
    },
    getAverageRating(patient) {
      // Вычисляем среднюю оценку на основе результатов тестов
      if (!patient.assignments || patient.assignments.length === 0) return 0;
      
      let totalCorrect = 0;
      let totalQuestions = 0;
      
      patient.assignments.forEach(assignment => {
        if (assignment.sessions && assignment.sessions.length > 0) {
          assignment.sessions.forEach(session => {
            totalCorrect += session.correct || 0;
            totalQuestions += (session.correct || 0) + (session.incorrect || 0);
          });
        }
      });
      
      if (totalQuestions === 0) return 0;
      return (totalCorrect / totalQuestions) * 100;
    },
    getRatingClass(rating) {
      if (rating >= 80) return 'rating-excellent';
      if (rating >= 60) return 'rating-good';
      if (rating >= 40) return 'rating-average';
      return 'rating-poor';
    },
    formatDate(date) {
      if (!date) return 'Нет активности';
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    viewPatientDetails(patientId) {
      this.$router.push(`/doctor/patient/${patientId}`);
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .doctor-patients-page */

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

.patients-table-container {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  table-layout: auto;
}

.patients-table thead {
  background: #00CED1;
}

.patients-table th {
  padding: 18px 20px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  font-size: 15px;
  letter-spacing: 0.3px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.patients-table th:first-child {
  padding-left: 24px;
}

.patients-table th:last-child {
  padding-right: 24px;
}

.patients-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.patients-table tbody tr:last-child {
  border-bottom: none;
}

.patients-table tbody tr:hover {
  background: #f0fdfd;
}

.patients-table tbody tr.row-even {
  background: #f9fafb;
}

.patients-table tbody tr.row-even:hover {
  background: #f0fdfd;
}

.patients-table td {
  padding: 18px 20px;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.5;
}

.patients-table td:first-child {
  padding-left: 24px;
}

.patients-table td:last-child {
  padding-right: 24px;
}

.number-cell {
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  width: 60px;
}

.name-cell {
  font-weight: 600;
  color: #1e293b;
}

.tariff-cell {
  color: #6b7280;
  font-weight: 500;
}

.notes-cell {
  color: #6b7280;
  line-height: 1.6;
  max-width: 400px;
}

.no-notes {
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
}

.date-cell {
  color: #6b7280;
  white-space: nowrap;
  font-weight: 500;
}

.rating-cell {
  text-align: center;
}

.rating-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin: 0 auto;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rating-indicator.rating-excellent {
  background: #22c55e;
}

.rating-indicator.rating-good {
  background: #84cc16;
}

.rating-indicator.rating-average {
  background: #eab308;
}

.rating-indicator.rating-poor {
  background: #ef4444;
}

.details-cell {
  text-align: center;
}

.details-button {
  padding: 10px 20px;
  background: #00CED1;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 206, 209, 0.2);
}

.details-button:hover {
  background: #00a8b0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 206, 209, 0.3);
}

.details-button:active {
  transform: translateY(0);
}

.no-patients {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-patients p {
  font-size: 18px;
  margin: 0;
}

@media (max-width: 1200px) {
  .patients-table th,
  .patients-table td {
    padding: 14px 16px;
    font-size: 14px;
  }

  .patients-table th:first-child,
  .patients-table td:first-child {
    padding-left: 20px;
  }

  .patients-table th:last-child,
  .patients-table td:last-child {
    padding-right: 20px;
  }

  .notes-cell {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .doctor-patients-page {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .patients-table th,
  .patients-table td {
    padding: 12px 10px;
    font-size: 13px;
  }

  .details-button {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>
