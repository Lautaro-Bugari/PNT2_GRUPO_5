import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useStoreProducto } from "./storeProducto"


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

return {
  agregarAlCarrito,
  guardarCarrito,
  setCarrito,
  setCarritoId,
  vaciarCarrito,
  getCantidadTotal

}

})