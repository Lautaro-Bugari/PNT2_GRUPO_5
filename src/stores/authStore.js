import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuarioLogueado: null
  }),
  actions: {
    setUsuario(user) {
      this.usuarioLogueado = user
    },
    logout() {
      this.usuarioLogueado = null
    }
  }
});