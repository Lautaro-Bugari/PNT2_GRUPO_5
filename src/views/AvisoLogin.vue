<script setup>

const emit = defineEmits([
  'login',
  'cerrar'
])

</script>

<template>

  <div >

    <div>

      <h2>
        🔐 Necesitas iniciar sesión
      </h2>

      <p>
        Debes iniciar sesión
        para realizar esta acción.
      </p>

      <div>

        <button
          @click="emit('login')"
        >
          Iniciar sesión
        </button>

        <button
          @click="emit('cerrar')"
        >
          Cancelar
        </button>

      </div>

    </div>

  </div>

</template>
