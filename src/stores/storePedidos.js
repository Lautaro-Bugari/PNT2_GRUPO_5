import { defineStore } from "pinia"
import { ref } from "vue"
import { useStoreCarrito } from "./storeCarrito"
import { useAuthStore } from "./authStore"

const API_URL = "https://6a4411586dba791499abd1e8.mockapi.io/Pedidos"

export const useStorePedidos = defineStore("storePedidos", () => {
  const storeCarrito = useStoreCarrito()
  const authStore = useAuthStore()
  const pedidos = ref([])

  const obtenerPedidos = async () => {
    try {
      let url = API_URL
      const response = await fetch(url)
      if (!response.ok) throw new Error("Error al obtener pedidos")
      const data = await response.json()
      pedidos.value = data
      return data
    } catch (error) {
      console.error("Error en obtenerPedidos:", error)
      pedidos.value = []
      return []
    }
  }

  const obtenerPedidosUsuario = async (usuarioId) => {
    try {
      let url = API_URL
      if (usuarioId) {
        url += `?usuarioId=${usuarioId}`
      }
      const response = await fetch(url)
      if (!response.ok) throw new Error("Error al obtener pedidos")
      const data = await response.json()
      pedidos.value = data
      return data
    } catch (error) {
      console.error("Error en obtenerPedidos:", error)
      pedidos.value = []
      return []
    }
  }

  const obtenerPedido = async (idPedido) => {
    try {
      const response = await fetch(`${API_URL}?idPedido=${idPedido}`)
      if (!response.ok) throw new Error("Pedido no encontrado")
      const data = await response.json()
      return data.length > 0 ? data[0] : null
    } catch (error) {
      console.error("Error en obtenerPedido:", error)
      return null
    }
  }

  const crearPedido = async (datosFacturacion, subtotal, costoEnvio) => {
    try {
      const usuarioId = authStore.usuarioLogueado?.id || null
      if (!usuarioId) throw new Error("Usuario no autenticado")


      const items = storeCarrito.carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precioUnitario: item.precio,
        imagen: item.imagen || 'https://via.placeholder.com/400',
        cantidad: item.cantidad
      }))

      const nuevoPedido = {
        usuarioId,
        fecha: new Date().toISOString(),
        items,
        datosFacturacion: { ...datosFacturacion },
        subtotal,
        costoEnvio,
        totalFinal: subtotal + costoEnvio,
        estadoActual: "Recibido"
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPedido)
      })

      if (!response.ok) throw new Error("Error al crear el pedido")

      const pedidoCreado = await response.json()
      pedidos.value.push(pedidoCreado)
      storeCarrito.vaciarCarrito()
      return pedidoCreado
    } catch (error) {
      console.error("Error en crearPedido:", error)
      throw error
    }
  }

  const actualizarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      const pedido = await obtenerPedido(idPedido)
      if (!pedido) throw new Error("Pedido no encontrado")

         console.log("Pedido completo:", pedido)
         console.log("ID de MockAPI:", pedido.id)

      const response = await fetch(`${API_URL}/${idPedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pedido, estadoActual: nuevoEstado })
      })

      if (!response.ok) throw new Error("Error al actualizar estado")

      const pedidoActualizado = await response.json()
      const index = pedidos.value.findIndex(p => p.idPedido === idPedido)
      if (index !== -1) {
        pedidos.value[index] = pedidoActualizado
      }
      return pedidoActualizado
    } catch (error) {
      console.error("Error en actualizarEstadoPedido:", error)
      throw error
    }
  }

  const cargarPedidosDelUsuario = async () => {
    const usuarioId = authStore.usuarioLogueado?.id
    if (usuarioId) {
      await obtenerPedidosUsuario(usuarioId)
    } else {
      pedidos.value = []
    }
  }

  return {
    pedidos,
    obtenerPedidos,
    obtenerPedidosUsuario,
    obtenerPedido,
    crearPedido,
    actualizarEstadoPedido,
    cargarPedidosDelUsuario
  }
})