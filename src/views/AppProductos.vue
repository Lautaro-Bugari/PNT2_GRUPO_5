<script setup>
import { ref, computed, onMounted } from "vue"
/* import { useStoreCarrito } from "../stores/storeCarrito" */
import AvisoLogin from "./AvisoLogin.vue"
/* import { useAuthStore } from '../stores/authStore' */
import { useRouter } from 'vue-router'
import { useStoreProducto } from "../stores/storeProducto"
import BotonCarrito from "./BotonCarrito.vue"

const storeProducto = useStoreProducto()
const router = useRouter()
/* const authStore = useAuthStore()
const storeCarrito = useStoreCarrito() */

const productos = ref([])
const busqueda = ref("")
const avisoLoginVisible = ref(false)
let productoSeleccionado = null
const categoriaSeleccionada = ref("Todos")

onMounted(async () => {
  productos.value = await storeProducto.getProductos()
})

const categorias = computed(() => {
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

/* const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    productoSeleccionado = producto
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(producto)
} */

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

  console.log(ruta)

  router.push({
    path: "/login",
    query: {
      redirect: ruta
    }
  })
}

const manejarLoginRequerido = (producto) => {
  productoSeleccionado = producto
  avisoLoginVisible.value = true
}
</script>

<template>
  <div class="contenedor-catalogo">
    <h1 class="titulo-catalogo">Productos</h1>
    
    <div class="barra-filtros">
      <input v-model="busqueda" placeholder="Buscar producto..." class="input-busqueda">
      <select v-model="categoriaSeleccionada" class="select-categoria">
        <option v-for="categoria in categorias" :key="categoria">
          {{ categoria }}
        </option>
      </select>
    </div>
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />
    <div class="grilla-productos">
      <div v-for="producto in productosFiltrados" :key="producto.id" class="tarjeta-producto">
        <div class="contenedor-imagen">
          <img 
            :src="producto.imagen || 'https://picsum.photos/400/300'"
            width="400"
            alt="Imagen de producto"
            class="imagen-producto"
          >
        </div>
        <div class="info-producto">
          <h3 class="nombre-producto">{{ producto.nombre }}</h3>
          <p class="categoria-producto">{{ producto.categoria?.nombre || (producto.categorias?.length ? producto.categorias.map(c => c.nombre).join(', ') : 'Sin categoría') }}</p>
          
          <div class="precio-contenedor">
            <span v-if="producto.descuento" class="precio-original">
              ${{ (producto.precio / (1 - producto.descuento / 100)).toFixed(2) }}
            </span>
            <span class="precio-producto">${{ producto.precio }}</span>
          </div>
          
          <div class="tarjeta-acciones">
          <BotonCarrito :producto="producto" @login-required="manejarLoginRequerido(producto)" />
          <button class="btn btn-secondary" @click="irADetalle(producto)">🔍 Ver detalles</button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-catalogo {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.titulo-catalogo {
  font-size: 32px;
  font-weight: 800;
  color: #e60000;
  margin-bottom: 25px;
  border-bottom: 3px solid #333;
  padding-bottom: 10px;
}

.barra-filtros {
  display: flex;
  gap: 15px;
  margin-bottom: 35px;
}

.input-busqueda {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color .2s, box-shadow .2s;
}

.select-categoria {
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  min-width: 180px;
}

.input-busqueda:focus,
.select-categoria:focus {
  outline: none;
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(230,0,0,.1);
}

.grilla-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 30px;
}

.tarjeta-producto {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,.03);
  display: flex;
  flex-direction: column;
  transition: .2s;
}

.tarjeta-producto:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0,0,0,.08);
}

.contenedor-imagen {
  width: 100%;
  height: 220px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.imagen-producto {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-producto {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nombre-producto {
  font-size: 18px;
  font-weight: 700;
  color: #2b2b2b;
  margin: 0 0 8px;
}

.categoria-producto {
  font-size: 13px;
  color: #777;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: .5px;
}

.precio-contenedor {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.precio-original {
  font-size: 16px;
  color: #888;
  text-decoration: line-through;
}

.precio-producto {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.tarjeta-acciones {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}

.tarjeta-acciones > * {
  flex: 1;
}

.btn {
  height: 46px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .2s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #dddddd;
}
</style>