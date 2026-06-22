<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorePromos } from '../stores/storePromos'
import { useStoreCarrito } from '../stores/storeCarrito'
import { useAuthStore } from '../stores/authStore'
import AvisoLogin from './AvisoLogin.vue'

const route = useRoute()
const router = useRouter()
const storePromos = useStorePromos()
const storeCarrito = useStoreCarrito()
const authStore = useAuthStore()

const promocion = ref(null)
const cargando = ref(true)
const error = ref('')
const avisoLoginVisible = ref(false)

const id = route.params.promocionId

onMounted(async () => {
  try {
    const data = await storePromos.getPromocionById(id)
    if (data) {
      promocion.value = data
    } else {
      error.value = 'Promoción no encontrada'
    }
  } catch (err) {
    error.value = 'Error al cargar la promoción'
  } finally {
    cargando.value = false
  }
})

const stockDisponible = computed(() => {
  if (!promocion.value?.productosIncluidos) return false
  return promocion.value.productosIncluidos.every(p => p.stock > 0 && p.habilitado)
})

const agregarAlCarrito = () => {
  if (!stockDisponible.value && !promocion.habilitado) return

  if (!authStore.usuarioLogueado) {
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(promocion.value)
}

const irALogin = () => {
  router.push({
    path: '/login',
    query: {
      redirect: `/promociones/${promocion.value.id}`
    }
  })
}

</script>

<template>
  <div>
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin
      "
    />

    <div v-if="promocion">
      <h1>{{ promocion.nombre }}</h1>
      <p><strong>Descripción:</strong> {{ promocion.descripcion }}</p>
      <p><strong>Precio original:</strong> ${{ promocion.precio }}</p>
      <p v-if="promocion.descuento && promocion.descuento > 0">
        <strong>Descuento:</strong> {{ promocion.descuento }}%
              <p><strong>Precio final:</strong> ${{ promocion.precioFinal || promocion.precio }}</p>
      </p>
      
      <p><strong>Categorías:</strong>
        <span v-for="(cat, idx) in promocion.categorias" :key="idx">
          {{ cat.nombre }}<span v-if="idx < promocion.categorias.length - 1">, </span>
        </span>
      </p>

      <h3>Productos incluidos:</h3>
      <ul>
        <li v-for="p in promocion.productosIncluidos" :key="p.id">
          {{ p.nombre }} 
          (x{{ p.PromoProducto?.cantidad || 1 }}) 
          - Stock: {{ p.stock }}
          <span v-if="p.stock <= 0" >🚫 Sin stock</span>
        </li>
      </ul>


      <button 
        @click="agregarAlCarrito" 
        :disabled="!stockDisponible && promocion.habilitado"
      >
        {{ stockDisponible ? '🛒 Agregar al carrito' : '🚫 No disponible' }}
      </button>
    </div>
    <div v-else-if="cargando">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
  </div>
</template>