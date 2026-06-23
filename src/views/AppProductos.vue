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
          <strong class="precio-producto">${{ producto.precio }}</strong>
          <div class="acciones-producto">
            <button @click="verificarLogin(producto)" class="btn-carrito">🛒 Agregar al carrito</button>
            <button @click="irADetalle(producto)" class="btn-detalle">🔍 Ver detalles</button>
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
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select-categoria {
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  min-width: 180px;
}

.input-busqueda:focus, .select-categoria:focus {
  outline: none;
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(230, 0, 0, 0.1);
}

.grilla-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.tarjeta-producto {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tarjeta-producto:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.contenedor-imagen {
  width: 100%;
  height: 220px;
  background-color: #f8f9fa;
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
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.categoria-producto {
  font-size: 13px;
  color: #777;
  text-transform: uppercase;
  font-weight: 600;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.precio-producto {
  font-size: 22px;
  color: #333;
  font-weight: 700;
  margin-bottom: 20px;
  display: block;
}

.acciones-producto {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.btn-carrito {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #e60000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-carrito:hover {
  background-color: #c90000;
}

.btn-detalle {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-detalle:hover {
  background-color: #333;
  color: #fff;
  border-color: #333;
}
</style>