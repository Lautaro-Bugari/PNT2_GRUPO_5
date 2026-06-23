<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStorePedidos } from "../stores/storePedidos"

const storePedidos = useStorePedidos()
const router = useRouter()

const listaPedidos = ref([])
const cargando = ref(true)

const cargarPedidos = async () => {
    try {
    const data = await storePedidos.getPedidos()
    if (data) {
        listaPedidos.value = data
    } else {
        listaPedidos.value = []
    }
    } catch (error) {
    console.error("Error al cargar los pedidos para el admin:", error)
    } finally {
    cargando.value = false
    }
}

const verDetallePedido = (idPedido) => {
    if (idPedido) {
    router.push(`/pedido/${idPedido}`)
    }
}

const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ""
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
    })
}

onMounted(async () => {
    if (!authStore.usuarioLogueado) {
    router.push({ path: '/login', query: { redirect: '/admin/pedidos' } })
    return
    }
    if (!authStore.esAdmin) {
    router.push({ path: '/' })
    return
    }
    await cargarPedidos()
})

</script>

<template>
    <div class="contenedor-admin-pedidos">
    <h1 class="titulo-admin">Panel de Administración: Pedidos</h1>
    <div v-if="cargando" class="estado-mensaje">
        Cargando listado de pedidos...
    </div>
    <div v-else class="bloque-contenido-pedidos">
        <div v-if="listaPedidos.length === 0" class="pedidos-vacios">
        <p>No hay pedidos registrados en el sistema actualmente.</p>
    </div>
    <div v-else class="tabla-contenedor">
        <table class="tabla-admin">
            <thead>
            <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Cliente / Razón Social</th>
                <th>Entrega</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Estado Actual</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="pedido in listaPedidos" :key="pedido.idPedido">
                <td class="id-pedido-celda"><strong>#{{ pedido.idPedido }}</strong></td>
                <td>{{ formatearFecha(pedido.fecha) }}</td>
                <td class="nombre-destacado">
                {{ pedido.datosFacturacion?.nombreCompleto || 'Cliente General' }}
                </td>
                <td>
                <span class="tag-entrega">
                    {{ pedido.datosFacturacion?.metodoEntrega === 'Retiro' ? 'Retiro' : 'Envío' }}
                </span>
                </td>
                <td>{{ pedido.datosFacturacion?.metodoPago }}</td>
                <td class="precio-destacado">${{ pedido.totalFinal?.toLocaleString() }}</td>
                <td>
                <span class="badge-estado">
                    {{ pedido.estadoActual || 'Recibido' }}
                </span>
                </td>
                <td class="acciones-tabla">
                <button @click="verDetallePedido(pedido.idPedido)" class="boton-accion boton-ver">
                    🔍 Ver Detalles y Gestionar
                </button>
                </td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
    </div>
</template>

<style scoped>
.contenedor-admin-pedidos {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #2b2b2b;
}

.titulo-admin {
    font-size: 34px;
    font-weight: 800;
    color: #e60000;
    margin-bottom: 30px;
    border-bottom: 3px solid #333;
    padding-bottom: 12px;
}

.tabla-contenedor {
    background: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow-x: auto;
}

.tabla-admin {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 16px;
}

.tabla-admin th {
    background-color: #f8f9fa;
    color: #333;
    padding: 16px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    border-bottom: 2px solid #eaeaea;
}

.tabla-admin td {
    padding: 18px 16px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
}

.id-pedido-celda {
    color: #e60000;
}

.nombre-destacado {
    font-weight: 700;
    color: #111;
}

.precio-destacado {
    font-weight: 800;
    color: #2b2b2b;
}

.tag-entrega {
    background-color: #f1f3f5;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 14px;
}

.badge-estado {
    background-color: #333;
    color: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    display: inline-block;
    letter-spacing: 0.5px;
}

.acciones-tabla {
    display: flex;
    gap: 10px;
}

.boton-accion {
    background: #ffffff;
    border: 1px solid #ccc;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 700;
    color: #444;
    transition: all 0.2s;
    white-space: nowrap;
}

.boton-ver:hover {
    background-color: #fff5f5;
    border-color: #e60000;
    color: #e60000;
}

.estado-mensaje, .pedidos-vacios {
    text-align: center;
    padding: 50px;
    font-size: 16px;
    font-weight: 500;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eaeaea;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.pedidos-vacios p {
    color: #666;
    font-style: italic;
    margin: 0;
}
</style>