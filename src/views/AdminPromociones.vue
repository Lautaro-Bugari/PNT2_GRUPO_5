<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStorePromos } from '../stores/storePromos'
import { useAuthStore } from '../stores/authStore'
const authStore = useAuthStore()
const router = useRouter()
const storePromos = useStorePromos()
const route = useRoute()
const promociones = ref([])
const cargando = ref(true)
const error = ref('')

const cargarPromociones = async () => {
  cargando.value = true
  error.value = ''
  try {
    promociones.value = await storePromos.getAllPromociones()
  } catch (err) {
    console.error(err)
    error.value = 'Error al cargar promociones'
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/admin/promociones" } })
    return
  }

  if (!authStore.esAdmin) {
    router.push({ path: "/" })
    return
  }

  await cargarPromociones()
})


const irACrear = () => router.push('/promocion/nuevo')
const irAEditar = (id) => router.push(`/promocion/editar/${id}`)
const verDetalle = (id) => router.push(`/promociones/${id}`)

const desactivar = async (id) => {
  if (!confirm('¿Desactivar esta promoción?')) return
  try {
    await storePromos.desactivarPromocion(id)
    await cargarPromociones()
  } catch (error) {
    alert('Error al desactivar')
  }
}

const reactivar = async (id) => {
  try {
    await storePromos.reactivarPromocion(id)
    await cargarPromociones()
  } catch (error) {
    alert('Error al reactivar')
  }
}
</script>

<template>
  <div class="admin-container">
    <div class="header">
      <h1>Gestión de Promociones</h1>
      <button class="btn-primary" @click="irACrear">+ Nueva Promoción</button>
    </div>

    <div v-if="cargando" class="loading">Cargando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Descuento</th>
            <th>Fecha Salida</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in promociones" :key="promo.id">
            <td>{{ promo.id }}</td>
            <td>{{ promo.nombre }}</td>
            <td>${{ promo.precio }}</td>
            <td>{{ promo.descuento || 0 }}%</td>
            <td>{{ new Date(promo.fechaSalida).toLocaleDateString() }}</td>
            <td>{{ new Date(promo.fechaFin).toLocaleDateString() }}</td>
            <td>
              <span :class="promo.habilitado ? 'badge-activo' : 'badge-inactivo'">
                {{ promo.habilitado ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="acciones">
              <button @click="verDetalle(promo.id)" class="btn-ver" title="Ver">👁️</button>
              <button @click="irAEditar(promo.id)" class="btn-editar" title="Editar">✏️</button>
              <button
                v-if="promo.habilitado"
                @click="desactivar(promo.id)"
                class="btn-desactivar"
                title="Desactivar"
              >
                ⛔
              </button>
              <button
                v-else
                @click="reactivar(promo.id)"
                class="btn-reactivar"
                title="Reactivar"
              >
                ✅
              </button>
            </td>
          </tr>
          <tr v-if="promociones.length === 0">
            <td colspan="8" class="text-center">No hay promociones registradas.</td>
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
.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
th {
  background: #f2f2f2;
}
.badge-activo {
  color: green;
  font-weight: bold;
}
.badge-inactivo {
  color: red;
  font-weight: bold;
}
.acciones button {
  margin: 0 4px;
  padding: 5px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-ver {
  background: #2196F3;
  color: white;
}
.btn-editar {
  background: #FFC107;
  color: black;
}
.btn-desactivar {
  background: #f44336;
  color: white;
}
.btn-reactivar {
  background: #4CAF50;
  color: white;
}
.loading,
.error {
  text-align: center;
  padding: 20px;
}
.text-center {
  text-align: center;
}
</style>