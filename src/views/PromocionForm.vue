<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorePromos } from '../stores/storePromos'
import { useStoreProducto } from '../stores/storeProducto'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const storePromos = useStorePromos()
const storeProducto = useStoreProducto()

const esEdicion = computed(() => !!route.params.id)
const cargando = ref(true)

const productosDisponibles = ref([])


const productosSeleccionados = ref([])
const cantidadPorProducto = ref({})
// ---------- DATOS DE LA PROMOCIÓN ----------
const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  precio: 0,
  descuento: 0,
  fechaSalida: '',
  fechaFin: '',
  habilitado: false,
})

const hoy = computed(() => {
  const fecha = new Date()
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
})

onMounted(async () => {
    if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/admin/promociones" } })
    return
  }

  if (!authStore.esAdmin) {
    router.push({ path: "/" })
    return
  }
  await cargarProductos()
  await cargarPromocion()
  cargando.value = false
})


// ---------- CARGAR PRODUCTOS DISPONIBLES ----------
const cargarProductos = async () => {
  try {
    productosDisponibles.value = await storeProducto.getAllProductos()
  } catch (error) {
    console.error('Error al cargar productos:', error)
    productosDisponibles.value = []
  }
}

// ---------- CARGAR PROMOCIÓN PARA EDICIÓN ----------
const cargarPromocion = async () => {
  if (!esEdicion.value) return
  try {
    const promo = await storePromos.getPromocionById(route.params.id)
    if (promo) {
      form.value = {
        id: promo.id,
        nombre: promo.nombre,
        descripcion: promo.descripcion || '',
        precio: promo.precio,
        descuento: promo.descuento || 0,
        fechaSalida: promo.fechaSalida?.split('T')[0] || '',
        fechaFin: promo.fechaFin?.split('T')[0] || '',
        habilitado: promo.habilitado === true,
      }

      const incluidos = promo.productosIncluidos || []
      productosSeleccionados.value = incluidos.map(p => p.id)
      incluidos.forEach(p => {
        cantidadPorProducto.value[p.id] = p.PromoProducto?.cantidad || 1
      })
    } else {
      alert('Promoción no encontrada')
      router.push('/admin/promociones')
    }
  } catch (error) {
    console.error(error)
    alert('Error al cargar la promoción')
  }
}

// ---------- GUARDAR ----------
const guardar = async () => {
  try {
    const productosIncluidos = productosSeleccionados.value.map(id => ({
      id: id,
      cantidad: cantidadPorProducto.value[id] || 1
    }))

    const data = {
      ...form.value,
      productosIncluidos
    }


if (data.fechaSalida) {
    const fecha = new Date(data.fechaSalida);
    fecha.setDate(fecha.getDate() + 1); // suma un día
    data.fechaSalida = fecha.toISOString();
}
if (data.fechaFin) {
    const fecha = new Date(data.fechaFin);
    fecha.setDate(fecha.getDate() + 1);
    data.fechaFin = fecha.toISOString();
}

    if (esEdicion.value) {
      await storePromos.updatePromocion(data.id, data)
    } else {
      await storePromos.createPromocion(data)
    }
    router.push('/admin/promociones')
  } catch (error) {
    console.error(error)
    alert('Error al guardar: ' + error.message)
  }
}

const cancelar = () => router.push('/admin/promociones')
</script>

<template>
  <div class="form-container">
    <h1>{{ esEdicion ? 'Editar Promoción' : 'Nueva Promoción' }}</h1>
    <form @submit.prevent="guardar">
      <!-- Campos básicos -->
      <div class="campo">
        <label>Nombre *</label>
        <input v-model="form.nombre" type="text" required />
      </div>
      <div class="campo">
        <label>Descripción</label>
        <textarea v-model="form.descripcion"></textarea>
      </div>
      <div class="campo">
        <label>Precio *</label>
        <input v-model.number="form.precio" type="number" step="0.01" min="0" required />
      </div>
      <div class="campo">
        <label>Descuento (%)</label>
        <input v-model.number="form.descuento" type="number" min="0" max="100" />
      </div>
      <div class="campo">
        <label>Fecha Salida *</label>
        <input v-model="form.fechaSalida" type="date" required  :min="hoy"/>
      </div>
      <div class="campo">
        <label>Fecha Fin *</label>
        <input v-model="form.fechaFin" type="date" required  :min="form.fechaSalida"/>
      </div>
            <div class="campo checkbox">
        <label>
            Habilitada
          <input v-model="form.habilitado" type="checkbox" />
        </label>
      </div>
      <div class="campo productos-section">
        <label>Productos incluidos</label>
        <div v-if="productosDisponibles.length === 0" class="sin-productos">
          No hay productos disponibles. <router-link to="/admin/productos">Crear producto</router-link>
        </div>
        <div v-else>
          <div
            v-for="producto in productosDisponibles"
            :key="producto.id"
            class="producto-selector"
          >
            <label class="producto-check">
              <input
                type="checkbox"
                :value="producto.id"
                v-model="productosSeleccionados"
              />
              {{ producto.nombre }} (Stock: {{ producto.stock }})
            </label>
            <input
              v-if="productosSeleccionados.includes(producto.id)"
              v-model.number="cantidadPorProducto[producto.id]"
              type="number"
              min="1"
              placeholder="Cantidad"
              class="cantidad-input"
            />
          </div>
        </div>
      </div>
      <div class="acciones">
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" class="btn-cancelar" @click="cancelar">❌ Cancelar</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-container h1 {
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #e60000;
  font-weight: 800;
  margin-top: 0;
}
.campo {
  margin-bottom: 15px;
}
.campo label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.campo input,
.campo textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.campo textarea {
  min-height: 80px;
}
.campo.checkbox label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: normal;
}

.productos-section {
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 10px;
}

.producto-selector {
display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; 
  gap: 15px;
  padding: 12px 16px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.producto-selector:hover {
  background-color: #fafafa;
  border-color: #ddd;
}

.producto-check {
display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: normal;
  flex: 1;
  min-width: 200px;
  margin: 0;
}

.producto-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.cantidad-input {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  text-align: center;
  flex-shrink: 0; /* Mantiene su tamaño horizontal siempre */
}

.cantidad-input:focus {
  border-color: #e60000;
  outline: none;
}

.sin-productos {
  color: #7f8c8d;
  font-style: italic;
}
.sin-productos a {
  color: #3498db;
  text-decoration: underline;
}

.acciones {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-guardar {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-cancelar {
  background: #ccc;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>