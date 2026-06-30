<script setup>
import { ref, computed } from 'vue'
import { useStoreCarrito } from '../stores/storeCarrito'
import { useStoreProducto } from '../stores/storeProducto'
import { useStorePromos } from '../stores/storePromos'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  producto: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['login-required'])

const storeCarrito = useStoreCarrito()
const storeProducto = useStoreProducto()
const storePromos = useStorePromos()
const authStore = useAuthStore()

const itemEnCarrito = computed(() => 
  storeCarrito.carrito.find(item => item.id === props.producto.id)
)

const estaEnCarrito = computed(() => !!itemEnCarrito.value)
const cantidad = computed(() => itemEnCarrito.value?.cantidad || 0)

const puedeIncrementar = ref(true)

const agregar = async () => {
  if (!authStore.usuarioLogueado) {
    emit('login-required')
    return
  }
  try {
      await storeCarrito.agregarAlCarrito(props.producto)
  } catch (error) {
    console.error('Error al agregar al carrito:', error)
    alert(`❌ ${error.message || 'Error al agregar al carrito'}`)
  }
}


const incrementar = async () => {
  if (!authStore.usuarioLogueado) {
    emit('login-required')
    return
  }

  let productoCompleto = await storeProducto.getProductoById(props.producto.id)
  let esPromocion = false
  if (!productoCompleto) {
    productoCompleto = await storePromos.getPromocionById(props.producto.id)
    esPromocion = true
  }
  if (!productoCompleto) {
    alert('❌ Producto no encontrado.')
    return
  }

  const nuevaCantidad = cantidad.value + 1

  if (esPromocion) {
    const productosIncluidos = productoCompleto.productosIncluidos || []
    if (productosIncluidos.length === 0) {
      alert('⚠️ Esta promoción no contiene productos.')
      return
    }

    const stockInsuficiente = productosIncluidos.some(p => {
      const cantidadPorUnidad = p.PromoProducto?.cantidad || 1
      const totalRequerido = cantidadPorUnidad * nuevaCantidad
      return p.stock < totalRequerido
    })

    if (stockInsuficiente) {
      alert(`⚠️ Stock insuficiente para la promoción ${productoCompleto.nombre}.`)
      return
    }
  } else {
    // Producto simple
    if (nuevaCantidad > productoCompleto.stock) {
      alert(`⚠️ No hay suficiente stock. Máximo disponible: ${productoCompleto.stock} unidades.`)
      return
    }
  }
  const item = itemEnCarrito.value
  if (item) {
    item.cantidad = nuevaCantidad
    await storeCarrito.guardarCarrito()
  }
}
const decrementar = async () => {
  if (!authStore.usuarioLogueado) {
    emit('login-required')
    return
  }

  const item = itemEnCarrito.value
  if (!item) return

  const nuevaCantidad = cantidad.value - 1
  if (nuevaCantidad <= 0) {
     await storeCarrito.eliminarProducto(props.producto.id) 

  } else {
    item.cantidad = nuevaCantidad
    await storeCarrito.guardarCarrito()
  }
}
</script>

<template>
  <div class="boton-carrito-wrapper">
    <div v-if="estaEnCarrito" class="control-cantidad">
      <button @click="decrementar" class="btn-cantidad" >−</button>
      <span class="cantidad-texto">{{ cantidad }}</span>
      <button @click="incrementar" class="btn-cantidad" :disabled="!puedeIncrementar">+</button>
    </div>
    <button v-else @click="agregar" class="btn-agregar">
      🛒 Agregar al carrito
    </button>
  </div>
</template>


<style scoped>
.boton-carrito-wrapper {
  flex: 1;
  display: flex;
}

.btn-agregar {
  width: 100%;
  height: 46px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: #e60000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: .2s;
}

.btn-agregar:hover {
  background: #c90000;
}

.control-cantidad {
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-cantidad {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.cantidad-texto {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
}
</style>