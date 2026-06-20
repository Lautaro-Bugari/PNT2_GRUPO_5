import { defineStore } from "pinia"
import { ref } from "vue"

const url = "https://6a1f458eb79eec0d6cf0a121.mockapi.io/api2/promociones"

export const useStorePromos = defineStore("storePromos", () => {
    const promos = ref([])
    const actualizarPromociones = async () => {
        const response = await fetch(url)
        const data = await response.json()
        promos.value = data.filter(promocion => promocion.productos.every(p => p.cantStock > 0))
    }
    const getPromociones = async () => {
        await actualizarPromociones()
        return promos.value
     }
         return {
        actualizarPromociones,
        getPromociones
     }
    })