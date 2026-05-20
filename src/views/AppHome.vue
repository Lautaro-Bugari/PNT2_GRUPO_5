<script setup>
import { ref, onMounted } from "vue"

const ofertas = ref([])
const novedades = ref([])

const url =
"https://www.mockachino.com/5f72124b-0201-4d/api/home"

onMounted(async () => {

  const response = await fetch(url)

  const data = await response.json()

  ofertas.value = data.ofertas

  novedades.value = data.novedades
})

</script>


<template>
  <div>
    <header>
      <h1>Bienvenido a la Distribuidora Kioskos</h1>
    </header>
    <div>
      <p>Somos tu proveedor confiable de productos para kioskos. Ofrecemos una amplia variedad de productos de alta calidad a precios competitivos.</p>
      <p>Explora nuestro catálogo y descubre todo lo que tenemos para ofrecerte. ¡Gracias por elegirnos!</p>
    </div>
    <h2>Ofertas</h2>

    <div
      v-for="oferta in ofertas"
      :key="oferta.id"
    >
      <img
        :src="oferta.imagen"
        width="400"
      >

      <h3>{{ oferta.titulo }}</h3>

      <p>{{ oferta.descripcion }}</p>
    </div>

    <h2>Novedades</h2>

    <div
      v-for="novedad in novedades"
      :key="novedad.id"
    >
      <img
        :src="novedad.imagen"
        width="400"
      >

      <h3>{{ novedad.titulo }}</h3>

      <p>{{ novedad.descripcion }}</p>
    </div>

  </div>
</template>