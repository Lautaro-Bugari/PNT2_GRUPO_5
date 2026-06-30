<script setup>
import { ref, onMounted } from "vue"
import { useStoreProducto } from "../stores/storeProducto"
import { useStorePromos } from "../stores/storePromos"
import AvisoLogin from "./AvisoLogin.vue"
import { useAuthStore } from '../stores/authStore'
import { useStoreCarrito } from "../stores/storeCarrito"
import { useRouter } from 'vue-router'
import BotonCarrito from "./BotonCarrito.vue"

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

/* const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    productoSeleccionado = producto
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(producto)
} */

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

const manejarLoginRequerido = (producto) => {
  productoSeleccionado = producto
  avisoLoginVisible.value = true
}
</script>

<template>
  <div class="home-container">
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />
  </div>

  <div class="home-content">
    <header class="home-header-banner">
      <h1>Bienvenido a la Distribuidora Kioskos</h1>
      <p>Somos tu proveedor confiable de productos para kioskos. Ofrecemos una amplia variedad de productos de alta calidad a precios competitivos.</p>
    </header>

    <h2 class="titulo-seccion">🎯 Ofertas</h2>
    <div class="grid-tarjetas">
      <div v-for="promocion in promos" :key="promocion.id" class="tarjeta-item">
        <img 
          :src="promocion.imagen || 'https://picsum.photos/400/300'"
          width="400"
          alt="Imagen de promoción"
          class="img-producto"
        >
        <h3>{{ promocion.nombre }}</h3>
        <div class="precio-contenedor">
          <p v-if="promocion.descuento" class="precio-original">
            ${{ (promocion.precio / (1 - promocion.descuento / 100)).toFixed(2) }}
          </p>
          <p class="precio-tag">Precio ahora: ${{ promocion.precio }}</p>
        </div>
        <div class="tarjeta-acciones">
          <BotonCarrito :producto="promocion" @login-required="manejarLoginRequerido(promocion)" />
          <button class="btn btn-secondary" @click="irADetalle(promocion)">🔍 Ver detalles</button>
        </div>
      </div>
    </div>

    <h2 class="titulo-seccion">✨ Novedades</h2>
    <div class="grid-tarjetas">
      <div v-for="novedad in novedades" :key="novedad.id" class="tarjeta-item">
        <img 
          :src="novedad.imagen || 'https://picsum.photos/400/300'"
          width="400"
          alt="Imagen de producto"
          class="img-producto"
        >
        <h3>{{ novedad.nombre }}</h3>
        <p class="precio-tag">Precio: ${{ novedad.precio }}</p>
        <div class="tarjeta-acciones">
          <BotonCarrito :producto="novedad" @login-required="manejarLoginRequerido" />
          <button class="btn btn-secondary" @click="irADetalle(novedad)">🔍 Ver detalles</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-content {
  width: 100%;
  min-height: 100vh;
  margin: 0px;
  padding: 60px 40px;
  background-color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

.home-header-banner {
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 40px;
  background: none;
}

.home-header-banner h1 {
  font-size: 56px;
  color: #e60000;
  font-weight: 800;
  margin: 0px 0px 20px 0px;
  letter-spacing: -1px;
}

.home-header-banner p {
  font-size: 20px;
  color: #4a4a4a;
  max-width: 900px;
  margin: 0px auto;
  line-height: 30px;
}

.titulo-seccion {
  font-size: 32px;
  color: #111111;
  margin: 60px 0px 25px 0px;
  font-weight: 700;
  border-bottom: 3px solid #111111;
  padding-bottom: 12px;
}

.grid-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 35px;
  width: 100%;
}

.tarjeta-item {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.img-producto {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.tarjeta-item h3 {
  font-size: 20px;
  font-weight: 700;
  color: #222222;
  margin: 0px 0px 10px 0px;
}

.precio-contenedor {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 20px 0;
}

.precio-original {
  font-size: 18px;
  color: #888;
  text-decoration: line-through;
  margin: 0;
}

.precio-tag {
  font-size: 22px;
  color: #e60000;
  font-weight: 800;
  margin: 0;
}

.tarjeta-acciones {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.btn {
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333333;
  flex: 1;
}

.btn-secondary:hover {
  background-color: #ddd;
}
</style>