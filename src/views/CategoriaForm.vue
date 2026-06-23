<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreCategoria } from '../stores/storeCategoria'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const storeCategoria = useStoreCategoria()
const authStore = useAuthStore()

const esEdicion = computed(() => !!route.params.id)
const cargando = ref(true)

const form = ref({
  id: null,
  nombre: '',
  descripcion: ''
})

const cargarCategoria = async () => {
  if (!esEdicion.value) return
  try {
    const categoria = await storeCategoria.getById(route.params.id)
    if (categoria) {
      form.value = { ...categoria }
    } else {
      alert('Categoría no encontrada')
      router.push('/admin/categorias')
    }
  } catch (error) {
    console.error(error)
    alert('Error al cargar la categoría')
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  // Verificar autenticación y admin
  if (!authStore.usuarioLogueado) {
    router.push({ path: '/login', query: { redirect: '/admin/categorias' } })
    return
  }
  if (!authStore.esAdmin) {
    router.push({ path: '/' })
    return
  }
  await cargarCategoria()
  cargando.value = false
})

const guardar = async () => {
  try {
    if (esEdicion.value) {
      await storeCategoria.update(form.value.id, form.value)
    } else {
      await storeCategoria.create(form.value)
    }
    router.push('/admin/categorias')
  } catch (error) {
    console.error(error)
    alert('Error al guardar: ' + error.message)
  }
}

const cancelar = () => router.push('/admin/categorias')
</script>

<template>
  <div class="form-container">
    <h1>{{ esEdicion ? 'Editar Categoría' : 'Nueva Categoría' }}</h1>
    <form @submit.prevent="guardar">
      <div class="campo">
        <label>Nombre *</label>
        <input v-model="form.nombre" type="text" required />
      </div>
      <div class="campo">
        <label>Descripción</label>
        <textarea v-model="form.descripcion"></textarea>
      </div>
      <div class="acciones">
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" class="btn-cancelar" @click="cancelar">❌ Cancelar</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.campo {
  margin-bottom: 15px;
}
.campo label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.campo input,
.campo textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.campo textarea {
  min-height: 80px;
}
.acciones {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-guardar {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-cancelar {
  background: #ccc;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>