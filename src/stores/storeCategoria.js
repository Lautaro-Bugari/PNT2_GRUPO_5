import { defineStore } from "pinia"
import { ref } from "vue"

const API_URL = "http://localhost:8000"

export const useStoreCategoria = defineStore("storeCategoria", () => {
  const categorias = ref([])

  const getAll = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`)
      const data = await response.json()
      categorias.value = data.data || []
      return categorias.value
    } catch (error) {
      console.error("Error en getAll:", error)
      categorias.value = []
      return []
    }
  }

  const getById = async (id) => {
    try {
      const response = await fetch(`${API_URL}/categorias/${id}`)
      if (!response.ok) throw new Error("Categoría no encontrada")
      const data = await response.json()
      return data.data || null
    } catch (error) {
      console.error("Error en getById:", error)
      return null
    }
  }

  const create = async (categoriaData) => {
    try {
      const response = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear categoría")
      }
      const data = await response.json()
      await getAll() // recargar lista
      return data.data || null
    } catch (error) {
      console.error("Error en create:", error)
      throw error
    }
  }

  const update = async (id, categoriaData) => {
    try {
      const response = await fetch(`${API_URL}/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar categoría")
      }
      const data = await response.json()
      await getAll() // recargar lista
      return data.data || null
    } catch (error) {
      console.error("Error en update:", error)
      throw error
    }
  }

  return {
    categorias,
    getAll,
    getById,
    create,
    update
  }
})