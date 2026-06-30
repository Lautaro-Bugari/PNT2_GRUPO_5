<script setup>
import AppHeader from "./views/AppHeader.vue"
import { useStoreCarrito } from "./stores/storeCarrito"
const storeCarrito = useStoreCarrito()
</script>

<template>
    <div>
      <AppHeader />
      <router-view />

      <Transition name="slide">
        <div v-if="storeCarrito.toastVisible" class="toast-carrito">
          <span class="toast-icono">🛒</span>
          <p class="toast-texto">{{ storeCarrito.toastMensaje }}</p>
        </div>
      </Transition>
    </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.toast-carrito {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #2ecc71;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 999999;
  font-weight: 600;
}

.toast-icono {
  font-size: 20px;
}

.toast-texto {
  margin: 0;
  font-size: 14px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>