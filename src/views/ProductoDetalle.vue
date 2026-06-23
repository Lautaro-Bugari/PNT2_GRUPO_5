<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'
import { useStoreCarrito } from '../stores/storeCarrito'
import { useAuthStore } from '../stores/authStore'
import AvisoLogin from './AvisoLogin.vue'

const route = useRoute()
const router = useRouter()
const storeProducto = useStoreProducto()
const storeCarrito = useStoreCarrito()
const authStore = useAuthStore()

const producto = ref(null)
const cargando = ref(true)
const error = ref('')
const avisoLoginVisible = ref(false)

const id = route.params.productoId

onMounted(async () => {
  try {
    const data = await storeProducto.getProductoById(id)
    if (data) {
      producto.value = data
    } else {
      error.value = 'Producto no encontrado'
    }
  } catch (err) {
    error.value = 'Error al cargar el producto'
  } finally {
    cargando.value = false
  }
})

const agregarAlCarrito = () => {
  if (producto.value.stock <= 0 || !producto.value.habilitado) return

  if (!authStore.usuarioLogueado) {
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(producto.value)
}


const irALogin = () => {
  router.push({
    path: '/login',
    query: {
      redirect: `/producto/${producto.value.id}`
    }
  })
}
</script>

<template>
  <div class="contenedor-detalle-producto">
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />
    <div v-if="producto" class="tarjeta-producto-detalle">
      <h1 class="titulo-producto">{{ producto.nombre }}</h1>
      <div class="seccion-info">
        <p class="descripcion-producto"><strong>Descripción:</strong> {{ producto.descripcion }}</p>
        <div class="bloque-costos">
          <p class="precio-producto"><strong>Precio:</strong> <span class="monto-precio">${{ producto.precio }}</span></p>
          <p class="stock-producto"><strong>Stock:</strong> <span :class="{ 'sin-stock': producto.stock <= 0 }">{{ producto.stock }} unidades</span></p>
        </div>
        <p class="categoria-producto"><strong>Categoría:</strong> 
          <span class="badge-categoria">{{ producto.categoria?.nombre || 'Sin categoría' }}</span>
        </p>
      </div>
      <button 
        @click="agregarAlCarrito" 
        :disabled="producto.stock <= 0 || !producto.habilitado"
        class="btn-accion-producto"
      >
        {{ (producto.stock > 0 && producto.habilitado) ? '🛒 Agregar al carrito' : '🚫 No disponible' }}
      </button>
    </div>
    <div v-else-if="cargando" class="estado-mensaje cargando">Cargando detalles del producto...</div>
    <div v-else-if="error" class="estado-mensaje error">{{ error }}</div>
  </div>
</template>

<style scoped>
.contenedor-detalle-producto {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  color: #2b2b2b;
}

.tarjeta-producto-detalle {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.titulo-producto {
  font-size: 32px;
  font-weight: 800;
  color: #333;
  margin-top: 0;
  margin-bottom: 25px;
  border-bottom: 3px solid #333;
  padding-bottom: 12px;
}

.seccion-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.descripcion-producto {
  font-size: 16px;
  color: #555;
  line-height: 1.5;
}

.bloque-costos {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.precio-producto {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.monto-precio {
  font-size: 26px;
  font-weight: 800;
  color: #e60000;
  vertical-align: middle;
  margin-left: 5px;
}

.stock-producto {
  font-size: 15px;
  margin: 0;
  color: #555;
}

.stock-producto span {
  font-weight: 700;
  color: #28a745;
}

.stock-producto span.sin-stock {
  color: #dc3545;
}

.badge-categoria {
  font-size: 15px;
  color: #444;
  font-weight: 600;
}

.btn-accion-producto {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background-color: #e60000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 4px 12px rgba(230, 0, 0, 0.15);
}

.btn-accion-producto:hover:not(:disabled) {
  background-color: #c90000;
}

.btn-accion-producto:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-accion-producto:disabled {
  background-color: #cccccc;
  color: #ffffff;
  cursor: not-allowed;
  box-shadow: none;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.cargando {
  color: #666;
  background-color: #f9f9f9;
}

.error {
  color: #b52a37;
  background-color: #fff5f5;
  border: 1px solid #f8d7da;
}
</style>