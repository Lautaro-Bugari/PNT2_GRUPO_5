<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const ofertas = ref([])
const novedades = ref([])
const router = useRouter()

const url =
"https://www.mockachino.com/5f72124b-0201-4d/api/home"

onMounted(async () => {

  const response = await fetch(url)

  const data = await response.json()

  ofertas.value = data.ofertas

  novedades.value = data.novedades
})

const irAlCatalogo = () => {
  router.push('/productos')
}
</script>


<template>
  <div class="body">
    
    <div class="banner-foto">
      <div class="banner-texto">
        <h1>La Central de las Golosinas</h1>
        <p>Somos tu proveedor confiable de productos para kioskos. Ofrecemos una amplia variedad de productos de alta calidad a precios competitivos.</p>
      </div>
    </div>

    <div class="bloque-seccion">
      <h2 class="titulo-seccion">Ofertas</h2>

      <div class="lista-productos">
        <div v-for="oferta in ofertas" :key="oferta.id" class="tarjeta-individual">
          <img :src="oferta.imagen" class="imagen-producto">
          <h3 class="titulo-producto">{{ oferta.titulo }}</h3>
          <p class="descripcion-producto">{{ oferta.descripcion }}</p>
        </div>
      </div>
    </div>

    <div class="bloque-seccion">
      <h2 class="titulo-seccion">Novedades</h2>

      <div class="lista-productos">
        <div v-for="novedad in novedades" :key="novedad.id" class="tarjeta-individual">
          <img :src="novedad.imagen" class="imagen-producto">
          <h3 class="titulo-producto">{{ novedad.titulo }}</h3>
          <p class="descripcion-producto">{{ novedad.descripcion }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
.body{
  font-family: 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
}

.banner-foto {
  background-image: url('/imagenes/banner.jpg');
  background-size: cover;
  background-position: center;
  margin: 0px;
  margin-top: 100px;
  padding: 300px 20px;
  text-align: center;
}

.banner-texto {
display: flex;
  flex-direction: column;
  align-items: center;
}

.banner-texto h1 {
  color: #ffffff;
  font-size: 70px;
  margin: 0 0 75px 0;
  text-shadow: 3px 3px 6px rgba(223, 13, 13, 0.9);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 20px 40px;
  display: inline-block
}

.banner-texto p {
  color: #ffffff;
  font-size: 30px;
  margin: 0;
  text-shadow: 3px 3px 6px rgba(223, 13, 13, 0.9);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 20px 40px;
  display: inline-block
}

</style>
