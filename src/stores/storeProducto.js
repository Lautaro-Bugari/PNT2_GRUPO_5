import { defineStore } from "pinia"
import { ref } from "vue"

const API_URL = "http://localhost:8000"

export const useStoreProducto = defineStore("storeProducto", () => {
    const productos = ref([]) // lista pública (unificada)

    // ---------- MÉTODOS PÚBLICOS ----------
    const actualizarProductos = async () => {
        try {
            const response = await fetch(`${API_URL}/productos`)
            if (!response.ok) throw new Error(`Error ${response.status}`)
            const data = await response.json()
            productos.value = data.data
        } catch (error) {
            console.error("Error al obtener productos:", error)
        }
    }

    const getProductos = async () => {
        await actualizarProductos()
        return productos.value
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

    // ---------- MÉTODOS DE ADMIN ----------
    const getAllProductos = async () => {
        try {
            const response = await fetch(`${API_URL}/producto/`)
            if (!response.ok) throw new Error('Error al obtener productos')
            const data = await response.json()
            return data.data
        } catch (error) {
            console.error('Error en getAllProductos:', error)
            return []
        }
    }

    const createProducto = async (productoData) => {
        try {
            const response = await fetch(`${API_URL}/producto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productoData)
            })
            const data = await response.json()
            if (!response.ok) {
                const mensaje = data.message || data.error || 'Error al crear producto'
                throw new Error(mensaje)
            }
            return data.data || null
        } catch (error) {
            console.error('Error en createProducto:', error)
            throw error // relanzamos para que el componente lo capture
        }
    }

    const updateProducto = async (id, productoData) => {
        try {
            const response = await fetch(`${API_URL}/producto/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productoData)
            })
            if (!response.ok) throw new Error('Error al actualizar producto')
            const data = await response.json()
            return data.data
        } catch (error) {
            console.error('Error en updateProducto:', error)
            throw error
        }
    }

    const desactivarProducto = async (id) => {
        try {
            const response = await fetch(`${API_URL}/producto/${id}/desactivar`, {
                method: 'PATCH'
            })
            if (!response.ok) throw new Error('Error al desactivar producto')
            return true
        } catch (error) {
            console.error('Error en desactivarProducto:', error)
            throw error
        }
    }

    const reactivarProducto = async (id) => {
        try {
            const response = await fetch(`${API_URL}/producto/${id}/reactivar`, {
                method: 'PATCH'
            })
            if (!response.ok) throw new Error('Error al reactivar producto')
            return true
        } catch (error) {
            console.error('Error en reactivarProducto:', error)
            throw error
        }
    }

    const getIdProductosSinStock = async () => {
        const todos = await getAllProductos()
        return todos
            .filter(p => (p.stock || 0) === 0)
            .map(p => p.id)
    }


    return {
        // Públicos
        actualizarProductos,
        getProductos,
        getProductoById,
        // Admin
        getAllProductos,
        createProducto,
        updateProducto,
        desactivarProducto,
        reactivarProducto,
        getIdProductosSinStock
    }
})