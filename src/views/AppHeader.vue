<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isActive = computed(() => route.path !== '/')

const goHome = () => {
  if (isActive.value) 
{
  router.push('/');
}
};
</script>

<template>
  <nav>
    <button @click="goHome" :disabled="!isActive">
      Inicio
    </button>
    <span v-if="authStore.isAuth">
      Bienvenido, {{ authStore.usuarioLogueado.nombre }}!
    </span>
  </nav>
</template>