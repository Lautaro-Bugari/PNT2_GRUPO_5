import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuarioLogueado: null,
    isAuth: false
  }),
  actions: {
    setUsuario(user) {
      this.usuarioLogueado = user
      this.isAuth = true
    },
    logout() {
      this.usuarioLogueado = null
      this.isAuth = false
    }
  }
});