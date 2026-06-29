<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue'
import { useStoreCarrito } from "../stores/storeCarrito"
import { useAuthStore } from '../stores/authStore';

const storeCarrito = useStoreCarrito();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const path = computed(() => route.path);

const isActHome = computed(() => path.value === '/');
const isActProductos = computed(() => path.value === '/productos');

const goHome = () => {
  router.push('/');
};

const goProductos = () => {
    router.push('/productos');
};

const ejecutarLogout = async () => {
  await authStore.logout()
  router.push("/")
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">

      <div class="header-top">
        <div class="nav-buttons">
          <button @click="goHome" :disabled="isActHome" class="nav-btn">
            🏠 Inicio
          </button>
          <button @click="goProductos" :disabled="isActProductos" class="nav-btn">
            📦 Productos
          </button>
        </div>

        <div class="user-actions">
          <button @click="router.push('/checkout')" :disabled="route.path === '/checkout'" class="nav-btn cart-btn">
            🛒 Carrito <span class="cart-badge">{{ storeCarrito.getCantidadTotal }}</span>
          </button>
          <button v-if="authStore.usuarioLogueado" 
            @click="router.push('/mis-pedidos')" 
            :disabled="route.path === '/mis-pedidos'" class="nav-btn">
            Mis Pedidos
          </button>
          <div v-if="authStore.usuarioLogueado" class="user-info">
            <span class="user-name">{{ authStore.usuarioLogueado.nombre }}</span>
            <img :src="authStore.usuarioLogueado.avatar" width="32" height="32" class="user-avatar" />
          </div>
          <button v-if="authStore.usuarioLogueado" @click="ejecutarLogout" class="nav-btn logout-btn">
            🚪 Cerrar sesión
          </button>
          <button v-else @click="router.push({path:'/login',query:{redirect: route.path}})" class="nav-btn login-btn">
            🔑 Iniciar sesión
          </button>
        </div>
      </div>


      <div v-if="authStore.esAdmin" class="admin-buttons">
        <button @click="router.push('/admin/productos')" :disabled="route.path === '/admin/productos'" class="admin-btn">
          ⚙️ Admin Productos
        </button>
        <button @click="router.push('/admin/promociones')" :disabled="route.path === '/admin/promociones'" class="admin-btn">
          🎯 Admin Promociones
        </button>
        <button @click="router.push('/admin/categorias')" :disabled="route.path === '/admin/categorias'" class="admin-btn">
          🏷️ Admin Categorías
        </button>
        <button @click="router.push('/admin/pedidos')" :disabled="route.path === '/admin/pedidos'" class="admin-btn">
          📝 Admin Pedidos
        </button>
        <button @click="router.push('/admin/usuarios')" :disabled="route.path === '/admin/usuarios'" class="admin-btn">
          👥 Admin Usuarios
        </button>
        <button @click="router.push('/admin/estadisticas')" :disabled="route.path === '/admin/estadisticas'" class="admin-btn">
          📊 Estadísticas
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 10px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-btn {
  background: transparent;
  border: none;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  color: #111;
}

.nav-btn:disabled {
  color: #b0b0b0;
  cursor: default;
  background-color: transparent;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  display: inline-block;
  background-color: #e60000;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 20px;
  padding: 0 8px;
  min-width: 20px;
  text-align: center;
  line-height: 20px;
  margin-left: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.user-avatar {
  border-radius: 50%;
  border: 2px solid #ddd;
  object-fit: cover;
}

.logout-btn {
  color: #d32f2f;
}

.logout-btn:hover:not(:disabled) {
  background-color: #fde8e8;
}

.login-btn {
  background-color: #e60000;
  color: white;
  padding: 8px 18px;
  font-weight: 700;
}

.login-btn:hover {
  background-color: #c90000;
  color: white;
}

.admin-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.admin-btn {
  background: transparent;
  border: 1px solid #ccc;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.admin-btn:hover:not(:disabled) {
  background-color: #f1f1f1;
  border-color: #999;
  color: #222;
}

.admin-btn:disabled {
  color: #bbb;
  border-color: #ddd;
  cursor: default;
  background-color: #fafafa;
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-buttons, .user-actions {
    justify-content: center;
  }

  .user-actions {
    flex-wrap: wrap;
  }

  .admin-buttons {
    justify-content: center;
  }

  .nav-btn, .admin-btn {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>