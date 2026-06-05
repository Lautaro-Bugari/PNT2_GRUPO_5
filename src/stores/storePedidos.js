import { defineStore } from "pinia"
import { ref } from "vue"
import { useStoreCarrito } from "./storeCarrito"

export const useStorePedidos = defineStore("storePedidos", () => {
  const storeCarrito = useStoreCarrito()
  const pedidos = ref([])

  // Cargar pedidos desde localStorage al inicializar
  const cargarPedidos = () => {
    const pedidosGuardados = localStorage.getItem("pnt2_pedidos")
    if (pedidosGuardados) {
      try {
        pedidos.value = JSON.parse(pedidosGuardados)
      } catch (e) {
        console.error("Error al parsear pedidos guardados", e)
        pedidos.value = []
      }
    }
  }

  // Guardar pedidos en localStorage
  const guardarPedidos = () => {
    localStorage.setItem("pnt2_pedidos", JSON.stringify(pedidos.value))
  }

  // Inicializar cargando los pedidos
  cargarPedidos()

  const crearPedido = async (datosFacturacion, subtotal, costoEnvio) => {
    const idPedido = Math.floor(100000 + Math.random() * 900000)
    
    // Clonamos los ítems del carrito para evitar referencias reactivas directas
    const items = storeCarrito.carrito.map(item => ({
      id: item.id,
      nombre: item.nombre,
      precioUnitario: item.precio,
      imagen: item.imagen,
      cantidad: item.cantidad
    }))

    const nuevoPedido = {
      idPedido,
      fecha: new Date().toISOString(),
      items,
      datosFacturacion: { ...datosFacturacion },
      subtotal,
      costoEnvio,
      totalFinal: subtotal + costoEnvio,
      estadoActual: "Recibido"
    }

    pedidos.value.push(nuevoPedido)
    guardarPedidos()

    // Vaciar el carrito en el store y sincronizar con backend
    storeCarrito.vaciarCarrito()
    
    return nuevoPedido
  }

  const obtenerPedido = (idPedido) => {
    return pedidos.value.find(p => p.idPedido === parseInt(idPedido))
  }

  const actualizarEstadoPedido = (idPedido, nuevoEstado) => {
    const pedido = pedidos.value.find(p => p.idPedido === parseInt(idPedido))
    if (pedido) {
      pedido.estadoActual = nuevoEstado
      guardarPedidos()
    }
  }

  return {
    pedidos,
    crearPedido,
    obtenerPedido,
    actualizarEstadoPedido
  }
})
