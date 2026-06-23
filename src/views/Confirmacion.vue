<script setup>
import { computed, ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStorePedidos } from "../stores/storePedidos"
import { useAuthStore } from "../stores/authStore"

const route = useRoute()
const router = useRouter()
const storePedidos = useStorePedidos()
const authStore = useAuthStore()

const idPedido = ref(null)
const pedido = ref(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
      if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect:  `/pedido/${route.params.idPedido}` } })
    return
  }
  idPedido.value = route.params.idPedido
  try {
    const pedidoEncontrado = await storePedidos.obtenerPedido(idPedido.value)
    if (pedidoEncontrado) {
      pedido.value = pedidoEncontrado
    } else {
      error.value = "Pedido no encontrado"
    }
  } catch (err) {
    console.error(err)
    error.value = "Error al cargar el pedido"
  } finally {
    cargando.value = false
  }
})

// Estados de ciclo de vida del pedido (CU06)
const estados = ["Recibido", "Preparando", "En camino", "Listo para retirar"]

const indexEstadoActual = computed(() => {
  if (!pedido.value) return 0
  return estados.indexOf(pedido.value.estadoActual)
})

// cambio de estado para verificación
const cambiarEstado = async (nuevoEstado) => {
  if (!pedido.value) return
  try {
    await storePedidos.actualizarEstadoPedido(pedido.value.idPedido, nuevoEstado)
    pedido.value.estadoActual = nuevoEstado
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    alert('No se pudo actualizar el estado')
  }
}

// Formatear fecha
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ""
  const d = new Date(fechaStr)
  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}
</script>

<template>
  <div class="confirmacion-container">

      <div v-if="cargando">Cargando pedido...</div>

    <div v-else-if="error" class="pedido-no-encontrado">
      <h2>⚠️ {{ error }}</h2>
      <p>No se pudo localizar el pedido con ID #{{ idPedido }}.</p>
      <button class="btn btn-primary" @click="router.push('/')">Volver al Inicio</button>
    </div>

    <div v-if="!pedido" class="pedido-no-encontrado">
      <h2>⚠️ Pedido no encontrado</h2>
      <p>No se pudo localizar el pedido con ID #{{ idPedido }}.</p>
      <button class="btn btn-primary" @click="router.push('/')">Volver al Inicio</button>
    </div>

    <div v-else class="pedido-detalle">
      <div class="exito-encabezado">
        <span class="icono-exito">🎉</span>
        <h1>¡Pedido Confirmado!</h1>
        <p class="nro-tracking">Número de tracking: <strong>#{{ pedido.idPedido }}</strong></p>
        <p class="fecha-pedido">Realizado el: {{ formatearFecha(pedido.fecha) }}</p>
      </div>

      <!-- Barra de Estado Visual del Tracking (CU06) -->
      <section class="tracking-seccion">
        <h2>Estado del Pedido</h2>
        <div class="stepper">
          <div 
            v-for="(estado, idx) in estados" 
            :key="estado" 
            class="step"
            :class="{ 
              'step-active': idx === indexEstadoActual, 
              'step-completed': idx < indexEstadoActual 
            }"
          >
            <div class="step-circle">
              <span v-if="idx < indexEstadoActual">✓</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="step-label">{{ estado }}</div>
          </div>
        </div>

        <!-- Controles de simulación de estado para testing -->
        <div v-if="authStore.esAdmin" class="simulador-estados">
          <span>🛠️ Cambiar estado para verificar tracking:</span>
          <div class="btn-group-sim">
            <button 
              v-for="estado in estados" 
              :key="estado"
              class="btn-sim"
              :disabled="pedido.estadoActual === estado"
              @click="cambiarEstado(estado)"
            >
              {{ estado }}
            </button>
          </div>
        </div>
      </section>

      <div class="detalles-grid">
        <!-- Resumen de Productos (Solo Lectura - RN7) -->
        <section class="productos-seccion">
          <h2>Productos Comprados</h2>
          <table class="tabla-productos">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pedido.items" :key="item.id">
                <td class="td-img">
                  <img :src="item.imagen" :alt="item.nombre" class="img-producto" />
                </td>
                <td>{{ item.nombre }}</td>
                <td><strong>{{ item.cantidad }}</strong></td>
                <td>${{ item.precioUnitario.toLocaleString() }}</td>
                <td>${{ (item.precioUnitario * item.cantidad).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <div class="totales-caja">
            <p><span>Subtotal:</span> <span>${{ pedido.subtotal.toLocaleString() }}</span></p>
            <p>
              <span>Costo de Envío:</span> 
              <span>{{ pedido.costoEnvio === 0 ? 'GRATIS' : '$' + pedido.costoEnvio.toLocaleString() }}</span>
            </p>
            <p class="total-final">
              <span>Total consolidado:</span> 
              <span>${{ pedido.totalFinal.toLocaleString() }}</span>
            </p>
          </div>
        </section>

        <!-- Datos de Facturación (Solo Lectura - RN7) -->
        <section class="facturacion-seccion">
          <h2>Datos de Facturación y Entrega</h2>
          <div class="datos-lista">
            <div class="dato-item">
              <span class="dato-label">Razón Social / Nombre:</span>
              <span class="dato-valor">{{ pedido.datosFacturacion.nombreCompleto }}</span>
            </div>
            
            <div class="dato-item">
              <span class="dato-label">Tipo de Factura:</span>
              <span class="dato-valor">Factura {{ pedido.datosFacturacion.tipoFactura }}</span>
            </div>

            <div v-if="pedido.datosFacturacion.tipoFactura === 'A'" class="dato-item">
              <span class="dato-label">CUIT:</span>
              <span class="dato-valor">{{ pedido.datosFacturacion.cuit }}</span>
            </div>

            <div class="dato-item">
              <span class="dato-label">Método de Entrega:</span>
              <span class="dato-valor">
                {{ pedido.datosFacturacion.metodoEntrega === 'Retiro' ? 'Retiro en depósito' : 'Envío a domicilio' }}
              </span>
            </div>

            <div class="dato-item">
              <span class="dato-label">Método de Pago:</span>
              <span class="dato-valor">{{ pedido.datosFacturacion.metodoPago }}</span>
            </div>
          </div>

          <div class="pedido-acciones">
            <button class="btn btn-primary btn-volver" @click="router.push('/productos')">
              📦 Continuar Comprando
            </button>
          </div>
        </section>
      </div>

    </div>
  </div>
</template>

<style scoped>
.confirmacion-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.pedido-no-encontrado {
  text-align: center;
  padding: 50px;
  background-color: #fdf2f2;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}

.exito-encabezado {
  text-align: center;
  background-color: #ebf9eb;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #d4edda;
  margin-bottom: 25px;
}

.icono-exito {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 10px;
}

.nro-tracking {
  font-size: 1.25rem;
  color: #155724;
  margin: 5px 0;
}

.fecha-pedido {
  font-size: 0.95rem;
  color: #666;
}

.tracking-seccion {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

h2 {
  color: #333;
  margin-top: 0;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

/* Stepper para Barra de Estado */
.stepper {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 30px 0;
}

.stepper::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #e0e0e0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #fff;
  border: 4px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #999;
  transition: all 0.3s ease;
}

.step-label {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #666;
  font-weight: bold;
  text-align: center;
}

/* Clases de estado completado y activo */
.step-completed .step-circle {
  background-color: #2ecc71;
  border-color: #2ecc71;
  color: #fff;
}

.step-completed .step-label {
  color: #27ae60;
}

.step-active .step-circle {
  background-color: #3498db;
  border-color: #3498db;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.25);
}

.step-active .step-label {
  color: #2980b9;
}

/* Simulador de estados */
.simulador-estados {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed #ccc;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.simulador-estados span {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: bold;
}

.btn-group-sim {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-sim {
  padding: 5px 12px;
  font-size: 0.8rem;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  color: #475569;
  cursor: pointer;
  border-radius: 4px;
}

.btn-sim:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #1e293b;
}

.btn-sim:disabled {
  background-color: #3498db;
  color: #fff;
  border-color: #3498db;
  cursor: default;
}

/* Detalles Grid */
.detalles-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .detalles-grid {
    grid-template-columns: 1fr;
  }
}

.productos-seccion, .facturacion-seccion {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.tabla-productos th, .tabla-productos td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.tabla-productos th {
  background-color: #f5f5f5;
}

.td-img {
  width: 60px;
  text-align: center;
}

.img-producto {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.totales-caja {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eaeaea;
}

.totales-caja p {
  margin: 6px 0;
  display: flex;
  justify-content: space-between;
}

.total-final {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 1.15rem;
  font-weight: bold;
  color: #2c3e50;
}

.datos-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dato-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.dato-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: bold;
}

.dato-valor {
  font-size: 1.05rem;
  color: #2c3e50;
  margin-top: 2px;
}

.pedido-acciones {
  margin-top: 30px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
}

.btn-primary {
  background-color: #3498db;
  color: #fff;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-volver {
  width: 100%;
}
</style>
