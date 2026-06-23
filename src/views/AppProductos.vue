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
  <div class="productos-container">
    <h1>Productos</h1>
    
    <div class="filtros">
      <input 
        v-model="busqueda" 
        placeholder="🔍 Buscar producto..." 
        class="input-busqueda"
      />
      <select v-model="categoriaSeleccionada" class="select-categoria">
        <option v-for="categoria in categorias" :key="categoria" :value="categoria">
          {{ categoria }}
        </option>
      </select>
    </div>

    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />

    <div class="productos-grid">
      <div v-for="producto in productosFiltrados" :key="producto.id" class="producto-card">
        <img 
          :src="producto.imagen || 'https://picsum.photos/400/300'"
          alt="Imagen de producto"
          class="producto-imagen"
        />
        <div class="producto-info">
          <h3 class="producto-nombre">{{ producto.nombre }}</h3>
          <p class="producto-categoria">
            {{ producto.categoria?.nombre || (producto.categorias?.length ? producto.categorias.map(c => c.nombre).join(', ') : 'Sin categoría') }}
          </p>
          <p class="producto-precio">${{ producto.precio }}</p>
          <div class="producto-acciones">
            <button @click="verificarLogin(producto)" class="btn-carrito">
              🛒 Agregar al carrito
            </button>
            <button @click="irADetalle(producto)" class="btn-detalle">
              🔍 Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="productosFiltrados.length === 0" class="sin-resultados">
      <p>No se encontraron productos que coincidan con tu búsqueda.</p>
    </div>
  </div>
</template>

<style scoped>
.productos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.filtros {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.input-busqueda {
  flex: 1;
  min-width: 200px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-busqueda:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.select-categoria {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.select-categoria:focus {
  outline: none;
  border-color: #3498db;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.producto-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.producto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.producto-imagen {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f5f5f5;
}

.producto-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.producto-nombre {
  font-size: 1.15rem;
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.producto-categoria {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0 0 8px 0;
}

.producto-precio {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.producto-acciones {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.btn-carrito {
  flex: 1;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-carrito:hover {
  background: #388E3C;
}

.btn-detalle {
  flex: 1;
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-detalle:hover {
  background: #1976D2;
}

.sin-resultados {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
  margin-top: 30px;
}
</style>


