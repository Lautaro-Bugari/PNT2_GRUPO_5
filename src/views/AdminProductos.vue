<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'

const router = useRouter()
const storeProducto = useStoreProducto()

const productos = ref([])
const cargando = ref(true)
const error = ref('')

const cargarProductos = async () => {
  cargando.value = true
  error.value = ''
  try {
    productos.value = await storeProducto.getAllProductos()
  } catch (err) {
    console.error(err)
    error.value = 'Error al cargar los productos'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarProductos)

const irACrear = () => router.push('/producto/nuevo')
const irAEditar = (id) => router.push(`/producto/editar/${id}`)
const verDetalle = (id) => router.push(`/producto/${id}`)

const desactivar = async (id) => {
  if (!confirm('¿Estás seguro de desactivar este producto?')) return
  try {
    await storeProducto.desactivarProducto(id)
    await cargarProductos()
  } catch (error) {
    alert('Error al desactivar el producto')
  }
}

const reactivar = async (id) => {
  if (!confirm('¿Estás seguro de reactivar este producto?')) return
  try {
    await storeProducto.reactivarProducto(id)
    await cargarProductos()
  } catch (error) {
    alert('Error al reactivar el producto')
  }
}
</script>

<template>
  <div >
    <div >
      <h1>Gestión de Productos</h1>
      <button @click="irACrear" class="btn-primary">+ Nuevo Producto</button>
    </div>

    <div v-if="cargando" >Cargando productos...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.nombre }}</td>
            <td>${{ producto.precio }}</td>
            <td>{{ producto.stock }}</td>
            <td>{{ producto.categoria?.nombre || 'Sin categoría' }}</td>
            <td>
              <span :class="producto.habilitado ? 'badge-activo' : 'badge-inactivo'">
                {{ producto.habilitado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td >
              <button @click="verDetalle(producto.id)" class="btn-ver" title="Ver">👁️</button>
              <button @click="irAEditar(producto.id)" class="btn-editar" title="Editar">✏️</button>
              <button
                v-if="producto.habilitado"
                @click="desactivar(producto.id)"
                class="btn-desactivar"
                title="Desactivar"
              >
                ⛔
              </button>
              <button
                v-else
                @click="reactivar(producto.id)"
                class="btn-reactivar"
                title="Reactivar"
              >
                ✅
              </button>
            </td>
          </tr>
          <tr v-if="productos.length === 0">
            <td colspan="7" class="text-center">No hay productos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>