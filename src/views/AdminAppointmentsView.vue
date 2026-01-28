<template>
  <div class="admin-appointments-page">
    <h1 class="page-title">Запись на прием</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="appointments-content">
      <!-- Выбор пациента и врача -->
      <div class="selection-section">
        <div class="form-group">
          <label for="patient" class="form-label">Пациент:</label>
          <select
            id="patient"
            v-model="selectedPatientId"
            class="form-select"
            :class="{ 'has-value': selectedPatientId }"
            @change="onPatientChange"
          >
            <option value="" disabled>Выберите пациента</option>
            <option
              v-for="patient in patients"
              :key="patient.id"
              :value="patient.id"
            >
              {{ formatPatientName(patient) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="doctor" class="form-label">Врач:</label>
          <select
            id="doctor"
            v-model="selectedDoctorId"
            class="form-select"
            :class="{ 'has-value': selectedDoctorId }"
            @change="onDoctorChange"
          >
            <option value="" disabled>Выберите врача</option>
            <option
              v-for="doctor in doctors"
              :key="doctor.id"
              :value="doctor.id"
            >
              {{ formatDoctorName(doctor) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Календарь и временные слоты -->
      <div class="booking-section">
        <div class="calendar-time-container">
          <!-- Календарь -->
          <div class="calendar-section">
            <h2 class="section-title">1. Выберите дату</h2>
            
            <div v-if="loadingDates" class="loading-dates">Загрузка доступных дат...</div>
            
            <!-- Компонент выбора даты -->
            <div class="date-picker-wrapper">
              <DatePicker
                v-model="selectedDateModel"
                :min-date="minDate"
                :available-dates="availableDates"
                :disabled="!selectedDoctorId"
                @update:model-value="onDateSelected"
              />
              <div v-if="!selectedDoctorId" class="doctor-warning-inline">
                Выберите врача для просмотра доступных дат
              </div>
            </div>
          </div>

          <!-- Временные слоты -->
          <div class="time-slots-section">
            <h2 class="section-title">2. Выберите время</h2>
            <div v-if="selectedDate" class="selected-date">
              {{ formatSelectedDate(selectedDate) }}
            </div>
            <div v-if="!selectedDoctorId" class="doctor-warning">
              Выберите врача для просмотра временных слотов
            </div>
            <div v-else-if="!selectedDate" class="date-warning">
              Выберите дату для просмотра временных слотов
            </div>
            <div v-else-if="loadingSlots" class="loading-slots">Загрузка временных слотов...</div>
            <div v-else-if="timeSlots.length === 0" class="no-slots">
              Нет доступных временных слотов на эту дату
            </div>
            <div v-else class="time-slots-list">
              <div
                v-for="slot in timeSlots"
                :key="slot.startTime"
                :class="[
                  'time-slot',
                  {
                    'available': slot.available,
                    'booked': !slot.available,
                    'selected': selectedSlot?.startTime === slot.startTime
                  }
                ]"
                @click="selectTimeSlot(slot)"
              >
                <div class="time-range">{{ slot.startTime }} - {{ slot.endTime }}</div>
                <div v-if="slot.available" class="slot-status">свободно</div>
                <div v-else class="slot-status booked">
                  {{ slot.appointment.patientName }}, {{ slot.appointment.type === 'first' ? 'впервые' : 'повторно' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма создания записи -->
        <div v-if="selectedPatientId && selectedDoctorId && selectedDate && selectedSlot && selectedSlot.available" class="appointment-form">
          <h3 class="form-title">Создать запись</h3>
          <div class="form-group">
            <label for="appointmentType" class="form-label">Тип приема:</label>
            <select
              id="appointmentType"
              v-model="appointmentType"
              class="form-select"
            >
              <option value="first">Впервые</option>
              <option value="repeat">Повторно</option>
            </select>
          </div>
          <div class="form-group">
            <label for="notes" class="form-label">Заметки (опционально):</label>
            <textarea
              id="notes"
              v-model="notes"
              class="form-textarea"
              rows="3"
              placeholder="Дополнительная информация..."
            ></textarea>
          </div>
          <button
            @click="createAppointment"
            :disabled="creating"
            class="btn-submit"
          >
            {{ creating ? 'Создание...' : 'Сохранить запись пациента' }}
          </button>
          <div v-if="createError" class="error-message">{{ createError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import DatePicker from '@/components/DatePicker.vue';

export default {
  name: 'AdminAppointmentsView',
  components: {
    DatePicker
  },
  data() {
    return {
      patients: [],
      doctors: [],
      selectedPatientId: '',
      selectedDoctorId: '',
      availableDates: [],
      selectedDate: null,
      selectedDateModel: null,
      timeSlots: [],
      selectedSlot: null,
      appointmentType: 'first',
      notes: '',
      loading: false,
      loadingSlots: false,
      loadingDates: false,
      creating: false,
      error: null,
      createError: null,
      minDate: new Date()
    };
  },
  computed: {},
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;

      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/doctors')
        ]);

        this.patients = patientsRes.data || [];
        this.doctors = doctorsRes.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки данных';
        console.error('Error loading data:', err);
      } finally {
        this.loading = false;
      }
    },
    formatPatientName(patient) {
      const user = patient.user || {};
      const parts = [user.lastName, user.firstName, user.middleName].filter(Boolean);
      return parts.join(' ') || user.email || 'Не указано';
    },
    formatDoctorName(doctor) {
      const user = doctor.user || {};
      const parts = [user.lastName, user.firstName, user.middleName].filter(Boolean);
      return parts.join(' ') || user.email || 'Не указано';
    },
    onPatientChange() {
      // Можно добавить дополнительную логику при изменении пациента
    },
    async onDoctorChange() {
      if (!this.selectedDoctorId) {
        this.availableDates = [];
        this.selectedDate = null;
        this.timeSlots = [];
        return;
      }

      await this.loadAvailableDates();
    },
    async loadAvailableDates() {
      if (!this.selectedDoctorId) {
        this.availableDates = [];
        return;
      }

      this.loadingDates = true;
      try {
        // Загружаем доступные даты (бэкенд всегда возвращает 14 дней вперед)
        // Это нужно для подсветки дат в календаре
        const response = await api.get(`/admin/doctors/${this.selectedDoctorId}/available-dates`);
        this.availableDates = response.data || [];
      } catch (err) {
        console.error('Error loading available dates:', err);
        // Не блокируем выбор дат, даже если загрузка не удалась
        this.availableDates = [];
      } finally {
        this.loadingDates = false;
      }
    },
    async onDateSelected(date) {
      if (!date) {
        this.selectedDate = null;
        this.selectedSlot = null;
        this.selectedDateModel = null;
        return;
      }

      // Преобразуем Date в строку формата YYYY-MM-DD
      const dateStr = date instanceof Date 
        ? date.toISOString().split('T')[0]
        : new Date(date).toISOString().split('T')[0];
      
      this.selectedDate = dateStr;
      this.selectedDateModel = date instanceof Date ? date : new Date(date);
      this.selectedSlot = null;
      await this.loadTimeSlots();
    },
    async loadTimeSlots() {
      if (!this.selectedDoctorId || !this.selectedDate) return;

      this.loadingSlots = true;
      try {
        const response = await api.get(`/admin/doctors/${this.selectedDoctorId}/time-slots`, {
          params: { date: this.selectedDate }
        });
        this.timeSlots = response.data || [];
      } catch (err) {
        console.error('Error loading time slots:', err);
        this.timeSlots = [];
      } finally {
        this.loadingSlots = false;
      }
    },
    selectTimeSlot(slot) {
      if (!slot.available) return;
      this.selectedSlot = slot;
    },
    formatSelectedDate(dateStr) {
      const date = new Date(dateStr);
      const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    },
    async createAppointment() {
      if (!this.selectedPatientId || !this.selectedDoctorId || !this.selectedDate || !this.selectedSlot) {
        return;
      }

      this.creating = true;
      this.createError = null;

      try {
        await api.post(`/admin/doctors/${this.selectedDoctorId}/appointments`, {
          patientId: this.selectedPatientId,
          date: this.selectedDate,
          startTime: this.selectedSlot.startTime,
          type: this.appointmentType,
          notes: this.notes || undefined
        });

        // Обновляем временные слоты
        await this.loadTimeSlots();
        
        // Сбрасываем форму
        this.selectedSlot = null;
        this.notes = '';
        this.appointmentType = 'first';
      } catch (err) {
        this.createError = err?.response?.data?.message || 'Ошибка при создании записи';
        console.error('Error creating appointment:', err);
      } finally {
        this.creating = false;
      }
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .admin-appointments-page, .page-title, .loading, .error-message */

.appointments-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.selection-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
}

.form-select {
  padding: 12px 16px;
  padding-right: 40px;
  font-size: 15px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  font-family: inherit;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-50);
}

.form-select.has-value {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

.form-select option:disabled {
  color: #9ca3af;
}

.booking-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-time-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.calendar-section,
.time-slots-section {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.date-picker-wrapper {
  width: 100%;
  margin-top: 20px;
}

.doctor-warning-inline {
  margin-top: 12px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
  text-align: center;
}

.date-picker-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.selected-date-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
}

.selected-date-info strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.calendar-month {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-transform: capitalize;
}

.calendar-nav-btn {
  width: 36px;
  height: 36px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-tertiary);
  font-size: 20px;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-nav-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-50);
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 8px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
}

.calendar-day.other-month {
  color: #d1d5db;
  cursor: default;
  opacity: 0.5;
}

.calendar-day.weekend {
  background: #fef2f2;
  color: #ef4444;
}

.calendar-day.past {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
  background: #f9fafb;
}

.calendar-day.past.weekend {
  background: #fef2f2;
  opacity: 0.4;
}

.calendar-day.available {
  cursor: pointer;
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.calendar-day.available:hover {
  background: #dcfce7;
  border-color: #86efac;
  transform: scale(1.05);
}

.calendar-day.today {
  position: relative;
  border: 2px solid #FF8C00;
  font-weight: 600;
}

.calendar-day.today.available {
  background: #fff7ed;
  color: #c2410c;
}

.calendar-day.today-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #FF8C00;
  border-radius: 50%;
}

.calendar-day.selected {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 140, 0, 0.3);
}

.calendar-day.selected .today-indicator {
  background: #ffffff;
}

.selected-date {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.loading-dates,
.loading-slots,
.no-slots,
.doctor-warning,
.date-warning {
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

.doctor-warning,
.date-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
}

.time-slots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.time-slot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-bg-primary);
}

.time-slot.available {
  cursor: pointer;
}

.time-slot.available:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-50);
  transform: translateX(4px);
}

.time-slot.selected {
  border-color: var(--color-accent);
  background: var(--color-accent-50);
  font-weight: 600;
}

.time-slot.booked {
  background: var(--color-error-50);
  border-color: var(--color-error-light);
  cursor: not-allowed;
  opacity: 0.7;
}

.time-range {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.slot-status {
  font-size: 14px;
  color: #6b7280;
}

.slot-status.booked {
  color: #ef4444;
  font-weight: 500;
}

.appointment-form {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.form-textarea {
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: inherit;
  resize: vertical;
  transition: all var(--transition-base);
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-50);
}

.btn-submit {
  padding: 14px 24px;
  background: #FF8C00;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #e67e00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .calendar-time-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-appointments-page {
    padding: 20px;
  }

  .selection-section {
    grid-template-columns: 1fr;
  }
}
</style>
