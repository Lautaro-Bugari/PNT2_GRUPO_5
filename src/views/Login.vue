<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

const usuario = ref('')
const contrasenia = ref('')
const errorMsg = ref('')

const router = useRouter()
const authStore = useAuthStore()

function manejarLogin() {
  errorMsg.value = ''
  
  if (usuario.value !== '' && contrasenia.value !== '') {
    
    const datoUsuario = authService.login(usuario.value, contrasenia.value)
    
    if (datoUsuario) {
      authStore.setUsuario(datoUsuario)
      router.push('/home')
    } else {
      errorMsg.value = 'Credenciales inválidas. Revise usuario o clave.'
    }

  } else {
    errorMsg.value = 'Por favor, complete todos los campos.'
  }
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
          type="text" 
          placeholder="Ej: kiosko@gmail.com" 
        />
      </div>

      <br>

      <div>
        <label>Contraseña: </label>
        <input 
          v-model="contrasenia" 
          type="password" 
          placeholder="••••••••" 
        />
      </div>

      <br>

      <button type="submit">Iniciar Sesión</button>
      <p v-if="errorMsg">
        {{ errorMsg }}
      </p>
    </form>
  </div>
</template>