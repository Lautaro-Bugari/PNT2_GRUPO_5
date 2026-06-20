import { defineStore } from "pinia"
import { ref } from "vue"
import { useStorePromos } from "./storePromos"


const url = "https://6a1f458eb79eec0d6cf0a121.mockapi.io/api2/productos"

export const useStoreProducto = defineStore("storeProducto", () => {
    const productos = ref([])

    const actualizarProductos = async () => {
        const response = await fetch(url)
        const data = await response.json()
        productos.value = data
    }
    const getProductos = async () => {
        await actualizarProductos()
        return productos.value
    }

    const getIdProductosSinStock = async () => { 
        await actualizarProductos()
        const ids = productos.value.filter(producto => producto.cantStock === 0).map(producto => producto.id)
        await validarPromos(ids)
        return ids
    }

    const validarPromos = async (ids) => {
        
    const storePromos = useStorePromos()
        const promociones = await storePromos.getPromociones()
        const promocionesADesabilitar = promociones.filter(promocion => promocion.productos.some(p => ids.includes(p.id)))
        if (promocionesADesabilitar.length > 0) {
            await storePromos.actualizarPromociones() 
        }
    }


    return {
        actualizarProductos,
        getProductos,
        getIdProductosSinStock
    }
})