import { defineStore } from "pinia";
import { ref, computed } from "vue"

export const useStoreCarrito = defineStore("storeCarrito", () => {
    const carrito = ref([]);
    const agregarAlCarrito = (producto) => {
        if (carrito.value.some(p => p.id === producto.id)) {
            const prodEnCarrito = carrito.value.find(p => p.id === producto.id);
            prodEnCarrito.cantidad++;
            return;
        }
        carrito.value.push({...producto,cantidad: 1})
    }
    
    const getCantidadTotal = computed(() => {
        return carrito.value.reduce((total, producto) => total + producto.cantidad, 0);
    });

    return {
        carrito,
        agregarAlCarrito,
        getCantidadTotal
    };

})