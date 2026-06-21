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
  <header class="barra-navegacion">
    <div class="menu-izquierdo">
      <button @click="goHome" :disabled="isActHome">
        Inicio
      </button>
      <button @click="goProductos" :disabled="isActProductos">
        Productos
      </button>
    </div>
    <div class="contenedor-busqueda">
      <img src="/imagenes/lupa-busqueda.png" class="icono-lupa"/>
      <input 
        type="text" 
        placeholder="Buscar productos..." 
        class="input-busqueda"
      />
    </div>
    <div class="menu-derecho">
      <div>
        <button @click="router.push('/checkout')" :disabled="route.path === '/checkout'">
          <img src="/imagenes/carrito.png" class="icono-header" /> Carrito {{ storeCarrito.getCantidadTotal }}
        </button>
      </div>
      <div>
        <p v-if="authStore.usuarioLogueado !== null" class="usuario-perfil">
          {{ authStore.usuarioLogueado.nombre }}
          <img :src="authStore.usuarioLogueado.avatar" width="50" class="avatar-foto"/>
        </p>
        <button v-if="authStore.usuarioLogueado !== null" @click="authStore.logout">
          Cerrar sesión
        </button>
        <button v-else @click="router.push({path:'/login',query:{redirect: route.path}})">
          <img src="/imagenes/user.png" class="icono-header"/> Iniciar sesión
        </button>
      </div>
    </div>
  </header>
</template>

