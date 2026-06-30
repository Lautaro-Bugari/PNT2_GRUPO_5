<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorePromos } from '../stores/storePromos'
import { useStoreCarrito } from '../stores/storeCarrito'
import { useAuthStore } from '../stores/authStore'
import AvisoLogin from './AvisoLogin.vue'

const route = useRoute()
const router = useRouter()
const storePromos = useStorePromos()
const storeCarrito = useStoreCarrito()
const authStore = useAuthStore()

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
  return promocion.value.productosIncluidos.every(p => p.stock > 0 && p.habilitado)
})

const sePuedeAgregar = computed(() => {
  if (!promocion.value) return false
  return stockDisponible.value && promocion.value.habilitado
})

const agregarAlCarrito = () => {
  if (!sePuedeAgregar.value) return

  if (!authStore.usuarioLogueado) {
    avisoLoginVisible.value = true
    return
  }
  storeCarrito.agregarAlCarrito(promocion.value)
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
    <div v-if="promocion" class="tarjeta-promo-detalle">
      <h1 class="titulo-promo">{{ promocion.nombre }}</h1>
      <div class="seccion-info">
        <p class="descripcion-promo"><strong>Descripción:</strong> {{ promocion.descripcion }}</p>
        <div class="bloque-precios">
          <div class="precio-contenedor">
            <span v-if="promocion.descuento && promocion.descuento > 0" class="precio-original">
              ${{ promocion.precio }}
            </span>
            <span class="precio-final">
              ${{ promocion.precioFinal || promocion.precio }}
            </span>
          </div>
          <p v-if="promocion.descuento && promocion.descuento > 0" class="porcentaje-descuento">
            <strong>Descuento:</strong> <span class="tag-rojo">{{ promocion.descuento }}% OFF</span>
          </p>
        </div>
        <p class="categorias-promo"><strong>Categorías:</strong>
          <span v-for="(cat, idx) in promocion.categorias" :key="idx" class="badge-categoria">
            {{ cat.nombre }}<span v-if="idx < promocion.categorias.length - 1">, </span>
          </span>
        </p>
      </div>
      <div class="seccion-productos">
        <h3>Productos incluidos:</h3>
        <ul class="lista-productos-incluidos">
          <li v-for="p in promocion.productosIncluidos" :key="p.id" class="item-producto-incluido">
            <span class="nombre-p-inc">🍬 {{ p.nombre }}</span> 
            <span class="cantidad-p-inc">x{{ p.PromoProducto?.cantidad || 1 }}</span> 
            <span class="stock-p-inc">| Stock: {{ p.stock }}</span>
            <span v-if="p.stock <= 0" class="tag-sin-stock">🚫 Sin stock</span>
          </li>
        </ul>
      </div>
      <button 
        @click="agregarAlCarrito" 
        :disabled="!sePuedeAgregar"
        class="btn-accion-promo"
        :class="{ 'btn-deshabilitado': !sePuedeAgregar }"
      >
        {{ sePuedeAgregar ? '🛒 Agregar promoción al carrito' : '🚫 No disponible' }}
      </button>
    </div>
    <div v-else-if="cargando" class="estado-mensaje cargando">Cargando detalles del combo...</div>
    <div v-else-if="error" class="estado-mensaje error">⚠️ {{ error }}</div>
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
  margin: 8px 0 0 0;
}

.tag-rojo {
  background-color: #e60000;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 14px;
}

.badge-categoria {
  font-size: 15px;
  color: #444;
  font-weight: 600;
}

.seccion-productos h3 {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.lista-productos-incluidos {
  list-style: none;
  padding: 0;
  margin: 0 0 35px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-producto-incluido {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #eee;
  border-left: 5px solid #333;
  padding: 12px 18px;
  border-radius: 6px;
  font-size: 15px;
}

.nombre-p-inc {
  font-weight: 600;
  flex-grow: 1;
}

.cantidad-p-inc {
  font-weight: 700;
  color: #e60000;
  margin-right: 15px;
  font-size: 16px;
}

.stock-p-inc {
  color: #777;
  font-size: 14px;
}

.tag-sin-stock {
  background-color: #fff5f5;
  color: #dc3545;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
  border: 1px solid #fdf2f2;
}

.btn-accion-promo {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background-color: #e60000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 4px 12px rgba(230, 0, 0, 0.15);
}

.btn-accion-promo:hover:not(:disabled) {
  background-color: #c90000;
}

.btn-accion-promo:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-accion-promo:disabled {
  background-color: #cccccc;
  color: #ffffff;
  cursor: not-allowed;
  box-shadow: none;
  border: none;
}

.btn-deshabilitado {
  background-color: #cccccc;
  color: #ffffff;
  cursor: not-allowed;
  box-shadow: none;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.cargando {
  color: #666;
  background-color: #f9f9f9;
}

.error {
  color: #b52a37;
  background-color: #fff5f5;
  border: 1px solid #f8d7da;
}
</style>