<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStoreCarrito } from "../stores/storeCarrito"
import { useStorePedidos } from "../stores/storePedidos"
import { useAuthStore } from "../stores/authStore"
import { useStoreProducto } from '../stores/storeProducto'

const storeCarrito = useStoreCarrito()
const storePedidos = useStorePedidos()
const authStore = useAuthStore()
const router = useRouter()
const storeProducto = useStoreProducto()

onMounted(() => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/checkout" } })
  }
})


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

const incrementarCantidad = async (item) => {
  item.cantidad++
  await storeCarrito.guardarCarrito()
}

const decrementarCantidad = async (item) => {
  if (item.cantidad > 1) {
    item.cantidad--
  } else {
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


const form = ref({
  nombreCompleto: "",
  tipoFactura: "B",
  cuit: "",
  metodoEntrega: "Retiro",
  metodoPago: "Efectivo"
})

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


const confirmarPedido = async () => {
  if (!esFormularioValido.value) return
  if (subtotal.value > 50000) {
    alert("No se puede consolidar el pedido ya que el monto supera el piso máximo de $50.000.")
    return
  }

  try {
     const productosADescontar = []

    for (const item of storeCarrito.carrito) {
      const productoCompleto = await storeProducto.getProductoById(item.id)
      if (!productoCompleto) {
        throw new Error(`Producto/promoción con ID ${item.id} no encontrado`)
      }

      // Si es promoción (tiene productosIncluidos)
      if (productoCompleto.productosIncluidos?.length) {
        for (const p of productoCompleto.productosIncluidos) {
          const cantidad = (p.PromoProducto?.cantidad || 1) * item.cantidad
          productosADescontar.push({ productoId: p.id, cantidad })
        }
      } else {
        // Es un producto simple
        productosADescontar.push({ productoId: item.id, cantidad: item.cantidad })
      }
    }

    // 3. Agrupar manualmente (sumar cantidades por productoId)
    const agrupado = {}
    for (const { productoId, cantidad } of productosADescontar) {
      if (agrupado[productoId]) {
        agrupado[productoId] += cantidad
      } else {
        agrupado[productoId] = cantidad
      }
    }

    // 4. Validar stock y actualizar cada producto
    for (const [productoId, cantidadRequerida] of Object.entries(agrupado)) {
      const producto = await storeProducto.getProductoById(productoId)
      if (!producto) {
        throw new Error(`Producto con ID ${productoId} no encontrado`)
      }
      if (producto.stock < cantidadRequerida) {
        throw new Error(`Stock insuficiente para "${producto.nombre}" (stock: ${producto.stock}, requerido: ${cantidadRequerida})`)
      }
      const productoCompleto = await storeProducto.getProductoById(productoId)
      const nuevoStock = productoCompleto.stock - cantidadRequerida
      await storeProducto.updateProducto(productoId, {
        ...productoCompleto,   
         stock: nuevoStock          })
}

    const nuevoPedido = await storePedidos.crearPedido(
      form.value,
      subtotal.value,
      costoEnvio.value
    )
    router.push(`/pedido/${nuevoPedido.idPedido}`)
  } catch (error) {
    console.error("Error al procesar el pedido:", error)
    alert(`❌ ${error.message}`)
  }
}
</script>

<template>
  <div class="checkout-container">
    <h1>Checkout de Compra</h1>
    <!-- 1. Flujo alternativo: Carrito Vacío -->
    <div v-if="storeCarrito.carrito.length === 0 || !storeCarrito.carrito" class="carrito-vacio">
      <p>Tu carrito está vacío. ¡Visitá nuestro catálogo para empezar a comprar!</p>
      <button class="btn btn-primary" @click="router.push('/productos')">
        📦 Ver Productos
      </button>
    </div>
    <div v-else class="checkout-content">
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
          <p>
            <strong>Costo de Envío:</strong> 
            <span :class="{ 'envio-gratis': costoEnvio === 0 }">
              {{ costoEnvio === 0 ? '¡GRATIS!' : '$' + costoEnvio.toLocaleString() }}
            </span>
          </p>
          <p class="total-final"><strong>Total Final:</strong> ${{ totalFinal.toLocaleString() }}</p>
        </div>
      </section>
      <section class="facturacion-seccion">
        <h2>Datos de Facturación y Entrega</h2>
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