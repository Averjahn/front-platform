<template>
  <div class="date-picker">
    <!-- Статичный календарь (всегда виден) -->
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-btn" type="button">‹</button>
        <h3 class="calendar-month">{{ currentMonthYear }}</h3>
        <button @click="nextMonth" class="nav-btn" type="button">›</button>
      </div>
      
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>
      
      <div class="calendar-days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'calendar-day',
            {
              'other-month': day.otherMonth,
              'weekend': day.isWeekend,
              'available': !day.otherMonth && !day.isPast,
              'selected': day.selected,
              'past': day.isPast && !day.otherMonth,
              'today': day.isToday && !day.selected
            }
          ]"
          @click="selectDate(day)"
        >
          {{ day.date }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    modelValue: {
      type: [Date, String, null],
      default: null
    },
    placeholder: {
      type: String,
      default: 'Выберите дату'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minDate: {
      type: Date,
      default: () => new Date()
    },
    availableDates: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      weekdays: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
    };
  },
  computed: {
    displayValue() {
      if (!this.modelValue) return '';
      const date = typeof this.modelValue === 'string' 
        ? new Date(this.modelValue) 
        : this.modelValue;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    currentMonthYear() {
      const months = [
        'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
        'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
      ];
      return `${months[this.currentMonth]} ${this.currentYear}`;
    },
    calendarDays() {
      const days = [];
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const startDate = new Date(firstDay);
      const firstDayOfWeek = firstDay.getDay();
      startDate.setDate(startDate.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0, 0, 0, 0);
        
        const dateStr = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === this.currentMonth;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isPast = date < today || date < this.minDate;
        // Все будущие даты доступны для выбора
        const selected = this.isDateSelected(dateStr);
        const isToday = dateStr === today.toISOString().split('T')[0];

        days.push({
          date: date.getDate(),
          dateStr,
          otherMonth: !isCurrentMonth,
          isWeekend,
          available: true, // Всегда true для будущих дат
          selected,
          isPast,
          isToday
        });
      }

      return days;
    }
  },
  mounted() {
    if (this.modelValue) {
      const date = typeof this.modelValue === 'string' 
        ? new Date(this.modelValue) 
        : this.modelValue;
      this.currentMonth = date.getMonth();
      this.currentYear = date.getFullYear();
    }
  },
  watch: {
    modelValue(newValue) {
      if (newValue) {
        const date = typeof newValue === 'string' ? new Date(newValue) : newValue;
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
      }
    }
  },
  methods: {
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    selectDate(day) {
      // Разрешаем выбор любой будущей даты (не только из availableDates)
      if (day.otherMonth || day.isPast || this.disabled) return;

      const selectedDate = new Date(day.dateStr);
      this.$emit('update:modelValue', selectedDate);
    },
    isDateSelected(dateStr) {
      if (!this.modelValue) return false;
      const modelDateStr = typeof this.modelValue === 'string'
        ? this.modelValue.split('T')[0]
        : this.modelValue.toISOString().split('T')[0];
      return modelDateStr === dateStr;
    },
  }
};
</script>

<style scoped>
.date-picker {
  width: 100%;
}

.calendar-container {
  width: 100%;
  background: var(--color-bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
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

.nav-btn {
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

.nav-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-50);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
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
  position: relative;
}

.calendar-day.other-month {
  color: #d1d5db;
  cursor: default;
  opacity: 0.5;
}

.calendar-day.weekend {
  background: #fee2e2;
  color: #dc2626;
}

.calendar-day.past {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  opacity: 0.5;
  background: var(--color-bg-secondary);
}

.calendar-day.past.weekend {
  background: #fef2f2;
  opacity: 0.4;
}

.calendar-day.available {
  cursor: pointer;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.calendar-day.available:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
  transform: scale(1.05);
}

.calendar-day:not(.past):not(.other-month):not(.available) {
  cursor: pointer;
  background: #ffffff;
  color: #1e293b;
}

.calendar-day:not(.past):not(.other-month):not(.available):hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.calendar-day.available.weekend {
  background: #fee2e2;
  color: #dc2626;
}

.calendar-day.available.weekend:hover {
  background: #fecaca;
}

.calendar-day.today {
  border: 2px solid #3b82f6;
  font-weight: 600;
}

.calendar-day.today.available {
  background: #ffffff;
  color: #1e293b;
}

.calendar-day.today.available.weekend {
  background: #fee2e2;
  color: #dc2626;
}

.calendar-day.selected {
  background: var(--color-primary-50);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.calendar-day.selected.weekend {
  background: #fee2e2;
  color: #dc2626;
  border: 2px solid #3b82f6;
}
</style>
