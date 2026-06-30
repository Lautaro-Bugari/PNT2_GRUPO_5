<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
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

onMounted(async () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/admin/productos" } })
    return
  }

  if (!authStore.esAdmin) {
    router.push({ path: "/" })
    return
  }

  await cargarProductos()
})

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
  <div class="admin-container">
    <div class="header">
      <h1>Gestión de Productos</h1>
      <button @click="irACrear" class="btn-primary">+ Nuevo Producto</button>
    </div>

    <div v-if="cargando" class="loading">Cargando productos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
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
            <td class="acciones">
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

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

th, td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

.badge-activo {
  color: #27ae60;
  font-weight: bold;
  background: #eafaf1;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  
}

.badge-inactivo {
  color: #e74c3c;
  font-weight: bold;
  background: #fdf2f2;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.acciones {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.acciones button {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: opacity 0.2s;
}

.acciones button:hover {
  opacity: 0.8;
}

.btn-ver {
  background: #3498db;
  color: white;
}

.btn-editar {
  background: #f39c12;
  color: white;
}

.btn-desactivar {
  background: #e74c3c;
  color: white;
}

.btn-reactivar {
  background: #2ecc71;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.error {
  text-align: center;
  padding: 20px;
  color: #e74c3c;
  background: #fdf2f2;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.text-center {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}
</style>