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
  <div class="contenedor-login">
    <div class="tarjeta-login">
      <h1 class="titulo-login">Ingreso al Sistema Mayorista</h1>
      <p class="bajada-login">Introduce tus credenciales para ingresar a la distribuidora.</p>
      <form @submit.prevent="manejarLogin" class="formulario-login">
        <div class="grupo-input">
          <label class="etiqueta-formulario">Usuario (o Email): </label>
          <input 
            v-model="usuario" 
            :disabled="estaTrabajando"
            @input="errorMsg = ''"
            type="text" 
            placeholder="Ej: kiosko@gmail.com" 
            class="input-formulario"
          />
        </div>
        <br>
        <div class="grupo-input">
          <label class="etiqueta-formulario">Contraseña: </label>
          <input 
            v-model="contrasenia" 
            :disabled="estaTrabajando"
            @input="errorMsg = ''"
            type="password" 
            placeholder="••••••••" 
            class="input-formulario"
          />
        </div>
        <br>
        <button type="submit" :disabled="!formularioCompleto || estaTrabajando" class="boton-enviar">
          {{ estaTrabajando ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
        <p v-if="errorMsg" class="alerta-error">
          {{ errorMsg }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.contenedor-login {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 20px;
}

.tarjeta-login {
  background: #ffffff;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.titulo-login {
  font-size: 26px;
  font-weight: 800;
  color: #e60000;
  margin: 0 0 10px 0;
  text-align: center;
}

.bajada-login {
  font-size: 14px;
  color: #666;
  margin: 0 0 30px 0;
  text-align: center;
}

.formulario-login {
  display: flex;
  flex-direction: column;
}

.grupo-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.etiqueta-formulario {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.input-formulario {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-formulario:focus {
  outline: none;
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.input-formulario:disabled {
  background-color: #f2f2f2;
  cursor: not-allowed;
}

.boton-enviar {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.boton-enviar:hover:not(:disabled) {
  background-color: #e60000;
}

.boton-enviar:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.alerta-error {
  margin-top: 15px;
  background-color: #fff5f5;
  border: 1px solid #f8d7da;
  color: #b52a37;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}
</style>