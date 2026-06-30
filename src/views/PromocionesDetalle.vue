<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorePromos } from '../stores/storePromos'
import AvisoLogin from './AvisoLogin.vue'
import BotonCarrito from './BotonCarrito.vue'

const route = useRoute()
const router = useRouter()
const storePromos = useStorePromos()

const promocion = ref(null)
const cargando = ref(true)
const error = ref('')
const avisoLoginVisible = ref(false)

const id = route.params.promocionId

onMounted(async () => {
  try {
    const data = await storePromos.getPromocionById(id)
    if (data) {
      promocion.value = data
    } else {
      error.value = 'Promoción no encontrada'
    }
  } catch (err) {
    error.value = 'Error al cargar la promoción'
  } finally {
    cargando.value = false
  }
})

const stockDisponible = computed(() => {
  if (!promocion.value?.productosIncluidos) return false
  return promocion.value.productosIncluidos.every(
    p => p.stock > 0 && p.habilitado
  )
})

const sePuedeAgregar = computed(() => {
  if (!promocion.value) return false
  return stockDisponible.value && promocion.value.habilitado
})

const manejarLoginRequerido = () => {
  avisoLoginVisible.value = true
}

const irALogin = () => {
  router.push({
    path: '/login',
    query: {
      redirect: `/promociones/${promocion.value.id}`
    }
  })
}
</script>

<template>
  <div class="contenedor-detalle-promo">

    <AvisoLogin
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="irALogin"
    />

    <div
      v-if="promocion"
      class="tarjeta-promo-detalle"
    >

      <h1 class="titulo-promo">
        {{ promocion.nombre }}
      </h1>

      <div class="seccion-info">

        <p class="descripcion-promo">
          <strong>Descripción:</strong>
          {{ promocion.descripcion }}
        </p>

        <div class="bloque-precios">

          <div class="precio-contenedor">

            <span
              v-if="promocion.descuento && promocion.descuento > 0"
              class="precio-original"
            >
              ${{ promocion.precio }}
            </span>

            <span class="precio-final">
              ${{ promocion.precioFinal || promocion.precio }}
            </span>

          </div>

          <p
            v-if="promocion.descuento && promocion.descuento > 0"
            class="porcentaje-descuento"
          >
            <strong>Descuento:</strong>

            <span class="tag-rojo">
              {{ promocion.descuento }}% OFF
            </span>
          </p>

        </div>

        <p class="categorias-promo">
          <strong>Categorías:</strong>

          <span
            v-for="(cat, idx) in promocion.categorias"
            :key="idx"
            class="badge-categoria"
          >
            {{ cat.nombre }}
            <span v-if="idx < promocion.categorias.length - 1">, </span>
          </span>
        </p>

      </div>

      <div class="seccion-productos">

        <h3>Productos incluidos:</h3>

        <ul class="lista-productos-incluidos">

          <li
            v-for="p in promocion.productosIncluidos"
            :key="p.id"
            class="item-producto-incluido"
          >

            <span class="nombre-p-inc">
              🍬 {{ p.nombre }}
            </span>

            <span class="cantidad-p-inc">
              x{{ p.PromoProducto?.cantidad || 1 }}
            </span>

            <span class="stock-p-inc">
              | Stock: {{ p.stock }}
            </span>

            <span
              v-if="p.stock <= 0"
              class="tag-sin-stock"
            >
              🚫 Sin stock
            </span>

          </li>

        </ul>

      </div>

      <div class="acciones-promo">

        <BotonCarrito
          v-if="sePuedeAgregar"
          :producto="promocion"
          @login-required="manejarLoginRequerido"
        />

        <button
          v-else
          class="btn-accion-promo"
          disabled
        >
          🚫 No disponible
        </button>

      </div>

    </div>

    <div
      v-else-if="cargando"
      class="estado-mensaje cargando"
    >
      Cargando detalles del combo...
    </div>

    <div
      v-else-if="error"
      class="estado-mensaje error"
    >
      ⚠️ {{ error }}
    </div>

  </div>
</template>

<style scoped>
.contenedor-detalle-promo {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  color: #2b2b2b;
}

.tarjeta-promo-detalle {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.titulo-promo {
  font-size: 32px;
  font-weight: 800;
  color: #333;
  margin-top: 0;
  margin-bottom: 25px;
  border-bottom: 3px solid #333;
  padding-bottom: 12px;
}

.seccion-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.descripcion-promo {
  font-size: 16px;
  color: #555;
  line-height: 1.5;
}

.bloque-precios {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin: 10px 0;
}

.precio-contenedor {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.precio-original {
  font-size: 18px;
  color: #888;
  text-decoration: line-through;
}

.precio-final {
  font-size: 26px;
  font-weight: 800;
  color: #e60000;
}

.porcentaje-descuento {
  font-size: 16px;
  color: #555;
  margin-top: 10px;
}

.tag-rojo {
  background-color: #e60000;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
}

.badge-categoria {
  font-weight: 600;
}

.seccion-productos h3 {
  margin-bottom: 15px;
}

.lista-productos-incluidos {
  list-style: none;
  padding: 0;
  margin-bottom: 35px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-producto-incluido {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-left: 5px solid #333;
  border-radius: 6px;
  padding: 12px 18px;
}

.nombre-p-inc {
  flex: 1;
  font-weight: 600;
}

.cantidad-p-inc {
  color: #e60000;
  font-weight: 700;
  margin-right: 15px;
}

.stock-p-inc {
  color: #666;
}

.tag-sin-stock {
  margin-left: 10px;
  color: #dc3545;
  font-weight: 700;
}


.acciones-promo {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.acciones-promo :deep(.boton-carrito-wrapper) {
  width: 100%;
}

.acciones-promo :deep(.btn-agregar) {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
}

.acciones-promo :deep(.control-cantidad) {
  width: 100%;
  justify-content: center;
  gap: 20px;
}

.acciones-promo :deep(.btn-cantidad) {
  width: 42px;
  height: 42px;
  font-size: 22px;
}

.acciones-promo :deep(.cantidad-texto) {
  min-width: 30px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
}

.btn-accion-promo {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: #cccccc;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: not-allowed;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  border-radius: 8px;
}

.cargando {
  background: #f8f9fa;
}

.error {
  color: #b52a37;
  background: #fff5f5;
  border: 1px solid #f8d7da;
}
</style>