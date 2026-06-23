<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useStoreCarrito } from "../stores/storeCarrito"
import { useAuthStore } from "../stores/authStore"

const router = useRouter()
const storeCarrito = useStoreCarrito()
const authStore = useAuthStore()

// ─── Cálculos reactivos ───────────────────────────────────────────────────────

const subtotal = computed(() =>
  storeCarrito.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
)

// RN5: Envío gratis a partir de $120.000
const costoEnvio = computed(() => subtotal.value >= 120000 ? 0 : 5000)

const totalFinal = computed(() => subtotal.value + costoEnvio.value)

// RN5: Cuánto falta para envío gratis
const faltanteEnvioGratis = computed(() => 120000 - subtotal.value)

// RN4: El botón de avanzar al pago solo aparece si NO supera $50.000
const puedeAvanzar = computed(() => subtotal.value <= 50000 && storeCarrito.carrito.length > 0)

// ─── Acciones ─────────────────────────────────────────────────────────────────

const incrementar = async (item) => {
  await storeCarrito.cambiarCantidad(item.id, item.cantidad + 1)
}

const decrementar = async (item) => {
  if (item.cantidad > 1) {
    await storeCarrito.cambiarCantidad(item.id, item.cantidad - 1)
  }
}

const eliminarItem = async (item) => {
  await storeCarrito.eliminarDelCarrito(item.id)
}

const vaciarCarrito = async () => {
  await storeCarrito.vaciarCarrito()
}

const avanzarAlPago = () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: "/login", query: { redirect: "/checkout" } })
    return
  }
  router.push("/checkout")
}
</script>

<template>
  <div class="carrito-container">
    <h1>🛒 Mi Carrito</h1>

    <!-- ── Flujo alternativo: carrito vacío ── -->
    <div v-if="storeCarrito.carrito.length === 0" class="carrito-vacio">
      <div class="vacio-icono">🛒</div>
      <p class="vacio-texto">Tu carrito está vacío.</p>
      <p class="vacio-sub">¡Visitá nuestro catálogo para empezar a comprar!</p>
      <button class="btn btn-primary" @click="router.push('/productos')">
        📦 Ver Productos
      </button>
    </div>

    <!-- ── Carrito con productos ── -->
    <div v-else class="carrito-contenido">

      <!-- Tabla de productos -->
      <section class="carrito-tabla-wrap">
        <div class="tabla-header-acciones">
          <h2>Productos seleccionados</h2>
          <button class="btn btn-danger btn-sm" @click="vaciarCarrito">
            🗑️ Vaciar carrito
          </button>
        </div>

        <table class="tabla-carrito">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>Bultos</th>
              <th>Precio / bulto</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in storeCarrito.carrito" :key="item.id">
              <td class="td-img">
                <img :src="item.imagen" :alt="item.nombre" class="img-item" />
              </td>
              <td class="td-nombre">{{ item.nombre }}</td>
              <td class="td-cantidad">
                <button class="btn-cant" @click="decrementar(item)" :disabled="item.cantidad <= 1">−</button>
                <span class="cantidad-num">{{ item.cantidad }}</span>
                <button class="btn-cant" @click="incrementar(item)">+</button>
              </td>
              <td>${{ item.precio.toLocaleString("es-AR") }}</td>
              <td class="td-subtotal">${{ (item.precio * item.cantidad).toLocaleString("es-AR") }}</td>
              <td>
                <button class="btn-eliminar" @click="eliminarItem(item)" title="Eliminar">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Resumen y totales -->
      <aside class="carrito-resumen">
        <h2>Resumen de compra</h2>

        <!-- RN5: Progreso hacia envío gratis -->
        <div v-if="costoEnvio > 0" class="envio-progreso">
          <p class="envio-mensaje">
            🚚 ¡Agregá
            <strong>${{ faltanteEnvioGratis.toLocaleString("es-AR") }}</strong>
            más y tu envío es <strong>¡GRATIS!</strong>
          </p>
          <div class="barra-progreso-wrap">
            <div
              class="barra-progreso-fill"
              :style="{ width: Math.min((subtotal / 120000) * 100, 100) + '%' }"
            ></div>
          </div>
        </div>
        <div v-else class="envio-gratis-banner">
          🎉 ¡Tu envío es <strong>GRATIS</strong>!
        </div>

        <!-- Desglose de totales -->
        <div class="totales">
          <div class="total-fila">
            <span>Subtotal</span>
            <span>${{ subtotal.toLocaleString("es-AR") }}</span>
          </div>
          <div class="total-fila">
            <span>Envío</span>
            <span :class="{ 'gratis-text': costoEnvio === 0 }">
              {{ costoEnvio === 0 ? "¡GRATIS!" : "$" + costoEnvio.toLocaleString("es-AR") }}
            </span>
          </div>
          <div class="total-fila total-final">
            <span>Total</span>
            <span>${{ totalFinal.toLocaleString("es-AR") }}</span>
          </div>
        </div>

        <!-- RN4: Alerta si supera $50.000 -->
        <div v-if="subtotal > 50000" class="alerta-rn4">
          ⚠️ <strong>Monto máximo superado.</strong> El total (${{ subtotal.toLocaleString("es-AR") }})
          supera el límite de $50.000 para avanzar al pago. Reducí la cantidad de productos.
        </div>

        <!-- RN4: Botón avanzar al pago -->
        <button
          v-if="puedeAvanzar"
          class="btn btn-pago"
          @click="avanzarAlPago"
        >
          💳 Avanzar al pago
        </button>

        <button class="btn btn-seguir" @click="router.push('/productos')">
          ← Seguir comprando
        </button>
      </aside>

    </div>
  </div>
</template>

<style scoped>
.carrito-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
  font-family: sans-serif;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 24px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

/* ── Vacío ── */
.carrito-vacio {
  text-align: center;
  padding: 60px 20px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px dashed #ddd;
}

.vacio-icono {
  font-size: 4rem;
  margin-bottom: 12px;
}

.vacio-texto {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 6px;
}

.vacio-sub {
  color: #888;
  margin: 0 0 24px;
}

/* ── Layout ── */
.carrito-contenido {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;
}

@media (max-width: 820px) {
  .carrito-contenido {
    grid-template-columns: 1fr;
  }
}

/* ── Tabla ── */
.carrito-tabla-wrap h2 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 12px;
}

.tabla-header-acciones {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tabla-carrito {
  width: 100%;
  border-collapse: collapse;
}

.tabla-carrito th,
.tabla-carrito td {
  border: 1px solid #e0e0e0;
  padding: 10px 12px;
  text-align: left;
  font-size: 0.95rem;
}

.tabla-carrito th {
  background: #f5f5f5;
  font-weight: bold;
  color: #555;
}

.td-img {
  width: 70px;
  text-align: center;
}

.img-item {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
}

.td-nombre {
  font-weight: 600;
  color: #2c3e50;
}

.td-cantidad {
  white-space: nowrap;
  text-align: center;
}

.btn-cant {
  width: 30px;
  height: 30px;
  border: 1px solid #bbb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.15s;
}

.btn-cant:hover:not(:disabled) {
  background: #eee;
}

.btn-cant:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cantidad-num {
  display: inline-block;
  min-width: 26px;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
}

.td-subtotal {
  font-weight: bold;
  color: #2c3e50;
}

.btn-eliminar {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.btn-eliminar:hover {
  background: #fdecea;
}

/* ── Resumen ── */
.carrito-resumen {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  position: sticky;
  top: 20px;
}

.carrito-resumen h2 {
  font-size: 1.1rem;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 16px;
}

/* Progreso envío */
.envio-progreso {
  background: #eaf4fb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.envio-mensaje {
  font-size: 0.88rem;
  color: #1a5276;
  margin: 0 0 8px;
}

.barra-progreso-wrap {
  background: #cce5f7;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}

.barra-progreso-fill {
  height: 100%;
  background: #3498db;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.envio-gratis-banner {
  background: #eafaf1;
  border: 1px solid #a9dfbf;
  color: #1e8449;
  text-align: center;
  border-radius: 8px;
  padding: 10px;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

/* Totales */
.totales {
  margin-bottom: 16px;
}

.total-fila {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.95rem;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.gratis-text {
  color: #27ae60;
  font-weight: bold;
}

.total-final {
  font-size: 1.2rem !important;
  font-weight: bold;
  color: #2c3e50 !important;
  border-bottom: none;
  padding-top: 12px;
}

/* Alerta RN4 */
.alerta-rn4 {
  background: #fdf2f2;
  color: #c0392b;
  border-left: 4px solid #e74c3c;
  border-radius: 6px;
  padding: 12px;
  font-size: 0.88rem;
  margin-bottom: 14px;
  line-height: 1.5;
}

/* Botones */
.btn {
  display: block;
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, opacity 0.2s;
}

.btn-pago {
  background: #2ecc71;
  color: #fff;
  margin-bottom: 10px;
}

.btn-pago:hover:not(:disabled) {
  background: #27ae60;
}

.btn-pago:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-seguir {
  background: #ecf0f1;
  color: #2c3e50;
  font-size: 0.9rem;
}

.btn-seguir:hover {
  background: #dfe6e9;
}

.btn-primary {
  background: #3498db;
  color: #fff;
  display: inline-block;
  width: auto;
  padding: 12px 24px;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-sm {
  width: auto;
  padding: 7px 14px;
  font-size: 0.85rem;
}
</style>
