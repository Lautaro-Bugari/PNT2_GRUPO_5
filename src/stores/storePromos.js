import { defineStore } from "pinia"
import { ref } from "vue"

const API_URL = "http://localhost:8000"
export const useStorePromos = defineStore("storePromos", () => {
    const promos = ref([])
    const promosActivas = ref([])


    const getAllPromociones = async () => {
        try {
            const response = await fetch(`${API_URL}/promociones/all`)
/*             if (!response.ok) throw new Error(`Error ${response.status}`) */
            const data = await response.json()
            promos.value = data.data || []
            return promos.value
        } catch (error) {
            console.error("Error al obtener todas las promociones:", error)
            promos.value = []
            return []
        }
    }


    const getPromociones = async () => {
            const response = await fetch(`${API_URL}/promociones`)
/*             if (!response.ok) throw new Error(`Error ${response.status}`)
 */            const data = await response.json()
            promosActivas.value = data.data || []
            return promosActivas.value
}

const desactivarPromocion = async (id) => {
        try {
            const response = await fetch(`${API_URL}/promociones/${id}/desactivar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error(`Error al desactivar promoción ${id}`)
            const promo = promos.value.find(p => p.id === id)
            if (promo) promo.habilitado = false
            promosActivas.value = promosActivas.value.filter(p => p.id !== id)
            return true
        } catch (error) {
            console.error(`Error en desactivarPromocion(${id}):`, error)
            return false
        }
    }

     const desactivarPromociones = async (ids) => {
        if (!ids || ids.length === 0) return []
        const resultados = await Promise.all(ids.map(id => desactivarPromocion(id)))
        await getAllPromociones()
        return resultados
    }

    const getPromocionById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/promociones/${id}`)
    if (!response.ok) throw new Error('Promoción no encontrada')
    const data = await response.json()
    return {
      ...data,
      precioFinal: data.descuento ? data.precio * (1 - data.descuento / 100) : data.precio
    }
  } catch (error) {
    console.error('Error en getPromocionById:', error)
    return null
  }
}

 const reactivarPromocion = async (id) => {
        try {
            const response = await fetch(`${API_URL}/promociones/${id}/reactivar`, {
                method: 'PATCH'
            })
            if (!response.ok) throw new Error(`Error al reactivar promoción ${id}`)
            const promo = promos.value.find(p => p.id === id)
            if (promo) promo.habilitado = true
            return true
        } catch (error) {
            console.error(`Error en reactivarPromocion(${id}):`, error)
            return false
        }
    }

    return {
        getAllPromociones,
        getPromociones,
        desactivarPromocion,
        desactivarPromociones,
        reactivarPromocion,
        getPromocionById
    }
})