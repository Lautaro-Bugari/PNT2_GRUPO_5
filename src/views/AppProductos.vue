<script setup>
import { ref, computed, onMounted } from "vue"
import { useStoreCarrito } from "../stores/storeCarrito"
import AvisoLogin from "./AvisoLogin.vue"
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const storeCarrito = useStoreCarrito()

const productos = ref([])
const busqueda = ref("")
const avisoLoginVisible = ref(false)
let idProductoSeleccionado = null
const categoriaSeleccionada = ref("Todos")

const url = "https://www.mockachino.com/9d6594f6-711f-4c/productos"

onMounted(async () => {
  const response = await fetch(url)
  const data = await response.json()
  productos.value = data.productos
})

const categorias = computed(() => {
  const lista = productos.value.map(producto => producto.categoria)
  return ["Todos", ...new Set(lista)]
})

const productosFiltrados = computed(() => {
  if (categoriaSeleccionada.value === "Todos" && busqueda.value === "") return productos.value
  return productos.value.filter(producto => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideCategoria =
      categoriaSeleccionada.value === "Todos" || producto.categoria === categoriaSeleccionada.value
    return coincideBusqueda && coincideCategoria
  })
})

const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    idProductoSeleccionado = producto.id
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(producto)
}

const irAlDetalle = (id) => {
  router.push(`/productos/${id}`)
}
</script>

<template>
  <div class="productos-container">
    <h1>Productos</h1>

    <div class="filtros-barra">
      <input
        v-model="busqueda"
        placeholder="🔍 Buscar producto..."
        class="input-busqueda"
      />
      <select v-model="categoriaSeleccionada" class="select-categoria">
        <option v-for="categoria in categorias" :key="categoria">
          {{ categoria }}
        </option>
      </select>
    </div>

    <AvisoLogin
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="router.push({
        path: '/login',
        query: { redirect: `/productos/${idProductoSeleccionado}` }
      })"
    />

    <div class="grilla-productos">
      <div
        v-for="producto in productosFiltrados"
        :key="producto.id"
        class="tarjeta"
        :class="{ 'sin-stock': !producto.hayStock }"
      >
        <!-- Imagen clickeable al detalle -->
        <div class="tarjeta-imagen-wrap" @click="irAlDetalle(producto.id)">
          <img :src="producto.imagen" :alt="producto.nombre" class="tarjeta-imagen" />
          <span v-if="!producto.hayStock" class="badge-sin-stock">SIN STOCK</span>
          <span v-if="producto.esOferta" class="badge-oferta">🔥 OFERTA</span>
        </div>

        <div class="tarjeta-body">
          <p class="tarjeta-categoria">{{ producto.categoria }}</p>
          <h3 class="tarjeta-nombre" @click="irAlDetalle(producto.id)">
            {{ producto.nombre }}
          </h3>
          <strong class="tarjeta-precio">${{ producto.precio.toLocaleString("es-AR") }}</strong>

          <div class="tarjeta-acciones">
            <button class="btn btn-detalle" @click="irAlDetalle(producto.id)">
              🔍 Ver detalle
            </button>
            <button
              v-if="producto.hayStock"
              class="btn btn-agregar"
              @click="verificarLogin(producto)"
            >
              🛒 Agregar
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="productosFiltrados.length === 0" class="sin-resultados">
      No se encontraron productos con ese criterio.
    </p>
  </div>
</template>

<style scoped>
.productos-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
  font-family: sans-serif;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.filtros-barra {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.input-busqueda {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.select-categoria {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
}

.grilla-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.tarjeta {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.tarjeta:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.tarjeta.sin-stock {
  opacity: 0.65;
}

.tarjeta-imagen-wrap {
  position: relative;
  cursor: pointer;
}

.tarjeta-imagen {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.badge-sin-stock {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #e74c3c;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge-oferta {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f39c12;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.tarjeta-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tarjeta-categoria {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin: 0 0 4px;
}

.tarjeta-nombre {
  font-size: 0.95rem;
  color: #2c3e50;
  margin: 0 0 8px;
  cursor: pointer;
  line-height: 1.3;
}

.tarjeta-nombre:hover {
  color: #3498db;
}

.tarjeta-precio {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 14px;
}

.tarjeta-acciones {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-detalle {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-detalle:hover {
  background: #dfe6e9;
}

.btn-agregar {
  background: #2ecc71;
  color: #fff;
}

.btn-agregar:hover {
  background: #27ae60;
}

.sin-resultados {
  text-align: center;
  color: #888;
  margin-top: 40px;
  font-size: 1rem;
}
</style>
