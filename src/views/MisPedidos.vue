<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStorePedidos } from "../stores/storePedidos"
import { useAuthStore } from "../stores/authStore"

const storePedidos = useStorePedidos()
const authStore = useAuthStore()
const router = useRouter()

const pedidos = ref([])
const cargando = ref(true)

onMounted(async () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/mis-pedidos" } })
    return
  }

  await storePedidos.cargarPedidosDelUsuario() 
})

const verDetalle = (idPedido) => {
  router.push(`/pedido/${idPedido}`)
}
</script>

<template>
  <div class="mis-pedidos">
    <h1>Mis Pedidos</h1>

    <div v-if="cargando" class="loading">Cargando pedidos...</div>

    <div v-else-if="pedidos.length === 0" class="sin-pedidos">
      <p>📭 Aún no has realizado ningún pedido.</p>
      <button class="btn btn-primary" @click="router.push('/productos')">
        📦 Ir a la tienda
      </button>
    </div>

    <div v-else>
      <div v-for="pedido in pedidos" :key="pedido.idPedido" class="pedido-card">
        <div class="pedido-header">
          <span class="pedido-id">#{{ pedido.idPedido }}</span>
          <span class="pedido-fecha">{{ new Date(pedido.fecha).toLocaleDateString() }}</span>
          <span class="pedido-estado" :class="pedido.estadoActual.toLowerCase()">
            {{ pedido.estadoActual }}
          </span>
        </div>

        <div class="pedido-resumen">
          <span>📦 {{ pedido.items.length }} productos</span>
          <span>💰 Total: ${{ pedido.totalFinal.toLocaleString() }}</span>
        </div>

        <button class="btn btn-ver" @click="verDetalle(pedido.idPedido)">
          👁️ Ver detalle
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mis-pedidos {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.sin-pedidos {
  text-align: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.pedido-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.pedido-id {
  font-weight: bold;
  color: #2c3e50;
}

.pedido-fecha {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.pedido-estado {
  font-weight: bold;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.pedido-estado.recibido {
  background: #3498db;
  color: white;
}
.pedido-estado.preparando {
  background: #f39c12;
  color: white;
}
.pedido-estado.enviado {
  background: #2ecc71;
  color: white;
}
.pedido-estado.entregado {
  background: #27ae60;
  color: white;
}
.pedido-estado.cancelado {
  background: #e74c3c;
  color: white;
}

.pedido-resumen {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-ver {
  background: #2c3e50;
  color: white;
}

.btn-ver:hover {
  background: #1a252f;
}
</style>