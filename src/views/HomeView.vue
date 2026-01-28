<template>
  <section class="view">
    <h1 class="view-title">Главная</h1>
    <p class="view-subtitle">
      Добро пожаловать в систему обучения и реабилитации пациентов с нарушением речи
    </p>

    <div class="card">
      <h2>О системе</h2>
      <p class="card-text">
        Система предназначена для работы с пациентами, врачами и администраторами. 
        Выберите соответствующий раздел в меню для начала работы.
      </p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
  box-sizing: border-box;
}

.view-title {
  font-size: 2rem;
  margin: 0;
  color: #00CED1;
  font-weight: 600;
}

.view-subtitle {
  margin: 0 0 1.5rem;
  color: #6b7280;
  font-size: 1.1rem;
}

.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 600;
}

.card-text {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}
</style>

