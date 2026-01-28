<template>
  <div class="patient-assignments-page">
    <h1 class="page-title">Назначения врача</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="assignments-container">
      <div v-if="assignments.length === 0" class="no-assignments">
        <p>У вас пока нет назначений от врача</p>
      </div>

      <div v-else>
        <!-- Текущее назначение (самое новое) -->
        <div v-if="currentAssignment" class="current-assignment">
          <div class="assignment-date current-date">
            {{ formatDate(currentAssignment.date) }}
          </div>
          <div class="assignment-recommendation">
            {{ currentAssignment.recommendation }}
          </div>
        </div>

        <!-- Разделительная линия -->
        <div v-if="currentAssignment && previousAssignments.length > 0" class="divider"></div>

        <!-- Предыдущие назначения -->
        <div v-if="previousAssignments.length > 0" class="previous-assignments">
          <h2 class="previous-title">Предыдущие назначения</h2>
          <div
            v-for="assignment in previousAssignments"
            :key="assignment.id"
            class="previous-assignment"
          >
            <div class="assignment-date previous-date">
              {{ formatDate(assignment.date) }}
            </div>
            <div class="assignment-recommendation">
              {{ assignment.recommendation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PatientAssignmentsView',
  data() {
    return {
      assignments: [],
      loading: false,
      error: null
    };
  },
  computed: {
    currentAssignment() {
      // Самое новое назначение - это текущее
      return this.assignments.length > 0 ? this.assignments[0] : null;
    },
    previousAssignments() {
      // Все остальные назначения - предыдущие
      return this.assignments.slice(1);
    }
  },
  mounted() {
    this.loadAssignments();
  },
  methods: {
    async loadAssignments() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/patient/assignments');
        this.assignments = response.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки назначений';
        console.error('Error loading assignments:', err);
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
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .patient-assignments-page */

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

.assignments-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.no-assignments {
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-tertiary);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin: var(--spacing-lg) 0;
}

.current-assignment {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.assignment-date {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.current-date {
  color: #ef4444;
}

.previous-date {
  color: #6b7280;
}

.assignment-recommendation {
  font-size: 16px;
  line-height: 1.6;
  color: #1e293b;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 30px 0;
}

.previous-assignments {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.previous-title {
  font-size: 20px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.previous-assignment {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .patient-assignments-page {
    padding: 20px;
  }

  .current-assignment,
  .previous-assignment {
    padding: 20px;
  }

}
</style>
