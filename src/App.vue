<template>
  <div class="app">
    <PatientHeader v-if="showPatientHeader" />
    <DoctorHeader v-else-if="showDoctorHeader" />
    <AdminHeader v-else-if="showAdminHeader" />
    <NavBar v-else-if="showNavBar" />
    <main class="app-main" :class="{ 'app-main-full': showPatientHeader || showDoctorHeader || showAdminHeader }">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { RouterView, useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import PatientHeader from './components/PatientHeader.vue';
import DoctorHeader from './components/DoctorHeader.vue';
import AdminHeader from './components/AdminHeader.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    PatientHeader,
    DoctorHeader,
    AdminHeader,
    RouterView
  },
  computed: {
    showNavBar() {
      const route = this.$route.name;
      return route !== 'login' && !route?.startsWith('patient-') && !route?.startsWith('doctor-') && !route?.startsWith('admin-');
    },
    showPatientHeader() {
      return this.$route.name?.startsWith('patient-');
    },
    showDoctorHeader() {
      return this.$route.name?.startsWith('doctor-');
    },
    showAdminHeader() {
      return this.$route.name?.startsWith('admin-');
    }
  }
};
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-main {
  flex: 1;
  padding: 2rem 1.5rem;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

.app-main-full {
  padding: 0;
  max-width: 100%;
}
</style>

