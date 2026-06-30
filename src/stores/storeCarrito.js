import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useStoreProducto } from "./storeProducto"
import { useStorePromos } from './storePromos'


const url = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/carts"

export const useStoreCarrito = defineStore("storeCarrito", () => {

  const carrito = ref([])
  const carritoId = ref(null)

 const agregarAlCarrito = async (producto) => {
      const storeProducto = useStoreProducto()
      const storePromos = useStorePromos()

  let productoCompleto = await storeProducto.getProductoById(producto.id)
  let esPromocion = false
  if (!productoCompleto) {
    productoCompleto = await storePromos.getPromocionById(producto.id)
    esPromocion = true
  }
  if (!productoCompleto) {
    alert('❌ Producto no encontrado.')
    return
  }

  const itemCarrito = carrito.value.find(i => i.id === producto.id)
  const nuevaCantidad = itemCarrito ? itemCarrito.cantidad + 1 : 1

  if (esPromocion) {
    // Verificar stock de cada producto incluido en la promoción
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
      const maxUnidades = Math.min(
        ...productosIncluidos.map(p => 
          Math.floor(p.stock / (p.PromoProducto?.cantidad || 1))
        )
      )
      alert(`⚠️ Stock insuficiente para la promoción. Solo puedes tener ${maxUnidades} unidades en total.`)
      return
    }
  } else {
    // Producto simple: verificar stock
    if (nuevaCantidad > productoCompleto.stock) {
      alert(`⚠️ No hay suficiente stock. Máximo disponible: ${productoCompleto.stock} unidades.`)
      return
    }
  }

  if (itemCarrito) {
    itemCarrito.cantidad = nuevaCantidad
  } else {
    carrito.value.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen || 'https://via.placeholder.com/400',
      cantidad: 1
    })
  }

  await guardarCarrito()
}

  const guardarCarrito = async () => {
    if (!carritoId.value) return
    const storeProducto = useStoreProducto()
    const productosSinStock = await storeProducto.getIdProductosSinStock()
    const carritoActualizado = carrito.value.filter(item => !productosSinStock.includes(item.id))
    carrito.value = carritoActualizado
    
    await fetch(`${url}/${carritoId.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemsProductos: carrito.value
      })
    })
  }

  const setCarrito = (nuevoCarrito, id) => {
    carrito.value = nuevoCarrito
    carritoId.value = id
  }

  const setCarritoId = (id) => {
    carritoId.value = id
  }

const vaciarCarrito = async () => {
  const id = carritoId.value
  if (!id) {
    carrito.value = []
    return
  }

  try {
    await fetch(`${url}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemsProductos: [] })
    })
    carrito.value = []
  } catch (error) {
    console.error("Error al vaciar carrito en MockAPI:", error)
    carrito.value = []
  }
}

    const limpiarCarrito = () => {
    carrito.value = []
    carritoId.value = null
  }

  const getCantidadTotal = computed(() => {

    return carrito.value.reduce(
      (total, itemCarrito) => total + itemCarrito.cantidad,
      0
    )

  })

const obtenerTodosLosCarritos = async () => {
  let resultadoCarritos = []
  try {
    const response = await fetch(url)
    resultadoCarritos = await response.json()
  } catch (error) {
    console.error("Error al traer todos los carritos del store:", error)
  }
  return resultadoCarritos
}

const eliminarProducto = async (productoId) => {
  carrito.value = carrito.value.filter(item => item.id != productoId)
  await guardarCarrito()
}

return {
  carrito,
  agregarAlCarrito,
  guardarCarrito,
  setCarrito,
  setCarritoId,
  vaciarCarrito,
  limpiarCarrito,
  getCantidadTotal,
  obtenerTodosLosCarritos,
  eliminarProducto
}

})