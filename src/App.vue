<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const rutaActual = computed(() => route.path);
function irA(path) {
  router.push(path);
}
</script>

<template>
    <button 
        @click="irA('/Inaki')" 
        :disabled="rutaActual === '/Inaki'"
      >
     Inaki
    </button>
    <button 
        @click="irA('/Lauti')" 
        :disabled="rutaActual === '/Lauti'"
          >
     Lauti
    </button>
    <div>
      <router-view />
    </div>
</template>

