import { defineStore } from "pinia"
import { ref } from "vue"
import { useStorePromos } from "./storePromos"

const API_URL = "http://localhost:8000"

export const useStoreProducto = defineStore("storeProducto", () => {
    const productos = ref([])


    const desactivarProducto = async (id) => {
        try {
            const response = await fetch(`${API_URL}/producto/${id}/desactivar`, {
                method: 'PATCH'
            })
            if (!response.ok) console.error(`Error al desactivar producto ${id}`)
        } catch (error) {
            console.error(`Error en desactivarProducto(${id}):`, error)
        }
    }

    const desactivarProductosSinStock = async (productosList) => {
        // Filtrar productos simples (tienen stock y categoriaId, no tienen productosIncluidos)
        const productosSimples = productosList.filter(p => 
            p.stock !== undefined && 
            p.categoriaId !== undefined && 
            !p.productosIncluidos // las promociones tienen este campo
        )
        
        const idsSinStock = productosSimples
            .filter(p => p.stock === 0)
            .map(p => p.id)

        if (idsSinStock.length === 0) return []

        await Promise.all(idsSinStock.map(id => desactivarProducto(id)))
        return idsSinStock
    }


    const desactivarPromocionesPorProductos = async (idsProductos) => {
        if (!idsProductos || idsProductos.length === 0) return

        const storePromos = useStorePromos()
        const promociones = await storePromos.getPromociones()

        const idsPromosADesactivar = promociones
            .filter(promo => {
                const productosIncluidos = promo.productosIncluidos || promo.productos || []
                return productosIncluidos.some(p => idsProductos.includes(p.id))
            })
            .map(p => p.id)

        if (idsPromosADesactivar.length === 0) return

        storePromos.desactivarPromociones(idsPromosADesactivar)

    }


    const actualizarProductos = async () => {
        try {
            const response = await fetch(`${API_URL}/productos`)
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)
            const data = await response.json()
            productos.value = data.data || []

            const idsSinStock = await desactivarProductosSinStock(productos.value)


        if (idsSinStock.length > 0) {
            await desactivarPromocionesPorProductos(idsSinStock)

            const responseActualizado = await fetch(`${API_URL}/productos`)
            if (!responseActualizado.ok) throw new Error(`Error ${responseActualizado.status}`)
            const dataActualizado = await responseActualizado.json()
            productos.value = dataActualizado.data || []
        }

        } catch (error) {
            console.error("Error al obtener productos:", error)
            productos.value = []
        }
    }

const getProductoById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/producto/${id}`)
    if (!response.ok) throw new Error('Producto no encontrado')
   const result = await response.json()
    return result.data
  } catch (error) {
    console.error(error)
    return null
  }
}


    const getProductos = async () => {
         await actualizarProductos()
        return productos.value
    }

    const getIdProductosSinStock = async () => {
        if (productos.value.length === 0) await actualizarProductos()
        return productos.value
            .filter(p => (p.stock || 0) === 0 && p.categoriaId !== undefined && !p.productosIncluidos)
            .map(p => p.id)
    }

    return {
        actualizarProductos,
        getProductos,
        getIdProductosSinStock,
        getProductoById
    }
})