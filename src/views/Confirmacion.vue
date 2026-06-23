<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStorePedidos } from "../stores/storePedidos"
import { useAuthStore } from "../stores/authStore"

const route = useRoute()
const router = useRouter()
const storePedidos = useStorePedidos()
const authStore = useAuthStore()

const idPedido = computed(() => route.params.idPedido)
const pedido = computed(() => storePedidos.obtenerPedido(idPedido.value))

const estados = ["Recibido", "Preparando", "En camino", "Listo para retirar"]

const indexEstadoActual = computed(() => {
  if (!pedido.value) return 0
  return estados.indexOf(pedido.value.estadoActual)
})

const cambiarEstado = (nuevoEstado) => {
  if (pedido.value) {
    storePedidos.actualizarEstadoPedido(pedido.value.idPedido, nuevoEstado)
  }
}

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
        <div class="simulador-estados">
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
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  color: #2b2b2b;
}

h1 {
  font-size: 30px;
  font-weight: 800;
  color: #e60000;
  margin: 0 0 10px 0;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-top: 0;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.pedido-no-encontrado {
  text-align: center;
  padding: 50px 30px;
  background-color: #fff5f5;
  border-radius: 12px;
  border: 1px solid #f8d7da;
  color: #b52a37;
  max-width: 500px;
  margin: 40px auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.exito-encabezado {
  text-align: center;
  background-color: #ffffff;
  padding: 40px 30px;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.icono-exito {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 15px;
}

.nro-tracking {
  font-size: 1.3rem;
  color: #333;
  margin: 8px 0;
}

.nro-tracking strong {
  color: #e60000;
}

.fecha-pedido {
  font-size: 0.95rem;
  color: #666;
}

.tracking-seccion {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.stepper {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 40px 0;
}

.stepper::before {
  content: '';
  position: absolute;
  top: 22px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #eaeaea;
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
  border: 4px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #999;
  font-size: 15px;
  transition: all 0.3s ease;
}

.step-label {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  font-weight: 600;
  text-align: center;
}

.step-completed .step-circle {
  background-color: #28a745;
  border-color: #28a745;
  color: #fff;
}

.step-completed .step-label {
  color: #28a745;
}

.step-active .step-circle {
  background-color: #e60000;
  border-color: #e60000;
  color: #fff;
  box-shadow: 0 0 0 5px rgba(230, 0, 0, 0.15);
}

.step-active .step-label {
  color: #e60000;
  font-weight: 700;
}

.simulador-estados {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #ddd;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.simulador-estados span {
  font-size: 13px;
  color: #777;
  font-weight: 700;
}

.btn-group-sim {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-sim {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #555;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-sim:hover:not(:disabled) {
  background-color: #f1f1f1;
  border-color: #333;
}

.btn-sim:disabled {
  background-color: #333;
  color: #fff;
  border-color: #333;
  cursor: default;
}

.detalles-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .detalles-grid {
    grid-template-columns: 1fr;
  }
}

.productos-seccion, .facturacion-seccion {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla-productos th {
  background-color: #f8f9fa;
  color: #444;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  padding: 12px;
  border-bottom: 2px solid #eaeaea;
}

.tabla-productos td {
  padding: 15px 12px;
  border-bottom: 1px solid #eee;
  font-size: 15px;
}

.td-img {
  width: 60px;
  text-align: center;
}

.img-producto {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.totales-caja {
  background-color: #fdfdfd;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.totales-caja p {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #555;
}

.total-final {
  border-top: 2px dashed #eaeaea;
  padding-top: 15px;
  margin-top: 15px !important;
  font-size: 20px !important;
  font-weight: 800;
  color: #e60000;
}

.datos-lista {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dato-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.dato-label {
  font-size: 13px;
  color: #777;
  font-weight: 700;
}

.dato-valor {
  font-size: 16px;
  color: #2b2b2b;
  font-weight: 500;
  margin-top: 4px;
}

.pedido-acciones {
  margin-top: 35px;
}

.btn {
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.2s, transform 0.1s;
  width: 100%;
}

.btn:active {
  transform: scale(0.99);
}

.btn-primary {
  background-color: #e60000;
  color: #fff;
}

.btn-primary:hover {
  background-color: #c90000;
}
</style>