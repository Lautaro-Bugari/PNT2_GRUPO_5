<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreCategoria } from '../stores/storeCategoria'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const storeCategoria = useStoreCategoria()
const authStore = useAuthStore()

const categorias = ref([])
const cargando = ref(true)
const error = ref('')

const cargarCategorias = async () => {
  cargando.value = true
  error.value = ''
  try {
    categorias.value = await storeCategoria.getAll()
  } catch (err) {
    console.error(err)
    error.value = 'Error al cargar categorías'
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: '/login', query: { redirect: '/admin/categorias' } })
    return
  }
  if (!authStore.esAdmin) {
    router.push({ path: '/' })
    return
  }
  await cargarCategorias()
})

const irACrear = () => router.push('/categoria/nuevo')
const irAEditar = (id) => router.push(`/categoria/editar/${id}`)
</script>

<template>
  <div class="admin-container">
    <div class="header">
      <h1>Gestión de Categorías</h1>
      <button class="btn-primary" @click="irACrear">+ Nueva Categoría</button>
    </div>

    <div v-if="cargando" class="loading">Cargando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categorias" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td>{{ cat.nombre }}</td>
            <td>{{ cat.descripcion || 'Sin descripción' }}</td>
            <td class="acciones">
              <button @click="irAEditar(cat.id)" class="btn-editar">✏️ Editar</button>
            </td>
          </tr>
          <tr v-if="categorias.length === 0">
            <td colspan="4" class="text-center">No hay categorías registradas.</td>
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

.acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.acciones button {
  padding: 6px 12px;
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

.btn-editar {
  background: #FFC107;
  color: black;
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