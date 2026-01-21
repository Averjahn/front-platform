<template>
  <section class="view">
    <h1 class="view-title">О проекте</h1>
    <p class="view-text">
      Этот шаблон создан на базе <strong>Vue 3</strong>, <strong>Vite</strong>, с использованием
      <strong>Vue Router</strong> и <strong>Axios</strong>.
    </p>
    <p class="view-text">
      Структура проекта разделена на <code>views</code>, <code>components</code>, <code>router</code> и
      <code>services</code> для удобной масштабируемости.
    </p>
  </section>
</template>

<script>
export default {
  name: 'AboutView'
};
</script>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.view-title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  color: #00CED1;
  font-weight: 600;
}

.view-text {
  margin: 0 0 1rem;
  color: #6b7280;
  line-height: 1.6;
}

code {
  background: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  color: #1e293b;
  font-family: 'Courier New', monospace;
}
</style>

