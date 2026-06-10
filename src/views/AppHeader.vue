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

<style scoped>
.barra-navegacion {
  background-color: #d32f2f;
  padding: 0 180px; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 150px; 
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.menu-izquierdo {
  display: flex;
  gap: 70px;
}

.menu-derecho {
  display: flex;
  align-items: center;
  gap: 70px;
}

.contenedor-busqueda {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 50px;
  padding: 0 25px;
  width: 45%;
  max-width: 700px;
  height: 55px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.icono-lupa {
  width: 25px;
  height: 25px;
  object-fit: contain;
  margin-right: 15px;
}

.input-busqueda {
  border: none;
  background: none;
  width: 100%;
  font-size: 20px;
  outline: none;
  color: #333333;
}

.input-busqueda::placeholder {
  color: #b5b5b5;
}

button {
  background: none;
  border: none;
  padding: 0;
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
}

button:hover {
  opacity: 0.8;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icono-header {
  width: 35px;  
  height: 35px;
  object-fit: contain;
  margin-right: 12px; 
}

.usuario-perfil {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.avatar-foto {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}
</style>