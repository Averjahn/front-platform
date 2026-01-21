import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PatientProfileView from '@/views/PatientProfileView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/patient/profile',
    name: 'patient-profile',
    component: PatientProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/patient/assignments',
    name: 'patient-assignments',
    component: DashboardView, // TODO: Создать отдельный компонент
    meta: { requiresAuth: true }
  },
  {
    path: '/patient/diary',
    name: 'patient-diary',
    component: () => import('@/views/PatientDiaryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patient/achievements',
    name: 'patient-achievements',
    component: DashboardView, // TODO: Создать отдельный компонент
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor/patients',
    name: 'doctor-patients',
    component: () => import('@/views/DoctorPatientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor/trainers',
    name: 'doctor-trainers',
    component: () => import('@/views/DoctorTrainersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor/appointments',
    name: 'doctor-appointments',
    component: DashboardView, // TODO: Создать отдельный компонент
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor/documents',
    name: 'doctor-documents',
    component: DashboardView, // TODO: Создать отдельный компонент
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor/profile',
    name: 'doctor-profile',
    component: DashboardView, // TODO: Создать отдельный компонент
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor/patient/:id',
    name: 'doctor-patient-details',
    component: () => import('@/views/DoctorPatientDetailsView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuth();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }

  next();
});

function checkAuth() {
  const user = localStorage.getItem('user');
  return !!user;
}

export default router;

