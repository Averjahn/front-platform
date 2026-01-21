<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Выбор тарифа</h2>
        <button class="modal-close" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div v-if="loading" class="loading">Загрузка тарифов...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="!loading && !error" class="tariffs-grid">
          <div
            v-for="tariff in tariffs"
            :key="tariff.id"
            class="tariff-card"
            :class="{ 'tariff-selected': selectedTariffId === tariff.id, 'tariff-current': currentTariffId === tariff.id }"
            @click="selectTariff(tariff.id)"
          >
            <div v-if="currentTariffId === tariff.id" class="tariff-badge">Текущий</div>
            <div class="tariff-header">
              <h3 class="tariff-title">{{ tariff.title }}</h3>
              <div class="tariff-price">
                <span class="price-amount">{{ formatPrice(tariff.price) }}</span>
                <span class="price-period">руб/мес</span>
              </div>
              <div v-if="tariff.discount > 0" class="tariff-discount">
                Экономия {{ tariff.discount }}% при оплате за квартал
              </div>
            </div>
            <div class="tariff-options">
              <h4 class="options-title">В тариф входит:</h4>
              <ul class="options-list">
                <li v-for="option in tariff.options" :key="option.id" class="option-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4L6 11L3 8" stroke="#00CED1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="option-text">
                    <strong>{{ option.title }}</strong>
                    <span v-if="option.description"> - {{ option.description }}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">Отмена</button>
        <button
          class="btn-confirm"
          :disabled="!selectedTariffId || selectedTariffId === currentTariffId || saving"
          @click="confirmSelection"
        >
          {{ saving ? 'Сохранение...' : 'Выбрать тариф' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'TariffModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    currentTariffId: {
      type: String,
      default: null,
    },
  },
  emits: ['close', 'tariff-selected'],
  data() {
    return {
      tariffs: [],
      loading: false,
      error: null,
      selectedTariffId: null,
      saving: false,
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.selectedTariffId = this.currentTariffId;
        this.loadTariffs();
      } else {
        this.selectedTariffId = null;
        this.error = null;
      }
    },
  },
  mounted() {
    // Проверяем авторизацию при монтировании
    const user = localStorage.getItem('user');
    if (!user) {
      console.warn('User not authenticated, tariffs may not load');
    }
  },
  methods: {
    async loadTariffs() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/tariffs');
        console.log('Tariffs response:', response.data);
        this.tariffs = response.data || [];
        if (this.tariffs.length === 0) {
          this.error = 'Тарифы не найдены. Обратитесь к администратору.';
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          this.error = 'Необходимо войти в систему для просмотра тарифов';
          console.error('Authentication error:', err);
          // Закрываем модальное окно при ошибке авторизации
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        } else {
          this.error = err?.response?.data?.message || err?.message || 'Ошибка загрузки тарифов';
        }
        console.error('Error loading tariffs:', err);
        console.error('Error details:', {
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
          fullError: err,
        });
      } finally {
        this.loading = false;
      }
    },
    selectTariff(tariffId) {
      if (tariffId !== this.currentTariffId) {
        this.selectedTariffId = tariffId;
      }
    },
    async confirmSelection() {
      if (!this.selectedTariffId || this.selectedTariffId === this.currentTariffId) {
        return;
      }

      this.saving = true;
      this.error = null;

      try {
        await api.put('/patient/tariff', {
          tariffId: this.selectedTariffId,
        });
        this.$emit('tariff-selected', this.selectedTariffId);
        this.closeModal();
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка при выборе тарифа';
        console.error('Error updating tariff:', err);
      } finally {
        this.saving = false;
      }
    },
    closeModal() {
      this.$emit('close');
    },
    formatPrice(price) {
      return new Intl.NumberFormat('ru-RU').format(price);
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #ffffff;
  border-radius: 12px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #1e293b;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.loading,
.error-message {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
}

.tariffs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.tariff-card {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
}

.tariff-card:hover {
  border-color: #00CED1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tariff-selected {
  border-color: #00CED1;
  background: #f0fdfd;
  box-shadow: 0 4px 6px -1px rgba(0, 206, 209, 0.2);
}

.tariff-current {
  border-color: #00CED1;
  background: #f0fdfd;
}

.tariff-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #00CED1;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tariff-header {
  margin-bottom: 20px;
}

.tariff-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.tariff-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #00CED1;
}

.price-period {
  font-size: 16px;
  color: #6b7280;
}

.tariff-discount {
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
}

.tariff-options {
  margin-top: 20px;
}

.options-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.option-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

.option-text strong {
  color: #1e293b;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 30px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #00CED1;
  color: #ffffff;
}

.btn-confirm:hover:not(:disabled) {
  background: #00a8b0;
}

.btn-confirm:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .tariffs-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 20px;
  }
}
</style>
