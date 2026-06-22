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
  <div>
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />

    <div v-if="producto">
      <h1>{{ producto.nombre }}</h1>
      <p><strong>Descripción:</strong> {{ producto.descripcion }}</p>
      <p><strong>Precio:</strong> ${{ producto.precio }}</p>
      <p><strong>Stock:</strong> {{ producto.stock }}</p>
      <p><strong>Categoría:</strong> {{ producto.categoria?.nombre }}</p>
      
      <button 
        @click="agregarAlCarrito" 
        :disabled="producto.stock <= 0 || !producto.habilitado"
      >
        {{ (producto.stock > 0 && producto.habilitado) ? '🛒 Agregar al carrito' : '🚫 No disponible' }}
      </button>
    </div>
    <div v-else-if="cargando">Cargando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
  </div>
</template>