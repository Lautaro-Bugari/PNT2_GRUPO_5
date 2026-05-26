<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useStoreCarrito } from "../stores/storeCarrito"

const storeCarrito = useStoreCarrito();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

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
  <button @click="goHome" :disabled="!isActive">
    🏠 Inicio
  </button>
</template>