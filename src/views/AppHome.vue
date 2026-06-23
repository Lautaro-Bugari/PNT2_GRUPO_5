<script setup>
import { ref, onMounted } from "vue"
import { useStoreProducto } from "../stores/storeProducto"
import { useStorePromos } from "../stores/storePromos"
import AvisoLogin from "./AvisoLogin.vue"
import { useAuthStore } from '../stores/authStore'
import { useStoreCarrito } from "../stores/storeCarrito"
import { useRouter } from 'vue-router'

const promos = ref([])
const novedades = ref([])
const storeProducto = useStoreProducto()
const storePromos = useStorePromos()
const avisoLoginVisible = ref(false)
let productoSeleccionado = null 
const authStore = useAuthStore()
const storeCarrito = useStoreCarrito()
const router = useRouter()

onMounted(async () => {
  try {

    promos.value = await storePromos.getPromociones()

    const productosObtenidos = await storeProducto.getProductos()
    const hoy = new Date()
    novedades.value = productosObtenidos.filter(p => {
      const fechaP = new Date(p.fechaSalida)
      return fechaP.getMonth() === hoy.getMonth() && 
        fechaP.getFullYear() === hoy.getFullYear()
    })
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error)
  }
})

const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    productoSeleccionado = producto

    avisoLoginVisible.value = true
    
    return
  }
  storeCarrito.agregarAlCarrito(producto)
}

const irALogin = () => {
  const ruta =
    productoSeleccionado?.productosIncluidos ||
    productoSeleccionado?.categorias
      ? `/promociones/${productoSeleccionado.id}`
      : `/producto/${productoSeleccionado.id}`

  console.log(ruta)

  router.push({
    path: "/login",
    query: {
      redirect: ruta
    }
  })
}

const irADetalle = (producto) => {
  const esPromocion = producto.productosIncluidos || producto.categorias
  const ruta = esPromocion
    ? `/promociones/${producto.id}`
    : `/producto/${producto.id}`
  router.push(ruta)
}
</script>

<template>
  <div>
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />
  </div>

  <div>
    <header>
      <h1>Bienvenido a la Distribuidora Kioskos</h1>
    </header>
    <div>
      <p>Somos tu proveedor confiable de productos para kioskos. Ofrecemos una amplia variedad de productos de alta calidad a precios competitivos.</p>
      <p>Explora nuestro catálogo y descubre todo lo que tenemos para ofrecerte. ¡Gracias por elegirnos!</p>
    </div>

    <h2>Ofertas</h2>
    <div v-for="promocion in promos" :key="promocion.id">
      <img 
        :src="promocion.imagen || 'https://picsum.photos/400/300'"
        width="400"
        alt="Imagen de promoción"
      >
      <h3>{{ promocion.nombre }}</h3>
      <p>Precio: ${{ promocion.precio }}</p>
      <button @click="verificarLogin(promocion)">🛒 Agregar al carrito</button>
      <button @click="irADetalle(promocion)">🔍 Ver detalles</button>
    </div>

    <h2>Novedades</h2>
    <div v-for="novedad in novedades" :key="novedad.id">
      <img 
        :src="novedad.imagen || 'https://picsum.photos/400/300'"
        width="400"
        alt="Imagen de producto"
      >
      <h3>{{ novedad.nombre }}</h3>
      <p>Precio: ${{ novedad.precio }}</p>
      <button @click="verificarLogin(novedad)">🛒 Agregar al carrito</button>
      <button @click="irADetalle(novedad)">🔍 Ver detalles</button>
    </div>
  </div>
</template>

