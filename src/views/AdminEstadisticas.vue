<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'
import { useStorePedidos } from '../stores/storePedidos'
import { useAuthStore } from '../stores/authStore'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
)

const router = useRouter()
const authStore = useAuthStore()
const storeProducto = useStoreProducto()
const storePedidos = useStorePedidos()

const cargando = ref(true)
const productos = ref([])
const pedidos = ref([])

const totalProductos = computed(() => productos.value.length)
const totalPedidos = computed(() => pedidos.value.length)
const ingresosTotales = computed(() => {
  return pedidos.value.reduce((sum, p) => sum + (p.totalFinal || 0), 0)
})

// 1. Gráfico: Top 10 Más Vendidos (Barras)
const chartMasVendidos = computed(() => {
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

  const labels = ordenados.map(([id]) => {
    const prod = productos.value.find(p => p.id == id)
    return prod?.nombre || `Prod ${id}`
  })
  const data = ordenados.map(([, cantidad]) => cantidad)

  return {
    labels,
    datasets: [{
      label: 'Unidades Vendidas',
      backgroundColor: '#3498db', 
      borderRadius: 5,
      data
    }]
  }
})

// 2. Gráfico: Evolución de Ventas por Mes 
const chartVentasMes = computed(() => {
  const meses = {}
  const hoy = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    meses[key] = 0
  }
  pedidos.value.forEach(p => {
    const fechaOrigen = p.fecha || p.createdAt
    if (!fechaOrigen) return
    
    const fechaObj = new Date(fechaOrigen)
    if (isNaN(fechaObj.getTime())) return
    const anio = fechaObj.getFullYear()
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
    const key = `${anio}-${mes}`
    if (meses.hasOwnProperty(key)) {
      meses[key] += Number(p.totalFinal) || 0
    }
  })
  return {
    labels: Object.keys(meses),
    datasets: [{
      label: 'Ingresos ($)',
      borderColor: '#2ecc71', 
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      tension: 0.3,
      fill: true,
      data: Object.values(meses)
    }]
  }
})

// 3. Gráfico: Estados de Pedidos 
const chartEstados = computed(() => {
  const mapa = { 'Recibido': 0, 'Preparando': 0, 'En camino': 0, 'Listo para retirar': 0 }
  
  pedidos.value.forEach(p => {
    const estado = p.estadoActual || 'Recibido'
    if (mapa.hasOwnProperty(estado)) mapa[estado]++
  })

  return {
    labels: Object.keys(mapa),
    datasets: [{
      backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#9b59b6'],
      data: Object.values(mapa)
    }]
  }
})

// 4. Gráfico: Control de Stock Crítico (Barras Horizontales)
const chartStockCritico = computed(() => {
  const filtrados = [...productos.value]
    .filter(p => p.stock !== undefined)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)

  return {
    labels: filtrados.map(p => p.nombre),
    datasets: [{
      label: 'Stock Actual',
      backgroundColor: '#e74c3c',
      borderRadius: 5,
      data: filtrados.map(p => p.stock)
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}

const chartOptionsDoughnut = {
  responsive: true,
  maintainAspectRatio: false
}

const chartOptionsHorizontal = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false }
  }
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
  <div class="dash">
    <h1 class="titulo">📊 Estadísticas del Sistema</h1>
    <hr class="linea" />
    <div class="cards">
      <div class="card">
        <div class="icon">📦</div>
        <div class="info">
          <span class="num">{{ totalProductos }}</span>
          <span class="txt">Productos Activos</span>
        </div>
      </div>
      <div class="card">
        <div class="icon">📄</div>
        <div class="info">
          <span class="num">{{ totalPedidos }}</span>
          <span class="txt">Pedidos Totales</span>
        </div>
      </div>
      <div class="card">
        <div class="icon">💰</div>
        <div class="info">
          <span class="num">${{ ingresosTotales.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          <span class="txt">Ingresos Totales</span>
        </div>
      </div>
    </div>
    <div v-if="!cargando" class="graficos">
      
      <div class="grafico">
        <h3>⚠️ Productos con menos stock</h3>
        <div class="canvas-holder">
          <Bar :data="chartStockCritico" :options="chartOptionsHorizontal" />
        </div>
      </div>
      <div class="grafico">
        <h3>🏆 Productos más vendidos</h3>
        <div class="canvas-holder">
          <Bar :data="chartMasVendidos" :options="chartOptions" />
        </div>
      </div>
      <div class="grafico">
        <h3>📈 Evolución de Ventas por Mes</h3>
        <div class="canvas-holder">
          <Line :data="chartVentasMes" :options="chartOptions" />
        </div>
      </div>
      <div class="grafico">
        <h3>📌 Estado de pedidos</h3>
        <div class="canvas-holder dona">
          <Doughnut :data="chartEstados" :options="chartOptionsDoughnut" />
        </div>
      </div>
    </div>
    <div v-else class="loader">
      <p>Cargando datos...</p>
    </div>
  </div>
</template>

<style scoped>
.dash {
  padding: 20px;
  font-family: sans-serif;
}

.titulo {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.linea {
  border: 0;
  height: 1px;
  background: #ddd;
  margin-bottom: 25px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon {
  font-size: 35px;
}

.info {
  display: flex;
  flex-direction: column;
}

.num {
  font-size: 24px;
  font-weight: bold;
  color: #222;
}

.txt {
  font-size: 14px;
  color: #777;
  font-weight: 500;
}

.graficos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 25px;
}

.grafico {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.grafico h3 {
  font-size: 16px;
  color: #444;
  margin: 0;
  font-weight: 600;
}

.canvas-holder {
  position: relative;
  height: 300px;
  width: 100%;
}


.canvas-holder.dona {
  height: 260px;
}


.loader {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}
</style>