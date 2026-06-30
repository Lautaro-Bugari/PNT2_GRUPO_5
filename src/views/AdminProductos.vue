<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
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
  await storeProducto.desactivarProducto(id)
  await cargarProductos()
}

const reactivar = async (id) => {
  if (!confirm('¿Estás seguro de reactivar este producto?')) return
  await storeProducto.reactivarProducto(id)
  await cargarProductos()
}
</script>

<template>
  <div class="contenedor-admin">
    <h1 class="titulo-admin">Panel de Administración: Productos</h1>

    <div class="barra-acciones">
      <button @click="irACrear" class="boton boton-primario">
        + Nuevo Producto
      </button>
    </div>

    <div v-if="cargando" class="estado-mensaje">
      Cargando productos...
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
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>#{{ producto.id }}</td>
            <td class="nombre-destacado">{{ producto.nombre }}</td>
            <td>${{ producto.precio }}</td>
            <td>{{ producto.stock }}</td>
            <td>{{ producto.categoria?.nombre || 'Sin categoría' }}</td>

            <td>
              <span :class="['badge-estado', producto.habilitado ? 'activo' : 'inactivo']">
                {{ producto.habilitado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="acciones-tabla">
              <button class="boton-accion boton-ver" @click="verDetalle(producto.id)">👁️</button>
              <button class="boton-accion boton-editar" @click="irAEditar(producto.id)">✏️</button>

              <button
                v-if="producto.habilitado"
                class="boton-accion boton-eliminar"
                @click="desactivar(producto.id)"
              >⛔</button>

              <button
                v-else
                class="boton-accion boton-exito"
                @click="reactivar(producto.id)"
              >✅</button>
            </td>
          </tr>

          <tr v-if="productos.length === 0">
            <td colspan="7" class="estado-mensaje">
              No hay productos registrados.
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
.boton-primario:hover { background: #45a049; }

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

.boton-ver { background: #3498db; }
.boton-editar { background: #f39c12; }
.boton-eliminar { background: #e74c3c; }
.boton-exito { background: #2ecc71; }

.badge-estado {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.badge-estado.activo {
  background: #eafaf1;
  color: #27ae60;
}

.badge-estado.inactivo {
  background: #fdf2f2;
  color: #e74c3c;
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