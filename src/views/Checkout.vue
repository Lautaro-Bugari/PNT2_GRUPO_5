<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStoreCarrito } from "../stores/storeCarrito"
import { useStorePedidos } from "../stores/storePedidos"
import { useAuthStore } from "../stores/authStore"

const storeCarrito = useStoreCarrito()
const storePedidos = useStorePedidos()
const authStore = useAuthStore()
const router = useRouter()

// Redirigir al login si el usuario no está autenticado
onMounted(() => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/checkout" } })
  }
})

// Cálculos reactivos
const subtotal = computed(() => {
  return storeCarrito.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
})

const costoEnvio = computed(() => {
  return subtotal.value >= 120000 ? 0 : 5000
})

const totalFinal = computed(() => {
  return subtotal.value + costoEnvio.value
})

const faltanteEnvioGratis = computed(() => {
  return 120000 - subtotal.value
})

// Control de cantidades
const incrementarCantidad = async (item) => {
  item.cantidad++
  await storeCarrito.guardarCarrito()
}

const decrementarCantidad = async (item) => {
  if (item.cantidad > 1) {
    item.cantidad--
  } else {
    // Si llega a 0, se remueve del carrito
    const index = storeCarrito.carrito.findIndex(i => i.id === item.id)
    if (index !== -1) {
      storeCarrito.carrito.splice(index, 1)
    }
  }
  await storeCarrito.guardarCarrito()
}

const vaciarElCarrito = async () => {
  storeCarrito.vaciarCarrito()
}

// Datos del formulario de facturación (CU05)
const form = ref({
  nombreCompleto: "",
  tipoFactura: "B", // Defecto Factura B (Consumidor Final)
  cuit: "",
  metodoEntrega: "Retiro",
  metodoPago: "Efectivo"
})

// Validación del formulario
const errorCuit = computed(() => {
  if (form.value.tipoFactura === "A") {
    const cuitLimpio = form.value.cuit.trim()
    if (cuitLimpio === "") {
      return "El CUIT es obligatorio para Factura A."
    }
    if (!/^\d+$/.test(cuitLimpio)) {
      return "El CUIT debe contener solo números."
    }
    if (cuitLimpio.length !== 11) {
      return "El CUIT debe tener exactamente 11 dígitos."
    }
  }
  return ""
})

const esFormularioValido = computed(() => {
  const nombreValido = form.value.nombreCompleto.trim() !== ""
  const facturaValida = form.value.tipoFactura === "B" || (form.value.tipoFactura === "A" && errorCuit.value === "")
  const metodoEntregaValido = ["Retiro", "Envio"].includes(form.value.metodoEntrega)
  const metodoPagoValido = ["Efectivo", "Transferencia"].includes(form.value.metodoPago)

  return nombreValido && facturaValida && metodoEntregaValido && metodoPagoValido
})

// Confirmar e ir a pantalla de éxito/tracking
const confirmarPedido = async () => {
  if (!esFormularioValido.value) return

  // Regla literal RN4
  if (subtotal.value > 50000) {
    alert("No se puede consolidar el pedido ya que el monto supera el piso máximo de $50.000.")
    return
  }

  try {
    const nuevoPedido = await storePedidos.crearPedido(
      form.value,
      subtotal.value,
      costoEnvio.value
    )
    // Redirigir a la pantalla de confirmación/tracking
    router.push(`/pedido/${nuevoPedido.idPedido}`)
  } catch (error) {
    console.error("Error al procesar el pedido:", error)
    alert("Hubo un error al confirmar tu pedido. Por favor, intenta de nuevo.")
  }
}
</script>

<template>
  <div class="checkout-container">
    <h1>Checkout de Compra</h1>

    <!-- 1. Flujo alternativo: Carrito Vacío -->
    <div v-if="storeCarrito.carrito.length === 0" class="carrito-vacio">
      <p>Tu carrito está vacío. ¡Visitá nuestro catálogo para empezar a comprar!</p>
      <button class="btn btn-primary" @click="router.push('/productos')">
        📦 Ver Productos
      </button>
    </div>

    <!-- 2. Carrito con Productos -->
    <div v-else class="checkout-content">
      
      <!-- Detalle del Carrito -->
      <section class="carrito-seccion">
        <h2>Detalle del Carrito</h2>
        <table class="tabla-carrito">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Pack</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in storeCarrito.carrito" :key="item.id">
              <td class="td-img">
                <img :src="item.imagen" :alt="item.nombre" class="img-producto" />
              </td>
              <td>{{ item.nombre }}</td>
              <td class="td-cantidades">
                <button class="btn-cant" @click="decrementarCantidad(item)">-</button>
                <span class="cantidad-num">{{ item.cantidad }}</span>
                <button class="btn-cant" @click="incrementarCantidad(item)">+</button>
              </td>
              <td>${{ item.precio.toLocaleString() }}</td>
              <td>${{ (item.precio * item.cantidad).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <div class="carrito-acciones">
          <button class="btn btn-danger" @click="vaciarElCarrito">🗑️ Vaciar Carrito</button>
        </div>

        <div class="totales-desglose">
          <p><strong>Subtotal:</strong> ${{ subtotal.toLocaleString() }}</p>
          
          <!-- RN5: Envío Gratis -->
          <p>
            <strong>Costo de Envío:</strong> 
            <span :class="{ 'envio-gratis': costoEnvio === 0 }">
              {{ costoEnvio === 0 ? '¡GRATIS!' : '$' + costoEnvio.toLocaleString() }}
            </span>
          </p>

          <p class="total-final"><strong>Total Final:</strong> ${{ totalFinal.toLocaleString() }}</p>
        </div>
      </section>

      <!-- 3. Formulario de Facturación / Regla de Monto Mínimo (RN4) -->
      <section class="facturacion-seccion">
        <h2>Datos de Facturación y Entrega</h2>

        <!-- RN4 Literal: Solo se renderiza si la sumatoria de productos NO supera el piso de $50.000 -->
        <div v-if="subtotal > 50000" class="alerta-bloqueo">
          ⚠️ <strong>Monto Máximo Superado (RN4):</strong> El monto de compra (${{ subtotal.toLocaleString() }}) supera el piso máximo de $50.000 permitido para avanzar al pago. Disminuye las cantidades o remueve ítems para poder continuar.
        </div>

        <form v-else @submit.prevent="confirmarPedido" class="formulario-facturacion">
          <div class="form-group">
            <label for="nombreCompleto">Nombre Completo / Razón Social:</label>
            <input 
              id="nombreCompleto"
              v-model="form.nombreCompleto" 
              type="text" 
              placeholder="Ej: Kiosko Don Pepe S.A." 
              required
            />
          </div>

          <div class="form-group">
            <label>Tipo de Factura:</label>
            <div class="radio-group">
              <label>
                <input type="radio" value="B" v-model="form.tipoFactura" />
                Factura B (Consumidor Final)
              </label>
              <label>
                <input type="radio" value="A" v-model="form.tipoFactura" />
                Factura A (Responsable Inscripto)
              </label>
            </div>
          </div>

          <!-- CUIT Condicional para Factura A (RN6) -->
          <div v-if="form.tipoFactura === 'A'" class="form-group animate-cuit">
            <label for="cuit">CUIT (11 dígitos):</label>
            <input 
              id="cuit"
              v-model="form.cuit" 
              type="text" 
              placeholder="Ej: 20123456789" 
              maxlength="11"
              required
            />
            <span v-if="errorCuit" class="error-msg">{{ errorCuit }}</span>
          </div>

          <div class="form-group">
            <label for="metodoEntrega">Método de Entrega:</label>
            <select id="metodoEntrega" v-model="form.metodoEntrega">
              <option value="Retiro">Retiro en Sucursal / Depósito</option>
              <option value="Envio">Envío a Domicilio</option>
            </select>
          </div>

          <div class="form-group">
            <label for="metodoPago">Método de Pago:</label>
            <select id="metodoPago" v-model="form.metodoPago">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          <button 
            type="submit" 
            class="btn btn-success btn-submit" 
            :disabled="!esFormularioValido"
          >
            ✅ Confirmar Pedido
          </button>
        </form>
      </section>

    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

h1, h2 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.carrito-vacio {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

.tabla-carrito {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.tabla-carrito th, .tabla-carrito td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.tabla-carrito th {
  background-color: #f5f5f5;
}

.td-img {
  width: 70px;
  text-align: center;
}

.img-producto {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.td-cantidades {
  white-space: nowrap;
}

.btn-cant {
  padding: 4px 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
}

.btn-cant:hover {
  background-color: #eee;
}

.cantidad-num {
  margin: 0 10px;
  font-weight: bold;
}

.carrito-acciones {
  margin-bottom: 20px;
}

.totales-desglose {
  background-color: #f7f7f7;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eaeaea;
}

.totales-desglose p {
  margin: 6px 0;
  display: flex;
  justify-content: space-between;
  font-size: 1.05rem;
}

.total-final {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 1.25rem !important;
  color: #2c3e50;
}

.envio-gratis {
  color: #27ae60;
  font-weight: bold;
}

.alerta-envio {
  background-color: #e8f8f5;
  color: #16a085;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  margin: 10px 0;
  border-left: 4px solid #1abc9c;
}

.alerta-bloqueo {
  background-color: #fdf2f2;
  color: #c0392b;
  padding: 15px;
  border-radius: 6px;
  border-left: 5px solid #e74c3c;
  line-height: 1.4;
  margin-bottom: 20px;
}

.formulario-facturacion {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.form-group input[type="text"],
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.radio-group {
  display: flex;
  gap: 15px;
  margin-top: 5px;
}

.radio-group label {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.error-msg {
  color: #c0392b;
  font-size: 0.85rem;
  margin-top: 5px;
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

.btn-danger {
  background-color: #e74c3c;
  color: #fff;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-success {
  background-color: #2ecc71;
  color: #fff;
}

.btn-success:hover {
  background-color: #27ae60;
}

.btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-submit {
  width: 100%;
  margin-top: 15px;
}

.animate-cuit {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
