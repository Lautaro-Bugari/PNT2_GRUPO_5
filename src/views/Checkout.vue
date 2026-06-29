<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStoreCarrito } from "../stores/storeCarrito"
import { useStorePedidos } from "../stores/storePedidos"
import { useAuthStore } from "../stores/authStore"
import { useStoreProducto } from '../stores/storeProducto'
import { useStorePromos } from "../stores/storePromos"

const storeCarrito = useStoreCarrito()
const storePedidos = useStorePedidos()
const authStore = useAuthStore()
const router = useRouter()
const storeProducto = useStoreProducto()
const storePromos = useStorePromos()

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
  try {
        let productoCompleto = await storeProducto.getProductoById(item.id)
      if (!productoCompleto) {
        productoCompleto = await storePromos.getPromocionById(item.id)
      }
      if (!productoCompleto) {
      alert("❌ Producto no encontrado.")
      return
      }
      const nuevaCantidad = item.cantidad + 1
    if(productoCompleto.productosIncluidos?.length ){
        const stockInsuficiente = productoCompleto.productosIncluidos.some(p => {
        const cantidadRequeridaPorUnidad = p.PromoProducto?.cantidad || 1
        const totalRequerido = cantidadRequeridaPorUnidad * nuevaCantidad
        return p.stock < totalRequerido
        })
        if(stockInsuficiente)
        {      
          alert(`⚠️ No hay más stock del producto: ${productoCompleto.nombre}.`)
          return
        }
      }else if (nuevaCantidad > productoCompleto.stock) {
      alert(`⚠️ No hay más stock del producto. Máximo disponible: ${productoCompleto.stock} unidades.`)
      return
    }
    item.cantidad = nuevaCantidad
    await storeCarrito.guardarCarrito()
  } catch (error) {
  }
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
      let productoCompleto = await storeProducto.getProductoById(item.id)
      if (!productoCompleto) {
        productoCompleto = await storePromos.getPromocionById(item.id)
      }
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
      const producto = await storeProducto.getProductoById(productoId) || storePromos
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

const eliminarDelCarrito = async (item) => {
  await storeCarrito.eliminarProducto(item.id)
}
</script>

<template>
  <div class="checkout-container">
    <h1>Checkout de Compra</h1>
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
              <th>Acciones</th> </tr>
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
              <td class="td-acciones">
                <button class="btn btn-delete" @click="eliminarDelCarrito(item)">
                  ❌ Eliminar
                </button>
              </td>
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
.checkout-container {
  width: 100%;
  min-height: 100vh;
  margin: 0px;
  padding: 60px 40px;
  background-color: #ffffff;
  box-sizing: border-box;
}

.checkout-container h1 {
  font-size: 42px;
  color: #111111;
  font-weight: 800;
  margin: 0px 0px 40px 0px;
  border-bottom: 3px solid #111111;
  padding-bottom: 15px;
}

.carrito-vacio {
  text-align: center;
  padding: 80px 20px;
}

.carrito-vacio p {
  font-size: 20px;
  color: #e60000;
  margin-bottom: 25px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: start;
  width: 100%;
}

.carrito-seccion, .facturacion-seccion {
  background: #ffffff;
  box-sizing: border-box;
}

.carrito-seccion h2, .facturacion-seccion h2 {
  font-size: 26px;
  color: #222222;
  font-weight: 700;
  margin: 0px 0px 25px 0px;
  border-bottom: 2px solid #e60000;
  padding-bottom: 10px;
}

.tabla-carrito {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.tabla-carrito th {
  text-align: left;
  padding: 15px 10px;
  border-bottom: 2px solid #111111;
  font-size: 16px;
  color: #444444;
  font-weight: 700;
}

.tabla-carrito td {
  padding: 20px 10px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  color: #222222;
  vertical-align: middle;
}

.td-img {
  width: 90px;
}

.img-producto {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.td-cantidades {
  white-space: nowrap;
}

.btn-cant {
  width: 36px;
  height: 36px;
  border: 1px solid #ccc;
  background-color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-cant:hover {
  background-color: #f5f5f5;
}

.cantidad-num {
  font-size: 18px;
  font-weight: 700;
  margin: 0px 12px;
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

.totales-desglose {
  margin-top: 30px;
  padding: 25px;
  background-color: #ffffff;
  border: 1px solid #e60000;
  border-radius: 8px;
}

.totales-desglose p {
  font-size: 18px;
  margin: 0px 0px 12px 0px;
  color: #444444;
  display: flex;
  justify-content: space-between;
}

.totales-desglose p .envio-gratis {
  color: #2ed573;
  font-weight: 800;
}

.totales-desglose p.total-final {
  font-size: 24px;
  color: #e60000;
  font-weight: 800;
  border-top: 2px dashed #e60000;
  padding-top: 15px;
  margin-top: 15px;
}

.alerta-bloqueo {
  background-color: #fff5f5;
  border: 2px solid #e60000;
  color: #e60000;
  padding: 20px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 24px;
}


.formulario-facturacion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.form-group input[type="text"], .form-group select {
  padding: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  box-sizing: border-box;
  width: 100%;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #e60000;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 5px 0px;
}

.radio-group label {
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-msg {
  color: #e60000;
  font-size: 14px;
  font-weight: 600;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, background-color 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  background-color: #cccccc !important;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-primary {
  background-color: #e60000;
  color: #ffffff;
}

.btn-danger {
  background-color: #2b2b2b;
  color: #ffffff;
}

.btn-danger:hover {
  background-color: #111111;
}

.btn-success {
  background-color: #e60000;
  color: #ffffff;
}

.btn-success:hover {
  background-color: #c90000;
}

.btn-delete {
  background-color: #ffffff;
  color: #e60000;
  border: 1px solid #e60000;
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 4px;
}

.btn-delete:hover {
  background-color: #e60000;
  color: #ffffff;
  opacity: 1;
}

.btn-submit {
  width: 100%;
  margin-top: 15px;
  font-size: 18px;
  padding: 16px;
}
</style>