<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue'
import { useStoreCarrito } from "../stores/storeCarrito"

const storeCarrito = useStoreCarrito();
const router = useRouter();
const route = useRoute();

const path = computed(() => route.path);

const isActHome = computed(() => path.value === '/');
const isActProductos = computed(() => path.value === '/Productos');

const goHome = () => {
  router.push('/');
};

const goProductos = () => {
    router.push('/Productos');
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
      <p>
      🛒 Carrito {{ storeCarrito.getCantidadTotal}}
    </p>
  </div>
</template>