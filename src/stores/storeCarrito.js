import { defineStore } from "pinia"
import { ref, computed } from "vue"

const url = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/carts"

export const useStoreCarrito = defineStore("storeCarrito", () => {

  const carrito = ref([])
  const carritoId = ref(null)

  const agregarAlCarrito = async (producto) => {

    const itemCarrito = carrito.value.find(
      i => i.id === producto.id
    )

    if (itemCarrito) {
      itemCarrito.cantidad++
        await guardarCarrito()
        return
    }


    carrito.value.push(
{
  id: producto.id,
  nombre: producto.nombre,
  precio: producto.precio,
  imagen: producto.imagen,
  cantidad: 1
})
    await guardarCarrito()
  }

  const guardarCarrito = async () => {

    if (!carritoId.value) return

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

  const vaciarCarrito = () => {
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
  guardarCarrito,
  setCarrito,
  setCarritoId,
  vaciarCarrito,
  getCantidadTotal

}

})