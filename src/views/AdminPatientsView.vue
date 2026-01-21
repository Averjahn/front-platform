<template>
  <div class="admin-patients-page">
    <h1 class="page-title">Пациенты</h1>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="btn-add-patient" @click="addPatient">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Добавить пациента
      </button>
      <button class="btn-appointment" @click="bookAppointment">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Записать на прием
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-button"
        :class="{ 'tab-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="patients-table-container">
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
            <th>Подробности по пациенту</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(patient, index) in filteredPatients" :key="patient.id" :class="{ 'row-even': index % 2 === 1 }">
            <td class="number-cell">{{ index + 1 }}</td>
            <td class="name-cell">{{ getPatientName(patient) }}</td>
            <td class="birthdate-cell">{{ formatDate(patient.birthDate) }}</td>
            <td class="treatment-start-cell">{{ formatDate(getTreatmentStartDate(patient)) }}</td>
            <td class="last-appointment-cell">{{ formatDate(getLastAppointmentDate(patient)) }}</td>
            <td class="doctor-cell">{{ getDoctorName(patient) }}</td>
            <td class="tariff-cell">{{ patient.tariff?.title || 'Не назначен' }}</td>
            <td class="details-cell">
              <button class="details-button" @click="viewPatientDetails(patient.id)">
                Подробности
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredPatients.length === 0" class="no-patients">
        <p>Нет пациентов</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminPatientsView',
  data() {
    return {
      patients: [],
      loading: false,
      error: null,
      activeTab: 'all',
      tabs: [
        { key: 'all', label: 'Все пациенты' },
        { key: 'new', label: 'Новые за 10 дней' },
        { key: 'course', label: 'Приобретен курс' },
        { key: 'inactive', label: 'Не были 120 дней' },
        { key: 'no-appointment', label: 'Приема не было' }
      ]
    };
  },
  computed: {
    filteredPatients() {
      if (!this.patients.length) return [];
      
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oneHundredTwentyDaysAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
      
      switch (this.activeTab) {
        case 'new':
          return this.patients.filter(p => {
            const createdAt = new Date(p.createdAt || p.user?.createdAt);
            return createdAt >= tenDaysAgo;
          });
        case 'course':
          return this.patients.filter(p => p.tariff && p.tariff.title);
        case 'inactive':
          return this.patients.filter(p => {
            const lastActivity = this.getLastAppointmentDate(p);
            if (!lastActivity) return true;
            const lastDate = new Date(lastActivity);
            return lastDate < oneHundredTwentyDaysAgo;
          });
        case 'no-appointment':
          return this.patients.filter(p => !this.getLastAppointmentDate(p));
        default:
          return this.patients;
      }
    }
  },
  async mounted() {
    await this.loadPatients();
  },
  methods: {
    async loadPatients() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/patients');
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
      // Получаем имя первого врача из связей
      if (patient.doctors && patient.doctors.length > 0) {
        const doctor = patient.doctors[0].doctor;
        if (doctor && doctor.user) {
          return doctor.user.lastName || 'Не указано';
        }
      }
      return 'Не назначен';
    },
    getTreatmentStartDate(patient) {
      // Дата начала лечения - дата создания первого назначения или дата создания пациента
      if (patient.assignments && patient.assignments.length > 0) {
        const dates = patient.assignments.map(a => new Date(a.createdAt)).sort((a, b) => a - b);
        return dates[0];
      }
      return patient.createdAt || patient.user?.createdAt;
    },
    getLastAppointmentDate(patient) {
      // Дата последнего приема - дата последней сессии теста
      if (patient.assignments && patient.assignments.length > 0) {
        const allSessions = [];
        patient.assignments.forEach(assignment => {
          if (assignment.sessions && assignment.sessions.length > 0) {
            assignment.sessions.forEach(session => {
              allSessions.push(new Date(session.startedAt));
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
    addPatient() {
      this.$router.push('/admin/patients/add');
    },
    bookAppointment() {
      this.$router.push('/admin/appointments');
    },
    viewPatientDetails(patientId) {
      this.$router.push(`/admin/patient/${patientId}`);
    }
  }
};
</script>

<style scoped>
.admin-patients-page {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 30px 0;
}

.action-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-add-patient,
.btn-appointment {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
}

.btn-add-patient {
  background: #ffffff;
  border-color: #ef4444;
  color: #475569;
}

.btn-add-patient svg {
  stroke: #ef4444;
  stroke-width: 2;
}

.btn-add-patient:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

.btn-appointment {
  background: #ffffff;
  border-color: #00CED1;
  color: #475569;
}

.btn-appointment svg {
  stroke: #00CED1;
  stroke-width: 2;
}

.btn-appointment:hover {
  background: #f0fdfd;
  border-color: #00a8b0;
}

.filter-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-button {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #1e293b;
  background: #f9fafb;
}

.tab-active {
  color: #1e293b;
  border-bottom-color: #FF8C00;
  font-weight: 600;
}

.loading,
.error-message {
  padding: 20px;
  text-align: center;
  font-size: 16px;
}

.error-message {
  color: #ef4444;
}

.patients-table-container {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
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

.details-cell {
  text-align: center;
}

.details-button {
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

.details-button:hover {
  background: #f0fdfd;
  border-color: #00a8b0;
  color: #00a8b0;
}

.no-patients {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

@media (max-width: 1200px) {
  .patients-table {
    font-size: 14px;
  }
  
  .patients-table th,
  .patients-table td {
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .admin-patients-page {
    padding: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .filter-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-button {
    padding: 10px 16px;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .patients-table-container {
    overflow-x: auto;
  }
}
</style>
