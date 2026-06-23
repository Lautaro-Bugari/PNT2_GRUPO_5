<script setup>
const emit = defineEmits([
  'login',
  'cerrar'
])
</script>

<template>
  <div class="modal-overlay">
    <div class="tarjeta-modal">
      <h2 class="titulo-modal">
        🔐 Necesitas iniciar sesión
      </h2>
      <p class="bajada-modal">
        Debes iniciar sesión
        para realizar esta acción.
      </p>
      <div class="acciones-modal">
        <button
          @click="emit('login')"
          class="btn-modal-login"
        >
          Iniciar sesión
        </button>
        <button
          @click="emit('cerrar')"
          class="btn-modal-cancelar"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.tarjeta-modal {
  background: #ffffff;
  width: 100%;
  max-width: 400px;
  padding: 35px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid #eaeaea;
  box-sizing: border-box;
  animation: popup 0.2s ease-out;
}

.titulo-modal {
  font-size: 22px;
  font-weight: 800;
  color: #333;
  margin-top: 0;
  margin-bottom: 12px;
}

.bajada-modal {
  font-size: 15px;
  color: #555;
  line-height: 1.5;
  margin: 0 0 25px 0;
}

.acciones-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-modal-login,
.btn-modal-cancelar {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-modal-login:active,
.btn-modal-cancelar:active {
  transform: scale(0.98);
}

.btn-modal-login {
  background-color: #e60000;
  color: #fff;
}

.btn-modal-login:hover {
  background-color: #c90000;
}

.btn-modal-cancelar {
  background-color: #f1f1f1;
  color: #444;
  border: 1px solid #ddd;
}

.btn-modal-cancelar:hover {
  background-color: #e5e5e5;
  border-color: #ccc;
}

@keyframes popup {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
