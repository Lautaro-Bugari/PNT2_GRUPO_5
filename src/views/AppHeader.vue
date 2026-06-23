<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue'
import { useStoreCarrito } from "../stores/storeCarrito"
import { useAuthStore } from '../stores/authStore';

const storeCarrito = useStoreCarrito();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const path = computed(() => route.path);

const isActHome = computed(() => path.value === '/');
const isActProductos = computed(() => path.value === '/productos');

const goHome = () => {
  router.push('/');
};

const goProductos = () => {
    router.push('/productos');
};
</script>

<template>
  <div>
    <button @click="goHome" :disabled="isActHome">
        🏠 Inicio
    </button>
    <button @click="goProductos" :disabled="isActProductos">
        📦 Productos
    </button>
  </div>

  <div>
    <button @click="router.push('/checkout')" :disabled="route.path === '/checkout'">
      🛒 Carrito {{ storeCarrito.getCantidadTotal }}
    </button>
    <button v-if="authStore.usuarioLogueado" 
      @click="router.push('/mis-pedidos')" 
      :disabled="route.path === '/mis-pedidos'">
      Mis Pedidos
    </button>
  </div>

  <div v-if="authStore.esAdmin">
    <button 
      @click="router.push('/admin/productos')" 
      :disabled="route.path === '/admin/productos'"
    >
      ⚙️ Admin Productos
    </button>
    <button 
      @click="router.push('/admin/promociones')" 
      :disabled="route.path === '/admin/promociones'"
    >
      🎯 Admin Promociones
    </button>
    <button @click="router.push('/admin/categorias')" :disabled="route.path === '/admin/categorias'">
      🏷️ Admin Categorías
    </button>
    <button @click="router.push('/admin/pedidos')" :disabled="route.path === '/admin/pedidos'">
      📝 Admin Pedidos
    </button>
    <button @click="router.push('/admin/usuarios')" :disabled="route.path === '/admin/usuarios'">
      👥 Admin Usuarios
    </button>
  </div>
  <div>
    <p v-if="authStore.usuarioLogueado !== null">
      {{ authStore.usuarioLogueado.nombre }}
      <img :src="authStore.usuarioLogueado.avatar" width="50" />
    </p>
    <button v-if="authStore.usuarioLogueado !== null" @click="authStore.logout">
      🚪 Cerrar sesión
    </button>
    <button v-else @click="router.push({path:'/login',query:{redirect: route.path}})">
      🔑 Iniciar sesión
    </button>
  </div>
</template>