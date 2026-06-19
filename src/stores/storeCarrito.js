import { defineStore } from "pinia"
import { ref, computed } from "vue"

const url = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/carts"

export const useStoreCarrito = defineStore("storeCarrito", () => {

  const carrito = ref([])
  const carritoId = ref(null)

  const agregarAlCarrito = async (producto, cantidad = 1) => {

    const cantidadValida = Math.max(1, Number(cantidad) || 1)

    const itemCarrito = carrito.value.find(
      i => i.id === producto.id
    )

    if (itemCarrito) {
      itemCarrito.cantidad += cantidadValida
      await guardarCarrito()
      return
    }


    carrito.value.push(
{
  id: producto.id,
  nombre: producto.nombre,
  precio: producto.precio,
  imagen: producto.imagen,
  cantidad: cantidadValida
})
    await guardarCarrito()
  }

  const cambiarCantidad = async (productoId, cantidad) => {
    const itemCarrito = carrito.value.find(i => i.id === productoId)
    if (!itemCarrito) return

    const nuevaCantidad = Number(cantidad)
    if (nuevaCantidad < 1) {
      await eliminarDelCarrito(productoId)
      return
    }

    itemCarrito.cantidad = nuevaCantidad
    await guardarCarrito()
  }

  const eliminarDelCarrito = async (productoId) => {
    carrito.value = carrito.value.filter(i => i.id !== productoId)
    await guardarCarrito()
  }

  const guardarCarrito = async () => {

    if (!carritoId.value) return

    const response = await fetch(`${url}/${carritoId.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemsProductos: carrito.value
      })
    })

    if (!response.ok) {
      throw new Error("No se pudo guardar el carrito")
    }
  }

  const setCarrito = (nuevoCarrito, id) => {
    carrito.value = Array.isArray(nuevoCarrito) ? nuevoCarrito : []
    carritoId.value = id
  }

  const setCarritoId = (id) => {
    carritoId.value = id
  }

  const vaciarCarrito = async () => {
    carrito.value = []
    await guardarCarrito()
  }

  const limpiarSesion = () => {
    carrito.value = []
    carritoId.value = null
  }

  const getCantidadTotal = computed(() => {

    return carrito.value.reduce(
      (total, itemCarrito) => total + itemCarrito.cantidad,
      0
    )

  })

return {
  carrito,
  carritoId,
  agregarAlCarrito,
  cambiarCantidad,
  eliminarDelCarrito,
  guardarCarrito,
  setCarrito,
  setCarritoId,
  vaciarCarrito,
  limpiarSesion,
  getCantidadTotal

}

})
