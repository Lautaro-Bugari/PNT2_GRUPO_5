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
  <div class="contenedor-admin">
    <h1 class="titulo-admin">Panel de Administración: Categorías</h1>

    <div class="barra-acciones">
      <button class="boton boton-primario" @click="irACrear">
        + Nueva Categoría
      </button>
    </div>

    <div v-if="cargando" class="estado-mensaje">
      Cargando categorías...
    </div>

    <div v-else-if="error" class="estado-mensaje error">
      {{ error }}
    </div>

    <div v-else class="tabla-contenedor">
      <table class="tabla-admin">
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
            <td>#{{ cat.id }}</td>

            <td class="nombre-destacado">
              {{ cat.nombre }}
            </td>

            <td>
              {{ cat.descripcion || 'Sin descripción' }}
            </td>

            <td class="acciones-tabla">
              <button
                class="boton-accion boton-editar"
                @click="irAEditar(cat.id)"
              >
                ✏️
              </button>
            </td>
          </tr>

          <tr v-if="categorias.length === 0">
            <td colspan="4" class="estado-mensaje">
              No hay categorías registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>


.contenedor-admin {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  color: #2b2b2b;
}

.titulo-admin {
  font-size: 34px;
  font-weight: 800;
  color: #e60000;
  margin-bottom: 25px;
  border-bottom: 3px solid #333;
  padding-bottom: 12px;
}

.barra-acciones {
  margin-bottom: 20px;
}

.boton {
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.boton-primario {
  background: #4CAF50;
  color: white;
}
.boton-primario:hover {
  background: #45a049;
}



.tabla-contenedor {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.tabla-admin {
  width: 100%;
  border-collapse: collapse;
}

.tabla-admin th {
  background: #f8f9fa;
  padding: 14px;
  text-transform: uppercase;
  font-size: 13px;
  border-bottom: 2px solid #eee;
}

.tabla-admin td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.nombre-destacado {
  font-weight: 700;
}


.acciones-tabla {
  display: flex;
  gap: 8px;
}

.boton-accion {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
}

.boton-editar {
  background: #f39c12;
}


.estado-mensaje {
  text-align: center;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
}

.error {
  color: #e74c3c;
}
</style>