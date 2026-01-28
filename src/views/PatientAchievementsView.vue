<template>
  <div class="patient-achievements-page">
    <h1 class="page-title">Мои достижения</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="achievements-container">
      <div v-if="achievements.length === 0" class="no-achievements">
        <p>У вас пока нет завершенных тестов</p>
      </div>

      <div v-else class="achievements-table-container">
        <table class="achievements-table">
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
            <tr
              v-for="(achievement, index) in achievements"
              :key="achievement.id"
              :class="{
                'row-even': index % 2 === 1,
                'row-low-score': isLowScore(achievement)
              }"
            >
              <td class="date-cell">{{ formatDate(achievement.date) }}</td>
              <td class="time-cell">{{ achievement.time }}</td>
              <td class="category-cell">{{ achievement.category }}</td>
              <td class="section-cell">{{ achievement.section }}</td>
              <td class="subsection-cell">{{ achievement.subsection }}</td>
              <td class="task-cell">{{ achievement.taskId }}</td>
              <td class="correct-cell">
                {{ achievement.correct !== null ? achievement.correct : '-' }}
              </td>
              <td class="incorrect-cell">
                {{ achievement.incorrect !== null ? achievement.incorrect : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PatientAchievementsView',
  data() {
    return {
      achievements: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadAchievements();
  },
  methods: {
    async loadAchievements() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/patient/achievements');
        this.achievements = response.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки достижений';
        console.error('Error loading achievements:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    isLowScore(achievement) {
      // Выделяем строки с низким результатом (когда неверных больше верных)
      if (achievement.correct === null || achievement.incorrect === null) {
        return false;
      }
      const total = achievement.correct + achievement.incorrect;
      if (total === 0) return false;
      const correctRatio = achievement.correct / total;
      // Выделяем, если правильных ответов меньше 50%
      return correctRatio < 0.5;
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .patient-achievements-page */

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

.achievements-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.no-achievements {
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-tertiary);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin: var(--spacing-lg) 0;
}

.achievements-table-container {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.achievements-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  min-width: 1000px;
}

.achievements-table thead {
  background: var(--color-bg-secondary);
}

.achievements-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.achievements-table th:first-child {
  padding-left: 24px;
}

.achievements-table th:last-child {
  padding-right: 24px;
}

.achievements-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.achievements-table tbody tr:last-child {
  border-bottom: none;
}

.achievements-table tbody tr:hover {
  background: #f0fdfd;
}

.achievements-table tbody tr.row-even {
  background: #f9fafb;
}

.achievements-table tbody tr.row-even:hover {
  background: #f0fdfd;
}

.achievements-table tbody tr.row-low-score {
  background: #fef2f2;
}

.achievements-table tbody tr.row-low-score:hover {
  background: #fee2e2;
}

.achievements-table tbody tr.row-low-score.row-even {
  background: #fee2e2;
}

.achievements-table tbody tr.row-low-score.row-even:hover {
  background: #fecaca;
}

.achievements-table td {
  padding: 18px 20px;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.5;
}

.achievements-table td:first-child {
  padding-left: 24px;
}

.achievements-table td:last-child {
  padding-right: 24px;
}

.date-cell,
.time-cell {
  color: #6b7280;
  white-space: nowrap;
  font-weight: 500;
}

.category-cell {
  font-weight: 600;
  color: #1e293b;
}

.section-cell {
  color: #475569;
  font-weight: 500;
}

.subsection-cell {
  color: #64748b;
}

.task-cell {
  color: #00CED1;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.correct-cell {
  color: #10b981;
  font-weight: 600;
  text-align: center;
}

.incorrect-cell {
  color: #ef4444;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 1200px) {
  .achievements-table {
    font-size: 14px;
  }
  
  .achievements-table th,
  .achievements-table td {
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .patient-achievements-page {
    padding: 20px;
  }
  
  .achievements-table-container {
    overflow-x: auto;
  }
}
</style>
