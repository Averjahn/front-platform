<template>
  <header class="doctor-header">
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

    <!-- Navigation Bar (Orange) -->
    <nav class="doctor-nav">
      <RouterLink
        to="/doctor/patients"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/doctor/patients') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="currentColor"/>
          <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="currentColor"/>
          <path d="M15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" fill="currentColor"/>
        </svg>
        <span>Мои пациенты</span>
      </RouterLink>

      <RouterLink
        to="/doctor/trainers"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/doctor/trainers') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V4C17 3.44772 16.5523 3 16 3H4ZM5 5H15V15H5V5Z" fill="currentColor"/>
          <path d="M7 7H13V8H7V7Z" fill="currentColor"/>
          <path d="M7 10H13V11H7V10Z" fill="currentColor"/>
        </svg>
        <span>Каталог заданий</span>
      </RouterLink>

      <RouterLink
        to="/doctor/appointments"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/doctor/appointments') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V6C18 4.89543 17.1046 4 16 4H15V3C15 2.44772 14.5523 2 14 2C13.4477 2 13 2.44772 13 3V4H7V3C7 2.44772 6.55228 2 6 2ZM4 6H16V16H4V6Z" fill="currentColor"/>
          <path d="M6 8H14V9H6V8Z" fill="currentColor"/>
        </svg>
        <span>Запись на прием</span>
      </RouterLink>

      <RouterLink
        to="/doctor/documents"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/doctor/documents') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V4C17 3.44772 16.5523 3 16 3H4ZM5 5H15V15H5V5Z" fill="currentColor"/>
          <path d="M7 7H13V8H7V7Z" fill="currentColor"/>
          <path d="M7 10H13V11H7V10Z" fill="currentColor"/>
          <path d="M7 13H11V14H7V13Z" fill="currentColor"/>
        </svg>
        <span>Документы</span>
      </RouterLink>

      <RouterLink
        to="/doctor/profile"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path.startsWith('/doctor/profile') }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill="currentColor"/>
          <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17V18H3V17Z" fill="currentColor"/>
        </svg>
        <span>Мой профиль</span>
      </RouterLink>
    </nav>
  </header>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  name: 'DoctorHeader',
  components: {
    RouterLink
  }
};
</script>

<style scoped>
.doctor-header {
  background: #ffffff;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #E0F7FA;
  border-bottom: none;
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

.center-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.center-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.center-name-sub {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin: 0;
  line-height: 1.2;
}

.center-description {
  font-size: 14px;
  color: #475569;
  margin: 0;
  line-height: 1.4;
}

.header-right {
  flex-shrink: 0;
}

.phone {
  font-size: 20px;
  font-weight: 700;
  color: #00CED1;
  text-decoration: none;
  transition: color 0.2s;
}

.phone:hover {
  color: #00a8b0;
}

.doctor-nav {
  display: flex;
  align-items: center;
  gap: 0;
  background: #FF8C00;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.nav-item svg {
  stroke: #1e293b;
  stroke-width: 1.5;
  fill: #ffffff;
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item-active {
  background: rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) inset;
  font-weight: 600;
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
    font-size: 16px;
  }

  .center-name-sub {
    font-size: 14px;
  }

  .center-description {
    font-size: 12px;
  }

  .phone {
    font-size: 18px;
  }

  .doctor-nav {
    padding: 0;
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
