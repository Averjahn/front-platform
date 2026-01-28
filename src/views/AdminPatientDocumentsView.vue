<template>
  <div class="admin-patient-documents-page">
    <div class="page-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Назад
      </button>
      <h1 class="page-title">Документы пациента:</h1>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="documents-content">
      <div class="documents-header">
        <button @click="showAddDocumentModal = true" class="add-document-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3C10.5523 3 11 3.44772 11 4V9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44772 3.44772 9 4 9H9V4C9 3.44772 9.44772 3 10 3Z" fill="currentColor"/>
          </svg>
          Добавить документ
        </button>
      </div>

      <div v-if="documents.length === 0" class="no-documents">
        <p>У пациента нет документов</p>
        <button @click="showAddDocumentModal = true" class="add-first-document-button">
          Добавить первый документ
        </button>
      </div>

      <div v-else class="documents-list">
        <div class="document-item" v-for="document in documents" :key="document.id">
          <div class="document-name">{{ document.title }}</div>
          <div class="document-actions">
            <button 
              v-if="document.fileUrl" 
              class="action-button pdf-button" 
              @click="viewPDF(document)" 
              title="Просмотр PDF"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V4C17 3.44772 16.5523 3 16 3H4ZM5 5H15V15H5V5Z" fill="currentColor"/>
                <text x="7" y="12" font-size="8" font-weight="bold" fill="currentColor">PDF</text>
              </svg>
            </button>
            <button 
              v-if="document.fileUrl" 
              class="action-button print-button" 
              @click="printDocument(document)" 
              title="Печать"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3C4.44772 3 4 3.44772 4 4V6H2C1.44772 6 1 6.44772 1 7V13C1 13.5523 1.44772 14 2 14H4V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V14H18C18.5523 14 19 13.5523 19 13V7C19 6.44772 18.5523 6 18 6H16V4C16 3.44772 15.5523 3 15 3H5ZM6 5H14V15H6V5ZM3 8H17V12H3V8Z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              class="action-button delete-button" 
              @click="confirmDelete(document)" 
              title="Удалить"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3C8 2.44772 8.44772 2 9 2H11C11.5523 2 12 2.44772 12 3V4H15C15.5523 4 16 4.44772 16 5C16 5.55228 15.5523 6 15 6H14V15C14 16.1046 13.1046 17 12 17H8C6.89543 17 6 16.1046 6 15V6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H8V3Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления документа -->
    <div v-if="showAddDocumentModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Добавить документ</h2>
          <button @click="closeModal" class="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleAddDocument" class="modal-form">
          <div class="form-group">
            <label for="documentTitle" class="form-label">Название документа <span class="required">*</span></label>
            <input
              id="documentTitle"
              v-model="newDocument.title"
              type="text"
              class="form-input"
              placeholder="Например: Договор на оказание платных медицинских услуг"
              required
              :disabled="submitting"
            />
          </div>

          <div class="form-group">
            <label for="documentType" class="form-label">Тип документа <span class="required">*</span></label>
            <select
              id="documentType"
              v-model="newDocument.type"
              class="form-input"
              required
              :disabled="submitting"
            >
              <option value="">Выберите тип</option>
              <option value="contract">Договор</option>
              <option value="act">Акт выполненных работ</option>
              <option value="consent">Согласие</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div class="form-group">
            <label for="documentFile" class="form-label">Загрузить файл (опционально)</label>
            <input
              id="documentFile"
              type="file"
              class="form-input-file"
              @change="handleFileSelect"
              :disabled="submitting"
            />
            <small class="form-hint">Максимальный размер: 10MB. Поддерживаются все типы файлов.</small>
          </div>

          <div class="form-group">
            <label for="documentFileUrl" class="form-label">Или указать URL файла (опционально)</label>
            <input
              id="documentFileUrl"
              v-model="newDocument.fileUrl"
              type="url"
              class="form-input"
              placeholder="https://example.com/documents/file.pdf"
              :disabled="submitting || !!selectedFile"
            />
          </div>

          <div v-if="addDocumentError" class="error-message">
            {{ addDocumentError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-cancel" @click="closeModal" :disabled="submitting">
              Отмена
            </button>
            <button type="submit" class="btn btn-submit" :disabled="submitting">
              {{ submitting ? 'Создание...' : 'Создать документ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminPatientDocumentsView',
  data() {
    return {
      patientId: null,
      documents: [],
      loading: false,
      error: null,
      showAddDocumentModal: false,
      submitting: false,
      addDocumentError: null,
      selectedFile: null,
      deletingDocumentId: null,
      newDocument: {
        title: '',
        type: '',
        fileUrl: ''
      }
    };
  },
  mounted() {
    this.patientId = this.$route.params.patientId;
    if (this.patientId) {
      this.loadDocuments();
    } else {
      this.error = 'ID пациента не указан';
    }
  },
  methods: {
    async loadDocuments() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/patients/${this.patientId}/documents`);
        this.documents = response.data || [];
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка загрузки документов';
        console.error('Error loading documents:', err);
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push('/admin/documents');
    },
    viewPDF(document) {
      if (document.fileUrl) {
        // Если это относительный путь, добавляем базовый URL API
        const url = document.fileUrl.startsWith('http') 
          ? document.fileUrl 
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}${document.fileUrl}`;
        window.open(url, '_blank');
      }
    },
    printDocument(document) {
      if (document.fileUrl) {
        const url = document.fileUrl.startsWith('http') 
          ? document.fileUrl 
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}${document.fileUrl}`;
        window.open(url, '_blank');
      }
    },
    handleFileSelect(event) {
      const file = event.target.files?.[0];
      if (file) {
        // Проверяем размер файла (10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.addDocumentError = 'Размер файла не должен превышать 10MB';
          event.target.value = '';
          return;
        }
        this.selectedFile = file;
        this.newDocument.fileUrl = ''; // Очищаем URL, если выбран файл
      }
    },
    confirmDelete(document) {
      this.deleteDocument(document.id);
    },
    async deleteDocument(documentId) {
      this.deletingDocumentId = documentId;
      try {
        await api.delete(`/admin/patients/${this.patientId}/documents/${documentId}`);
        await this.loadDocuments();
      } catch (err) {
        this.error = err?.response?.data?.message || 'Ошибка при удалении документа';
        console.error('Error deleting document:', err);
      } finally {
        this.deletingDocumentId = null;
      }
    },
    closeModal() {
      this.showAddDocumentModal = false;
      this.newDocument = {
        title: '',
        type: '',
        fileUrl: ''
      };
      this.selectedFile = null;
      this.addDocumentError = null;
      // Очищаем input file
      const fileInput = document.getElementById('documentFile');
      if (fileInput) {
        fileInput.value = '';
      }
    },
    async handleAddDocument() {
      this.submitting = true;
      this.addDocumentError = null;

      try {
        if (this.selectedFile) {
          // Загружаем файл
          const formData = new FormData();
          formData.append('file', this.selectedFile);
          formData.append('title', this.newDocument.title);
          formData.append('type', this.newDocument.type);

          await api.post(`/admin/patients/${this.patientId}/documents/upload`, formData);
        } else {
          // Создаем документ без файла (только с URL или без файла)
          const payload = {
            title: this.newDocument.title,
            type: this.newDocument.type,
            ...(this.newDocument.fileUrl && { fileUrl: this.newDocument.fileUrl })
          };

          await api.post(`/admin/patients/${this.patientId}/documents`, payload);
        }

        this.closeModal();
        await this.loadDocuments();
      } catch (err) {
        this.addDocumentError = err?.response?.data?.message || 'Ошибка при создании документа';
        console.error('Error creating document:', err);
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* Используем общие стили из common.css для .admin-patient-documents-page */

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border: 2px solid #6b7280;
  color: #6b7280;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f9fafb;
  border-color: #4b5563;
  color: #4b5563;
}

.back-button svg {
  stroke: currentColor;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
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

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-documents {
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-tertiary);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
  margin: var(--spacing-lg) 0;
}

.add-first-document-button {
  padding: 12px 24px;
  background: #FF8C00;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-first-document-button:hover {
  background: #e67e00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.document-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-dark);
}

.document-name {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
}

.document-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.pdf-button:hover {
  border-color: #00CED1;
  color: #00CED1;
}

.print-button:hover {
  border-color: #6b7280;
  color: #1e293b;
}

.delete-button:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.action-button svg {
  width: 20px;
  height: 20px;
}

.documents-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.documents-header {
  display: flex;
  justify-content: flex-end;
}

.add-document-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #FF8C00;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-document-button:hover {
  background: #e67e00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
}

.add-document-button svg {
  width: 20px;
  height: 20px;
}

/* Modal Styles */
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

.modal-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #1e293b;
}

.modal-form {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.required {
  color: #ef4444;
}

.form-input {
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-50);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.form-input-file {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  transition: all 0.2s ease;
  cursor: pointer;
}

.form-input-file:focus {
  outline: none;
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

.form-input-file:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ffffff;
  border-color: #6b7280;
  color: #6b7280;
}

.btn-cancel:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #4b5563;
  color: #4b5563;
}

.btn-submit {
  background: #FF8C00;
  border-color: #FF8C00;
  color: #ffffff;
}

.btn-submit:hover:not(:disabled) {
  background: #e67e00;
  border-color: #e67e00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
}

@media (max-width: 768px) {
  .admin-patient-documents-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .document-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .modal-content {
    max-width: 100%;
    margin: 0;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
