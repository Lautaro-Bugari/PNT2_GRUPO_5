<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

const usuario = ref('')
const contrasenia = ref('')
const route = useRoute()
const errorMsg = ref('')
const router = useRouter()
const authStore = useAuthStore()
const estaTrabajando = ref(false)

const formularioCompleto = computed(() => {
  return ( usuario.value !== '' && contrasenia.value !== '' )
})

async function manejarLogin() {
  estaTrabajando.value = true
  let datoUsuario
    try {
      datoUsuario =await authService.login(usuario.value, contrasenia.value)
    }
    catch (error) {
      errorMsg.value ='Usuario o contraseña incorrectos.'
      estaTrabajando.value = false
      return
    }
      await authStore.setUsuario(datoUsuario)
      router.push(route.query.redirect || '/')
      estaTrabajando.value = false
}
</script>

<template>
  <div>
    <h1>Ingreso al Sistema Mayorista</h1>
    <p>Introduce tus credenciales para ingresar a la distribuidora.</p>
    <form @submit.prevent="manejarLogin">
      <div>
        <label>Usuario (o Email): </label>
        <input 
          v-model="usuario" 
          :disabled="estaTrabajando"
          @input="errorMsg = ''"
          type="text" 
          placeholder="Ej: kiosko@gmail.com" 
        />
      </div>

      <br>

      <div>
        <label>Contraseña: </label>
        <input 
          v-model="contrasenia" 
          :disabled="estaTrabajando"
          @input="errorMsg = ''"
          type="password" 
          placeholder="••••••••" 
        />
      </div>

      <br>

      <button type="submit" :disabled="!formularioCompleto || estaTrabajando">
        {{ estaTrabajando ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
      <p v-if="errorMsg">
        {{ errorMsg }}
      </p>
    </form>
  </div>
</template>
