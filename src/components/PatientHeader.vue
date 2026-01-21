<template>
  <header class="patient-header">
    <!-- Top Header -->
    <div class="header-top">
      <div class="header-left">
        <div class="logo">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 35 Q10 25 15 20 Q20 15 25 20 Q25 15 30 12 Q35 15 35 20 Q40 15 45 20 Q50 25 50 35 Q50 45 45 50 Q40 45 35 50 Q30 55 25 50 Q20 45 15 50 Q10 45 10 35 Z" fill="#00CED1" opacity="0.3"/>
            <path d="M20 25 Q25 18 30 20 Q35 18 40 25 Q40 32 35 38 Q30 42 25 38 Q20 32 20 25 Z" fill="#00CED1"/>
            <path d="M25 25 Q27 23 30 25 Q33 23 35 25" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <path d="M25 30 Q27 28 30 30 Q33 28 35 30" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <ellipse cx="27" cy="27" rx="2" ry="2.5" fill="#ffffff"/>
            <ellipse cx="33" cy="27" rx="2" ry="2.5" fill="#ffffff"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="center-name">ЦЕНТР ПАТОЛОГИИ РЕЧИ И НЕЙРОРЕАБИЛИТАЦИИ</h1>
          <p class="center-description">Система обучения и реабилитации пациентов с нарушением речи</p>
        </div>
      </div>
      <div class="header-right">
        <a href="tel:+79999999999" class="phone">+7 999 999-99-99</a>
      </div>
    </div>

    <!-- Navigation Bar -->
    <nav class="patient-nav">
      <RouterLink
        to="/patient/assignments"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/patient/assignments') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="currentColor"/>
          <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="currentColor"/>
          <path d="M15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" fill="currentColor"/>
        </svg>
        <span>Назначения врача</span>
      </RouterLink>

      <RouterLink
        to="/patient/diary"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/patient/diary') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V4C17 3.44772 16.5523 3 16 3H4ZM5 5H15V15H5V5Z" fill="currentColor"/>
          <path d="M7 7H13V8H7V7Z" fill="currentColor"/>
          <path d="M7 10H13V11H7V10Z" fill="currentColor"/>
        </svg>
        <span>Мой дневник</span>
      </RouterLink>

      <RouterLink
        to="/patient/achievements"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/patient/achievements') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 14H17V16H3V14Z" fill="currentColor"/>
          <path d="M5 10H7V12H5V10Z" fill="currentColor"/>
          <path d="M9 8H11V12H9V8Z" fill="currentColor"/>
          <path d="M13 6H15V12H13V6Z" fill="currentColor"/>
        </svg>
        <span>Мои достижения</span>
      </RouterLink>

      <RouterLink
        to="/patient/profile"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/patient/profile') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="currentColor"/>
          <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="currentColor"/>
        </svg>
        <span>Мой профиль</span>
      </RouterLink>

      <button class="nav-item consultation-btn">
        <span>Консультация</span>
      </button>
    </nav>
  </header>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  name: 'PatientHeader',
  components: {
    RouterLink
  }
};
</script>

<style scoped>
.patient-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.center-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
}

.center-description {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.header-right {
  flex-shrink: 0;
}

.phone {
  font-size: 18px;
  font-weight: 500;
  color: #00CED1;
  text-decoration: none;
  transition: color 0.2s;
}

.phone:hover {
  color: #00a8b0;
}

.patient-nav {
  display: flex;
  align-items: center;
  gap: 0;
  background: #00CED1;
  padding: 0 40px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item-active {
  background: rgba(255, 255, 255, 0.15);
  border-bottom-color: #ffffff;
  font-weight: 600;
}

.consultation-btn {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 24px;
}

.consultation-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .header-left {
    flex-direction: column;
    text-align: center;
  }

  .center-name {
    font-size: 14px;
  }

  .patient-nav {
    padding: 0 20px;
    flex-wrap: wrap;
  }

  .nav-item {
    padding: 12px 16px;
    font-size: 14px;
  }

  .nav-item span {
    display: none;
  }
}
</style>
