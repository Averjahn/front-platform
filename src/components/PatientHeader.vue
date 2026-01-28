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
          <div class="center-name-wrapper">
            <h1 class="center-name">ЦЕНТР ПАТОЛОГИИ РЕЧИ</h1>
            <h2 class="center-name-sub">И НЕЙРОРЕАБИЛИТАЦИИ</h2>
          </div>
          <p class="center-description">Система обучения и реабилитации<br>пациентов с нарушением речи</p>
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
          <path d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V6C18 4.89543 17.1046 4 16 4H15V3C15 2.44772 14.5523 2 14 2C13.4477 2 13 2.44772 13 3V4H7V3C7 2.44772 6.55228 2 6 2ZM4 6H16V16H4V6Z" fill="currentColor"/>
          <path d="M6 8H14V9H6V8Z" fill="currentColor"/>
          <path d="M6 11H10V12H6V11Z" fill="currentColor"/>
        </svg>
        <span>Назначения врача</span>
      </RouterLink>

      <RouterLink
        to="/patient/diary"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/patient/diary') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2C3.44772 2 3 2.44772 3 3V17C3 17.5523 3.44772 18 4 18H16C16.5523 18 17 17.5523 17 17V3C17 2.44772 16.5523 2 16 2H4ZM5 4H15V16H5V4Z" fill="currentColor"/>
          <path d="M6 6H14V7H6V6Z" fill="currentColor"/>
          <path d="M6 9H12V10H6V9Z" fill="currentColor"/>
          <path d="M6 12H14V13H6V12Z" fill="currentColor"/>
          <path d="M6 15H10V16H6V15Z" fill="currentColor"/>
          <path d="M2 5H4V7H2V5Z" fill="currentColor"/>
          <path d="M2 9H4V11H2V9Z" fill="currentColor"/>
        </svg>
        <span>Мой дневник</span>
      </RouterLink>

      <RouterLink
        to="/patient/trainers"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/patient/trainers') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V4C17 3.44772 16.5523 3 16 3H4ZM5 5H15V15H5V5Z" fill="currentColor"/>
          <path d="M7 7H13V8H7V7Z" fill="currentColor"/>
          <path d="M7 10H13V11H7V10Z" fill="currentColor"/>
        </svg>
        <span>Каталог заданий</span>
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
  background: transparent;
  position: relative;
  z-index: 100;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 100px;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.logo {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.center-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.center-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.center-name-sub {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.center-description {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.header-right {
  flex-shrink: 0;
  margin-left: 24px;
}

.phone {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-teal-light);
  text-decoration: none;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.6);
}

.phone:hover {
  color: var(--color-teal-dark);
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.patient-nav {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: var(--gradient-teal);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 206, 209, 0.15);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.patient-nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 34px 20px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 17px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  border-bottom: 6px solid transparent;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  fill: #ffffff;
  stroke: none;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.nav-item:hover svg {
  transform: scale(1.1);
}

.nav-item-active {
  background: rgba(255, 255, 255, 0.18);
  border-bottom-color: #ffffff;
  font-weight: 600;
}

.nav-item-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
}

.consultation-btn {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.consultation-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .header-top {
    padding: 14px 24px;
  }

  .center-name {
    font-size: 16px;
  }

  .phone {
    font-size: 16px;
    padding: 6px 12px;
  }
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 12px;
    padding: 12px 20px;
  }

  .header-left {
    flex-direction: column;
    text-align: center;
    width: 100%;
  }

  .header-right {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .center-name {
    font-size: 15px;
  }

  .center-description {
    font-size: 12px;
  }

  .patient-nav {
    padding: 0;
    overflow-x: auto;
  }

  .nav-item {
    padding: 24px 16px;
    font-size: 16px;
    min-width: fit-content;
  }

  .nav-item span {
    display: none;
  }

  .nav-item svg {
    width: 20px;
    height: 20px;
  }

  .consultation-btn {
    margin-left: 0;
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .header-top {
    padding: 10px 16px;
  }

  .logo svg {
    width: 50px;
    height: 50px;
  }

  .phone {
    font-size: 14px;
    padding: 6px 10px;
  }
}
</style>
