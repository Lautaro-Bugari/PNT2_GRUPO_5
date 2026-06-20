<script setup>

import { ref, computed, onMounted } from "vue"

import { useStoreCarrito } from "../stores/storeCarrito"

import AvisoLogin from "./AvisoLogin.vue"

import { useAuthStore } from '../stores/authStore'

import { useRouter } from 'vue-router'

import { useStoreProducto } from "../stores/storeProducto"

const storeProducto = useStoreProducto()

const router = useRouter()

const authStore = useAuthStore()
const storeCarrito = useStoreCarrito()

const productos = ref([])

const busqueda = ref("")

const avisoLoginVisible = ref(false)

let idProductoSeleccionado = null


const categoriaSeleccionada = ref("Todos")


onMounted(async () => {
  const productosObtenidos = await storeProducto.getProductos()
  productos.value = productosObtenidos.filter(p => p.cantStock > 0)
})

const categorias = computed(() => { const lista = productos.value.map(producto => producto.categoria)
  return ["Todos", ...new Set(lista)]})

const productosFiltrados = computed(() => {
if (categoriaSeleccionada.value === "Todos" && busqueda.value === ""  ) return productos.value

  return productos.value.filter(producto => {

   const coincideBusqueda =

  producto.nombre.toLowerCase().includes(busqueda.value)||
    producto.categoria.toLowerCase().includes(busqueda.value)

  const coincideCategoria = categoriaSeleccionada.value === "Todos" || producto.categoria === categoriaSeleccionada.value

  return coincideBusqueda && coincideCategoria

  })
})

const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    idProductoSeleccionado = producto.id
    avisoLoginVisible.value = true
    return
  } 
    storeCarrito.agregarAlCarrito(producto)
}

</script>

<template>

  <div>

    <h1>Productos</h1>

    <input
      v-model="busqueda"
      placeholder="Buscar producto..."
    >

    <select v-model="categoriaSeleccionada">

      <option
        v-for="categoria in categorias"
        :key="categoria"
      >
        {{ categoria }}
      </option>

    </select>

    <!-- PRODUCTOS -->

    <AvisoLogin v-if="avisoLoginVisible"
 @cerrar="
    avisoLoginVisible = false
  "

  @login="
    router.push({
      path: '/login',
      query: {
        redirect:
          `/productos/${idProductoSeleccionado}`
      }
    })
  "

/>

    <div >

      <div
        v-for="producto in productosFiltrados"
        :key="producto.id"
      >

        <img
          :src="producto.imagen"
          width="200"
        >

        <h3>{{ producto.nombre }}</h3>

        <p>{{ producto.categoria }}</p>

        <strong>
          ${{ producto.precio }}
        </strong>
        
        <button @click="verificarLogin(producto)">
          🛒 Agregar al carrito
        </button>
        
      </div>

    </div>

  </div>

</template>

