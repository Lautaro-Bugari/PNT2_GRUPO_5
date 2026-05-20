<script setup>

import { ref, computed, onMounted } from "vue"

const productos = ref([])

const busqueda = ref("")

const categoriaSeleccionada = ref("Todos")

const url =
"https://www.mockachino.com/5f72124b-0201-4d/api/productos"

onMounted(async () => {

  const response = await fetch(url)

  const data = await response.json()

  productos.value = data.productos

})

const categorias = computed(() => {

  const lista = productos.value.map(
    producto => producto.categoria
  )

  return ["Todos", ...new Set(lista)]

})

const productosFiltrados = computed(() => {

  return productos.value.filter(producto => {

    const coincideBusqueda =
      producto.nombre
        .toLowerCase()
        .includes(busqueda.value.toLowerCase()) || producto.categoria
        .toLowerCase()        .includes(busqueda.value.toLowerCase())

    const coincideCategoria =
      categoriaSeleccionada.value === "Todos"
      ||
      producto.categoria === categoriaSeleccionada.value

    return coincideBusqueda && coincideCategoria

  })

})

</script>

<template>

  <div>

    <h1>Productos</h1>

    <!-- BUSCADOR -->

    <input
      v-model="busqueda"
      placeholder="Buscar producto..."
    >

    <!-- FILTRO -->

    <select v-model="categoriaSeleccionada">

      <option
        v-for="categoria in categorias"
        :key="categoria"
      >
        {{ categoria }}
      </option>

    </select>

    <!-- PRODUCTOS -->

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

      </div>

    </div>

  </div>

</template>

