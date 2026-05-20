<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue'

const router = useRouter();
const route = useRoute();

const isActive = computed(() => route.path !== '/')

const goHome = () => {
  if (isActive.value) 
{
  router.push('/');
}
};
</script>

<template>
  <button @click="goHome" :disabled="!isActive">
    🏠 Inicio
  </button>
</template>