<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStoreCarrito } from "../stores/storeCarrito"
import { useAuthStore } from "../stores/authStore"

const route = useRoute()
const router = useRouter()
const storeCarrito = useStoreCarrito()
const authStore = useAuthStore()

const producto = ref(null)
const cargando = ref(true)
const errorCarga = ref("")
const cantidad = ref(1)
const mensajeAgregado = ref(false)
const agregando = ref(false)

const URL_API = "https://www.mockachino.com/9d6594f6-711f-4c/productos"

onMounted(async () => {
  try {
    const response = await fetch(URL_API)
    if (!response.ok) throw new Error("No se pudo consultar el catálogo")
    const data = await response.json()
    const id = route.params.id
    producto.value = data.productos.find(p => String(p.id) === String(id))
  } catch (e) {
    console.error("Error al cargar producto:", e)
    errorCarga.value = "No pudimos cargar el producto. Intentá nuevamente."
  } finally {
    cargando.value = false
  }
})

// RN3: Unidad mínima mayorista — el mínimo es 1 pack/bulto, no puede bajar de 1
const incrementar = () => {
  cantidad.value++
}

const decrementar = () => {
  if (cantidad.value > 1) cantidad.value--
}

const agregarAlCarrito = async () => {
  if (!authStore.usuarioLogueado) {
    router.push({
      path: "/login",
      query: { redirect: route.fullPath }
    })
    return
  }

  agregando.value = true
  try {
    await storeCarrito.agregarAlCarrito(producto.value, cantidad.value)
    mensajeAgregado.value = true
    setTimeout(() => { mensajeAgregado.value = false }, 2500)
  } catch (error) {
    console.error("Error al agregar al carrito:", error)
    errorCarga.value = "No pudimos actualizar el carrito. Intentá nuevamente."
  } finally {
    agregando.value = false
  }
}
</script>

<template>
  <div class="detalle-container">

    <!-- Estado de carga -->
    <div v-if="cargando" class="cargando">
      <p>Cargando producto...</p>
    </div>

    <!-- Producto no encontrado -->
    <div v-else-if="!producto" class="no-encontrado">
      <p>{{ errorCarga || "Producto no encontrado." }}</p>
      <button class="btn btn-primary" @click="router.push('/productos')">
        Volver al catálogo
      </button>
    </div>

    <!-- Detalle del producto -->
    <div v-else class="detalle-contenido">

      <button class="btn-volver" @click="router.back()">
        ← Volver
      </button>

      <div class="detalle-grid">

        <!-- Imagen -->
        <div class="detalle-imagen-wrap">
          <img
            :src="producto.imagen"
            :alt="producto.nombre"
            class="detalle-imagen"
            :class="{ 'sin-stock-img': !producto.hayStock }"
          />
          <span v-if="!producto.hayStock" class="badge-sin-stock">SIN STOCK</span>
          <span v-if="producto.esOferta" class="badge-oferta">🔥 OFERTA</span>
          <span v-if="producto.esNovedad" class="badge-novedad">✨ NOVEDAD</span>
        </div>

        <!-- Info -->
        <div class="detalle-info">
          <p class="detalle-categoria">{{ producto.categoria }}</p>
          <h1 class="detalle-nombre">{{ producto.nombre }}</h1>

          <div class="detalle-precio">
            <span class="precio-label">Precio por bulto:</span>
            <span class="precio-valor">${{ producto.precio.toLocaleString("es-AR") }}</span>
          </div>

          <div class="detalle-stock">
            <span v-if="producto.hayStock" class="stock-ok">✅ En stock</span>
            <span v-else class="stock-no">❌ Sin stock</span>
          </div>

          <dl class="ficha-tecnica">
            <div>
              <dt>Categoría</dt>
              <dd>{{ producto.categoria }}</dd>
            </div>
            <div>
              <dt>Presentación</dt>
              <dd>Bulto o pack cerrado</dd>
            </div>
            <div v-if="producto.gramaje">
              <dt>Gramaje</dt>
              <dd>{{ producto.gramaje }}</dd>
            </div>
            <div v-if="producto.unidadesPorBulto">
              <dt>Unidades por bulto</dt>
              <dd>{{ producto.unidadesPorBulto }}</dd>
            </div>
          </dl>

          <!-- RN3: Selector de cantidad — mínimo 1 bulto (no venta suelta) -->
          <div v-if="producto.hayStock" class="selector-cantidad">
            <p class="cantidad-label">
              Cantidad de bultos:
              <span class="hint-rn3">* Venta mínima: 1 bulto cerrado</span>
            </p>
            <div class="cantidad-controles">
              <button
                class="btn-cant"
                @click="decrementar"
                :disabled="cantidad <= 1"
              >−</button>
              <span class="cantidad-num">{{ cantidad }}</span>
              <button class="btn-cant" @click="incrementar">+</button>
            </div>
          </div>

          <!-- Subtotal previo -->
          <div v-if="producto.hayStock" class="detalle-subtotal">
            <span>Subtotal estimado:</span>
            <strong>${{ (producto.precio * cantidad).toLocaleString("es-AR") }}</strong>
          </div>

          <!-- Botón agregar -->
         <button
  v-if="producto.hayStock"
  class="btn btn-agregar"
  :disabled="agregando"
  @click="agregarAlCarrito"
>
  {{ agregando ? "Agregando..." : "Agregar al carrito" }}
</button>

<!-- Debe estar inmediatamente después del v-if anterior -->
<button v-else class="btn btn-sin-stock" disabled>
  Sin stock disponible
</button>

<!-- El mensaje va después de los dos botones -->
<div v-if="mensajeAgregado" class="mensaje-agregado">
  ✅ ¡{{ cantidad }} bulto{{ cantidad > 1 ? "s" : "" }}
  agregado{{ cantidad > 1 ? "s" : "" }} al carrito!
</div>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.detalle-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px;
  font-family: sans-serif;
}

.cargando,
.no-encontrado {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.btn-volver {
  background: none;
  border: none;
  color: #3498db;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-volver:hover {
  text-decoration: underline;
}

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

@media (max-width: 700px) {
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}

/* Imagen */
.detalle-imagen-wrap {
  position: relative;
}

.detalle-imagen {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 1 / 1;
  border: 1px solid #eee;
}

.sin-stock-img {
  opacity: 0.4;
  filter: grayscale(80%);
}

.badge-sin-stock,
.badge-oferta,
.badge-novedad {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge-sin-stock {
  background: #e74c3c;
  color: #fff;
}

.badge-oferta {
  background: #f39c12;
  color: #fff;
  top: 12px;
  left: auto;
  right: 12px;
}

.badge-novedad {
  background: #2ecc71;
  color: #fff;
  top: 48px;
  left: auto;
  right: 12px;
}

/* Info */
.detalle-categoria {
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: #888;
  margin: 0 0 8px;
}

.detalle-nombre {
  font-size: 1.6rem;
  color: #2c3e50;
  margin: 0 0 20px;
  line-height: 1.3;
}

.detalle-precio {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.precio-label {
  color: #666;
  font-size: 0.95rem;
}

.precio-valor {
  font-size: 2rem;
  font-weight: 900;
  color: #2c3e50;
}

.detalle-stock {
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.stock-ok { color: #27ae60; font-weight: bold; }
.stock-no { color: #e74c3c; font-weight: bold; }

.ficha-tecnica {
  border-block: 1px solid #eee;
  margin: 0 0 20px;
  padding: 12px 0;
}

.ficha-tecnica div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 5px 0;
}

.ficha-tecnica dt {
  color: #666;
}

.ficha-tecnica dd {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
  text-align: right;
}

/* Selector cantidad */
.selector-cantidad {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.cantidad-label {
  font-weight: bold;
  margin: 0 0 10px;
  font-size: 0.95rem;
  color: #555;
}

.hint-rn3 {
  font-size: 0.78rem;
  color: #888;
  font-weight: normal;
  margin-left: 6px;
}

.cantidad-controles {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-cant {
  width: 36px;
  height: 36px;
  border: 2px solid #3498db;
  background: #fff;
  color: #3498db;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.15s;
}

.btn-cant:hover:not(:disabled) {
  background: #3498db;
  color: #fff;
}

.btn-cant:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.cantidad-num {
  font-size: 1.4rem;
  font-weight: bold;
  color: #2c3e50;
  min-width: 30px;
  text-align: center;
}

/* Subtotal previo */
.detalle-subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #eee;
  margin-bottom: 16px;
  font-size: 1rem;
  color: #555;
}

.detalle-subtotal strong {
  font-size: 1.2rem;
  color: #2c3e50;
}

/* Botones */
.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-agregar {
  background: #2ecc71;
  color: #fff;
}

.btn-agregar:hover {
  background: #27ae60;
}

.btn-sin-stock {
  background: #bdc3c7;
  color: #fff;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: #fff;
}

/* Mensaje confirmación */
.mensaje-agregado {
  margin-top: 12px;
  padding: 10px 14px;
  background: #eafaf1;
  border: 1px solid #a9dfbf;
  border-radius: 6px;
  color: #1e8449;
  font-size: 0.95rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
