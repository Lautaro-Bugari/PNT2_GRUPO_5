import { defineStore } from "pinia"
import { ref } from "vue"

const API_URL = "http://localhost:8000"

export const useStorePromos = defineStore("storePromos", () => {
    const promos = ref([])
    const promosActivas = ref([])

    // ---------- OBTENER TODAS (admin) ----------
    const getAllPromociones = async () => {
        try {
            const response = await fetch(`${API_URL}/promociones/all`)
            const data = await response.json()
            promos.value = data.data || []
            return promos.value
        } catch (error) {
            console.error("Error al obtener todas las promociones:", error)
            promos.value = []
            return []
        }
    }

    // ---------- OBTENER SOLO ACTIVAS (público) ----------
    const getPromociones = async () => {
        try {
            const response = await fetch(`${API_URL}/promociones`)
            const data = await response.json()
            promosActivas.value = data.data || []
            return promosActivas.value
        } catch (error) {
            console.error("Error al obtener promociones activas:", error)
            promosActivas.value = []
            return []
        }
    }

    // ---------- OBTENER POR ID ----------
    const getPromocionById = async (id) => {
        try {
            const response = await fetch(`${API_URL}/promociones/${id}`)
            if (!response.ok) throw new Error('Promoción no encontrada')
            const result = await response.json()
            return result
        } catch (error) {
            console.error('Error en getPromocionById:', error)
            return null
        }
    }

    // ---------- CREAR PROMOCIÓN ----------
    const createPromocion = async (promocionData) => {
        try {
            const response = await fetch(`${API_URL}/promociones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promocionData)
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al crear promoción')
            }
            const data = await response.json()
            // Actualizar lista local
            await getAllPromociones()
            return data.data || null
        } catch (error) {
            console.error('Error en createPromocion:', error)
            throw error
        }
    }

    // ---------- ACTUALIZAR PROMOCIÓN ----------
    const updatePromocion = async (id, promocionData) => {
        try {
            const response = await fetch(`${API_URL}/promociones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promocionData)
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al actualizar promoción')
            }
            const data = await response.json()
            // Actualizar lista local
            await getAllPromociones()
            return data.data || null
        } catch (error) {
            console.error('Error en updatePromocion:', error)
            throw error
        }
    }

    // ---------- DESACTIVAR PROMOCIÓN ----------
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

    // ---------- DESACTIVAR MÚLTIPLES ----------
    const desactivarPromociones = async (ids) => {
        if (!ids || ids.length === 0) return []
        const resultados = await Promise.all(ids.map(id => desactivarPromocion(id)))
        await getAllPromociones()
        return resultados
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

    // ---------- EXPORTAR ----------
    return {
        getAllPromociones,
        getPromociones,
        getPromocionById,
        createPromocion,
        updatePromocion,
        desactivarPromocion,
        desactivarPromociones,
        reactivarPromocion
    }
})