import { defineStore } from "pinia"

import { useStoreCarrito }
from "./storeCarrito"
import Login from "@/views/Login.vue"

const url =
"https://6a14f50691ff9a63de0731e9.mockapi.io/api/carts"

export const useAuthStore =
defineStore('auth', {

  state: () => ({

    usuarioLogueado: null

  }),

  actions: {

    async setUsuario(user) {

      this.usuarioLogueado = user

      const storeCarrito =useStoreCarrito()

      const response =await fetch(url)

      const carritos =await response.json()

      let carritoGuardado =carritos.find(c => c.userId === user.id)

      if (!carritoGuardado) {
        carritoGuardado =
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
              userId: user.id,
              itemsProductos: []
            })}).then(res => res.json())
      }
      storeCarrito.setCarrito(carritoGuardado.itemsProductos, carritoGuardado.id)
    },

    async logout() {
      const storeCarrito = useStoreCarrito()
      storeCarrito.limpiarSesion()

      this.usuarioLogueado = null

    }

  }

})
