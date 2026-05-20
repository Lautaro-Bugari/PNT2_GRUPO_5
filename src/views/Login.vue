<script setup>
import { ref } from 'vue'

const usuario = ref('')
const contrasenia = ref('')

function manejarLogin() {
  if (usuario.value !== '' && contrasenia.value !== '') {
    alert(`Intentando iniciar sesión con el usuario: ${usuario.value}`)
  } else {
    alert('Por favor, completa todos los campos.')
  }
}
</script>

<template>
  <div>
    <h1>Ingreso al Sistema Mayorista</h1>
    <p>Introduce tus credenciales para operar en la distribuidora.</p>
    <form @submit.prevent="manejarLogin">
      <div>
        <label>Usuario (o Email): </label>
        <input 
          v-model="usuario" 
          type="text" 
          placeholder="Ej: kiosko@gmail.com" 
        />
      </div>

      <br />

      <div>
        <label>Contraseña: </label>
        <input 
          v-model="contrasenia" 
          type="password" 
          placeholder="••••••••" 
        />
      </div>

      <br />

      <button type="submit">Iniciar Sesión</button>
    </form>
  </div>
</template>