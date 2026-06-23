<script setup>
import { ref, computed, onMounted } from "vue"
import { useStoreCarrito } from "../stores/storeCarrito"
import AvisoLogin from "./AvisoLogin.vue"
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import { useStoreProducto } from "../stores/storeProducto"

const storeProducto = useStoreProducto()
const router = useRouter()
const authStore = useAuthStore()
const storeCarrito = useStoreCarrito()

const productos = ref([])
const busqueda = ref("")
const avisoLoginVisible = ref(false)
let ProductoSeleccionado = null
const categoriaSeleccionada = ref("Todos")

onMounted(async () => {
  productos.value = await storeProducto.getProductos()
})

const categorias = computed(() => {
  // Solo productos simples tienen 'categoria' (objeto con nombre)
  const lista = productos.value
    .map(p => p.categoria?.nombre)
  return ["Todos", ...new Set(lista)]
})

const productosFiltrados = computed(() => {
  if (categoriaSeleccionada.value === "Todos" && busqueda.value === "") 
    return productos.value

  return productos.value.filter(producto => {
    const coincideCategoria = 
      categoriaSeleccionada.value === "Todos" ||
      producto.categoria?.nombre === categoriaSeleccionada.value ||
      (producto.categorias && producto.categorias.some(c => c.nombre === categoriaSeleccionada.value))

    const texto = busqueda.value.toLowerCase()
    const coincideBusqueda = 
      producto.nombre.toLowerCase().includes(texto) ||
      (producto.categoria?.nombre && producto.categoria.nombre.toLowerCase().includes(texto)) ||
      (producto.categorias && producto.categorias.some(c => c.nombre.toLowerCase().includes(texto)))

    return coincideCategoria && coincideBusqueda

  })
})

const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    ProductoSeleccionado = producto
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(producto)
}

const irADetalle = (producto) => {
  const esPromocion = producto.productosIncluidos && producto.productosIncluidos.length > 0
  const ruta = esPromocion
    ? `/promociones/${producto.id}`
    : `/producto/${producto.id}`
  router.push(ruta)
}

const irALogin = () => {
  const ruta =
    productoSeleccionado?.productosIncluidos ||
    productoSeleccionado?.categorias
      ? `/promociones/${productoSeleccionado.id}`
      : `/producto/${productoSeleccionado.id}`
}
</script>

<template>
  <div>
    <h1>Productos</h1>
    <input v-model="busqueda" placeholder="Buscar producto...">
    <select v-model="categoriaSeleccionada">
      <option v-for="categoria in categorias" :key="categoria">
        {{ categoria }}
      </option>
    </select>

    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />

    <div>
      <div v-for="producto in productosFiltrados" :key="producto.id">
        <img 
        :src="producto.imagen || 'https://via.placeholder.com/400'"
        width="400"
        alt="Imagen de producto"
      >
        <h3>{{ producto.nombre }}</h3>
        <p>{{ producto.categoria?.nombre || (producto.categorias?.length ? producto.categorias.map(c => c.nombre).join(', ') : 'Sin categoría') }}</p>
        <strong>${{ producto.precio }}</strong>
        <button @click="verificarLogin(producto)">🛒 Agregar al carrito</button>
        <button @click="irADetalle(producto)" class="btn-detalle">🔍 Ver detalles</button>
      </div>
    </div>
  </div>
</template>


