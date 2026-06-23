<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'
import { useStorePedidos } from '../stores/storePedidos'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const storeProducto = useStoreProducto()
const storePedidos = useStorePedidos()

const cargando = ref(true)
const productos = ref([])
const pedidos = ref([])

// Resumen
const totalProductos = computed(() => productos.value.length)
const totalPedidos = computed(() => pedidos.value.length)
const ingresosTotales = computed(() => {
  return pedidos.value.reduce((sum, p) => sum + (p.totalFinal || 0), 0)
})

// Productos con menos stock (top 10)
const productosMenosStock = computed(() => {
  return [...productos.value]
    .filter(p => p.stock !== undefined)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)
})

// Productos más vendidos (top 10)
const productosMasVendidos = computed(() => {
  const mapa = {}
  pedidos.value.forEach(pedido => {
    ;(pedido.items || []).forEach(item => {
      const id = item.id
      const cantidad = item.cantidad || 0
      if (!mapa[id]) mapa[id] = 0
      mapa[id] += cantidad
    })
  })
  const ordenados = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  return ordenados.map(([id, cantidad]) => {
    const prod = productos.value.find(p => p.id == id)
    return {
      id,
      nombre: prod?.nombre || `Producto ${id}`,
      cantidad
    }
  })
})

// Ventas por mes (últimos 6 meses)
const ventasPorMes = computed(() => {
  const meses = {}
  const hoy = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    meses[key] = 0
  }
  pedidos.value.forEach(p => {
    if (!p.fecha) return
    const fecha = new Date(p.fecha)
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}`
    if (meses.hasOwnProperty(key)) {
      meses[key] += p.totalFinal || 0
    }
  })
  const entries = Object.entries(meses)
  const max = Math.max(...entries.map(([,v]) => v), 1)
  return entries.map(([mes, total]) => ({ mes, total, max }))
})

// Distribución de estados
const distribucionEstados = computed(() => {
  const mapa = {}
  pedidos.value.forEach(p => {
    const estado = p.estadoActual || 'Recibido'
    mapa[estado] = (mapa[estado] || 0) + 1
  })
  return Object.entries(mapa).map(([estado, count]) => ({ estado, count }))
})

// Colores para estados
const coloresEstados = {
  'Recibido': '#3498db',
  'Preparando': '#f39c12',
  'En camino': '#2ecc71',
  'Listo para retirar': '#9b59b6'
}

const cargarDatos = async () => {
  cargando.value = true
  try {
    productos.value = await storeProducto.getAllProductos() || []
    pedidos.value = await storePedidos.obtenerPedidos() || []
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: '/login', query: { redirect: '/admin/estadisticas' } })
    return
  }
  if (!authStore.esAdmin) {
    router.push({ path: '/' })
    return
  }
  await cargarDatos()
})
</script>

<template>
  <div class="admin-estadisticas">
    <h1 class="titulo-admin">📊 Estadísticas del Sistema</h1>

    <div v-if="cargando" class="estado-mensaje">Cargando datos...</div>

    <div v-else>
      <!-- Tarjetas de resumen -->
      <div class="tarjetas-resumen">
        <div class="tarjeta">
          <span class="tarjeta-icon">📦</span>
          <div>
            <div class="tarjeta-valor">{{ totalProductos }}</div>
            <div class="tarjeta-etiqueta">Productos activos</div>
          </div>
        </div>
        <div class="tarjeta">
          <span class="tarjeta-icon">🧾</span>
          <div>
            <div class="tarjeta-valor">{{ totalPedidos }}</div>
            <div class="tarjeta-etiqueta">Pedidos totales</div>
          </div>
        </div>
        <div class="tarjeta">
          <span class="tarjeta-icon">💰</span>
          <div>
            <div class="tarjeta-valor">${{ ingresosTotales.toLocaleString() }}</div>
            <div class="tarjeta-etiqueta">Ingresos totales</div>
          </div>
        </div>
      </div>

      <div class="graficos-grid">
        <!-- Productos con menos stock -->
        <div class="grafico-card">
          <h3>⚠️ Productos con menos stock</h3>
          <div v-if="productosMenosStock.length === 0" class="sin-datos">
            No hay productos con stock bajo.
          </div>
          <div v-else class="barras">
            <div v-for="p in productosMenosStock" :key="p.id" class="barra-item">
              <span class="barra-label">{{ p.nombre }}</span>
              <div class="barra-contenedor">
                <div class="barra" :style="{ width: Math.min((p.stock / 100) * 100, 100) + '%' }"></div>
              </div>
              <span class="barra-valor">{{ p.stock }}</span>
            </div>
          </div>
        </div>

        <!-- Productos más vendidos -->
        <div class="grafico-card">
          <h3>🏆 Productos más vendidos</h3>
          <div v-if="productosMasVendidos.length === 0" class="sin-datos">
            No hay ventas registradas.
          </div>
          <div v-else class="barras">
            <div v-for="p in productosMasVendidos" :key="p.id" class="barra-item">
              <span class="barra-label">{{ p.nombre }}</span>
              <div class="barra-contenedor">
                <div class="barra barra-ventas" :style="{ width: Math.min((p.cantidad / productosMasVendidos[0].cantidad) * 100, 100) + '%' }"></div>
              </div>
              <span class="barra-valor">{{ p.cantidad }}</span>
            </div>
          </div>
        </div>

        <!-- Ventas por mes -->
        <div class="grafico-card">
          <h3>📈 Ventas por mes</h3>
          <div v-if="ventasPorMes.length === 0 || ventasPorMes.every(v => v.total === 0)" class="sin-datos">
            No hay ventas en los últimos meses.
          </div>
          <div v-else>
            <div v-for="v in ventasPorMes" :key="v.mes" class="barra-item">
              <span class="barra-label">{{ v.mes }}</span>
              <div class="barra-contenedor">
                <div class="barra barra-ventas-mes" :style="{ width: ((v.total / v.max) * 100) + '%' }"></div>
              </div>
              <span class="barra-valor">${{ v.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Distribución de estados -->
        <div class="grafico-card">
          <h3>📌 Estado de pedidos</h3>
          <div v-if="distribucionEstados.length === 0" class="sin-datos">
            No hay pedidos.
          </div>
          <div v-else class="estados-lista">
            <div v-for="e in distribucionEstados" :key="e.estado" class="estado-item">
              <span class="estado-badge" :style="{ backgroundColor: coloresEstados[e.estado] || '#999' }">
                {{ e.estado }}
              </span>
              <span class="estado-count">{{ e.count }} pedido{{ e.count !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="acciones">
        <button @click="cargarDatos" class="btn-actualizar">🔄 Actualizar datos</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-estadisticas {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #2b2b2b;
}

.titulo-admin {
  font-size: 34px;
  font-weight: 800;
  color: #e60000;
  margin-bottom: 30px;
  border-bottom: 3px solid #333;
  padding-bottom: 12px;
}

.estado-mensaje {
  text-align: center;
  padding: 50px;
  font-size: 16px;
  font-weight: 500;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tarjetas-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 35px;
}

.tarjeta {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px 25px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tarjeta-icon {
  font-size: 2.5rem;
}

.tarjeta-valor {
  font-size: 28px;
  font-weight: 800;
  color: #2b2b2b;
}

.tarjeta-etiqueta {
  font-size: 14px;
  color: #777;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.graficos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .graficos-grid {
    grid-template-columns: 1fr;
  }
}

.grafico-card {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.grafico-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.sin-datos {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.barras {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.barra-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.barra-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 80px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.barra-contenedor {
  flex: 1;
  height: 20px;
  background-color: #f1f1f1;
  border-radius: 10px;
  overflow: hidden;
}

.barra {
  height: 100%;
  background-color: #e60000;
  border-radius: 10px;
  transition: width 0.4s ease;
}

.barra-ventas {
  background-color: #3498db;
}

.barra-ventas-mes {
  background-color: #2ecc71;
}

.barra-valor {
  font-size: 13px;
  font-weight: 700;
  color: #2b2b2b;
  min-width: 40px;
  text-align: right;
}

.estados-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.estado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.estado-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
  color: white;
}

.estado-count {
  font-weight: 600;
  color: #2b2b2b;
}

.acciones {
  text-align: center;
  margin-top: 20px;
}

.btn-actualizar {
  background-color: #e60000;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-actualizar:hover {
  background-color: #c90000;
}
</style>