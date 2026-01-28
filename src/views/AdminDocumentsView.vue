<template>
  <div class="admin-documents-page">
    <h1 class="page-title">Документы по пациенту</h1>
    <p class="page-subtitle">Выбрать пациента, чтобы открыть его документы:</p>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="documents-container">
      <div v-if="patients.length === 0" class="no-patients">
        <p>Нет пациентов</p>
      </div>

      <div v-else class="patients-table-container">
        <table class="patients-table">
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Дата рождения</th>
              <th>Дата начала лечения</th>
              <th>Дата последнего приема</th>
              <th>Лечащий врач</th>
              <th>Тариф</th>
              <th>Документы пациента</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(patient, index) in patients" :key="patient.id" :class="{ 'row-even': index % 2 === 1 }">
              <td class="number-cell">{{ index + 1 }}</td>
              <td class="name-cell">{{ getPatientName(patient) }}</td>
              <td class="birthdate-cell">{{ formatDate(patient.birthDate) }}</td>
              <td class="treatment-start-cell">{{ formatDate(getTreatmentStartDate(patient)) }}</td>
              <td class="last-appointment-cell">{{ formatDate(getLastAppointmentDate(patient)) }}</td>
              <td class="doctor-cell">{{ getDoctorName(patient) }}</td>
              <td class="tariff-cell">{{ patient.tariff?.title || 'Не назначен' }}</td>
              <td class="documents-cell">
                <button class="documents-button" @click="viewPatientDocuments(patient.id)">
                  Документы
                </button>
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
  name: 'AdminDocumentsView',
  data() {
    return {
      patients: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadPatients();
  },
  methods: {
    async loadPatients() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/patients');
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
    getDoctorName(patient) {
      if (patient.doctors && Array.isArray(patient.doctors) && patient.doctors.length > 0) {
        const doctor = patient.doctors[0].doctor;
        if (doctor && doctor.user) {
          const parts = [doctor.user.lastName, doctor.user.firstName, doctor.user.middleName].filter(Boolean);
          return parts.join(' ') || 'Не указано';
        }
      }
      return 'Не назначен';
    },
    getTreatmentStartDate(patient) {
      if (patient.assignments && Array.isArray(patient.assignments) && patient.assignments.length > 0) {
        const dates = patient.assignments.map(a => new Date(a.createdAt)).sort((a, b) => a - b);
        return dates[0];
      }
      return patient.createdAt || patient.user?.createdAt;
    },
    getLastAppointmentDate(patient) {
      if (patient.assignments && Array.isArray(patient.assignments) && patient.assignments.length > 0) {
        const allSessions = [];
        patient.assignments.forEach(assignment => {
          if (assignment.sessions && Array.isArray(assignment.sessions) && assignment.sessions.length > 0) {
            assignment.sessions.forEach(session => {
              if (session.startedAt) {
                allSessions.push(new Date(session.startedAt));
              }
            });
          }
        });
        if (allSessions.length > 0) {
          const sorted = allSessions.sort((a, b) => b - a);
          return sorted[0];
        }
      }
      return null;
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
    viewPatientDocuments(patientId) {
      this.$router.push(`/admin/documents/patient/${patientId}`);
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .admin-documents-page */

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 30px 0;
}

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

.documents-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.no-patients {
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-tertiary);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin: var(--spacing-lg) 0;
}

.patients-table-container {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  min-width: 1000px;
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
  white-space: nowrap;
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

.birthdate-cell,
.treatment-start-cell,
.last-appointment-cell {
  color: #6b7280;
  white-space: nowrap;
  font-weight: 500;
}

.doctor-cell {
  color: #6b7280;
  font-weight: 500;
}

.tariff-cell {
  color: #6b7280;
  font-weight: 500;
}

.documents-cell {
  text-align: center;
}

.documents-button {
  padding: 10px 20px;
  background: #ffffff;
  color: #00CED1;
  border: 2px solid #00CED1;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.documents-button:hover {
  background: #f0fdfd;
  border-color: #00a8b0;
  color: #00a8b0;
}

@media (max-width: 768px) {
  .admin-documents-page {
    padding: 20px;
  }

  .info-card {
    padding: 24px;
  }
}
</style>
