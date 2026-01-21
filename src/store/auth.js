import { reactive, readonly } from 'vue';

const state = reactive({
  user: null
});

function setUser(user) {
  state.user = user;
}

function clearUser() {
  state.user = null;
}

export function useAuthStore() {
  return {
    state: readonly(state),
    setUser,
    clearUser
  };
}

