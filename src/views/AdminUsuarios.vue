<script setup>
import { ref, onMounted } from "vue";
import { useStoreCarrito } from "../stores/storeCarrito";
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const storeCarrito = useStoreCarrito();
const users = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/users"
const listaUsuarios = ref([]);
const usuarioSeleccionado = ref(null);
const carritoUsuario = ref(null);
const mostrarFormularioCrear = ref(false);
const usuarioAEditar = ref(null);
const authStore = useAuthStore()
const router = useRouter()

const cargarUsuarios = async () => {
  try {
    const response = await fetch(users);
    listaUsuarios.value = await response.json();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
};

const mostrarDetalles = async(user) => {
    usuarioSeleccionado.value = user;
    carritoUsuario.value = null;
    try {
        const carritosData = await storeCarrito.obtenerTodosLosCarritos();
        const carritoEncontrado = carritosData.find(carrito => carrito.userId === user.id);
        if (carritoEncontrado) {
            carritoUsuario.value = carritoEncontrado;
        } else {
            carritoUsuario.value = { itemsProductos: [] }
        }
    } catch (error) {
        console.error("Error al cargar carrito del usuario:", error);
    }
};

const nuevoUsuario = ref({
  username: "",
  email: "",
  password: "",
  admin: false,
  avatar: 'https://avatars.githubusercontent.com/u/21501190'
});

const crearUsuario = async () => {
  try {
    const response = await fetch(users, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario.value)
    })
    if (response.ok) {

      await cargarUsuarios()
      nuevoUsuario.value = { username: '', email: '', password: '', avatar: 'https://avatars.githubusercontent.com/u/21501190' }
      mostrarFormularioCrear.value = false
    }
  } catch (error) {
    console.error("Error al crear usuario:", error)
  }
}

const eliminarUsuario = async (id, name) => {
  const confirmar = confirm("¿Estás seguro de que deseas eliminar a este usuario?");
  
  if (confirmar) {
    try {
      const response = await fetch(`${users}/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await cargarUsuarios()
        if (usuarioSeleccionado.value && usuarioSeleccionado.value.id === id) {
          usuarioSeleccionado.value = null
        }
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
    }
  }
}

const iniciarEdicion = (user) => {
  usuarioAEditar.value = { ...user }
}

const guardarEdicion = async () => {
  try {
    const response = await fetch(`${users}/${usuarioAEditar.value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioAEditar.value)
    })
    if (response.ok) {
      await cargarUsuarios()
      usuarioAEditar.value = null
    }
  } catch (error) {
    console.error("Error al editar usuario:", error)
  }
}

onMounted(async () => {
  if (!authStore.usuarioLogueado) {
    router.push({ path: '/login', query: { redirect: '/admin/usuarios' } })
    return
  }
  if (!authStore.esAdmin) {
    router.push({ path: '/' })
    return
  }
  await cargarUsuarios()
})

</script>

<template>
  <div class="contenedor-admin">
    <h1 class="titulo-admin">Panel de Administración: Usuarios</h1>
    <div class="barra-acciones">
      <button v-if="!mostrarFormularioCrear" @click="mostrarFormularioCrear = true" class="boton boton-primario">
        Crear Nuevo Usuario
      </button>
      <button v-else @click="mostrarFormularioCrear = false" class="boton boton-secundario">
        Cancelar Creación
      </button>
    </div>
    <div v-if="mostrarFormularioCrear" class="contenedor-formulario">
      <h3>Crear Nuevo Usuario</h3>
      <form @submit.prevent="crearUsuario" class="formulario-admin">
        <div class="grupo-formulario">
          <label>Nombre</label>
          <input type="text" v-model="nuevoUsuario.username" required />
        </div>
        <div class="grupo-formulario">
          <label>Email</label>
          <input type="email" v-model="nuevoUsuario.email" required />
        </div>
        <div class="grupo-formulario">
          <label>Contraseña</label>
          <input type="text" v-model="nuevoUsuario.password" required />
        </div>
        <div class="grupo-formulario checkbox-contenedor">
          <label class="etiqueta-checkbox">
            <input type="checkbox" v-model="nuevoUsuario.admin" class="input-checkbox" />
            Otorgar rol de Administrador
          </label>
        </div>
        <button type="submit" class="boton boton-exito">Guardar</button>
      </form>
    </div>
    <div v-if="usuarioAEditar" class="contenedor-formulario modo-edicion">
      <h3>Editar Usuario (ID: {{ usuarioAEditar.id }})</h3>
      <form @submit.prevent="guardarEdicion" class="formulario-admin">
        <div class="grupo-formulario">
          <label>Username</label>
          <input type="text" v-model="usuarioAEditar.username" required />
        </div>

        <div class="grupo-formulario">
          <label>Email</label>
          <input type="email" v-model="usuarioAEditar.email" required />
        </div>
        <div class="grupo-formulario">
          <label>Contraseña</label>
          <input type="text" v-model="usuarioAEditar.password" required />
        </div>
        <div class="grupo-formulario checkbox-contenedor">
          <label class="etiqueta-checkbox">
            <input type="checkbox" v-model="usuarioAEditar.admin" class="input-checkbox" />
            Usuario Administrador
          </label>
        </div>
        <div class="acciones-formulario">
          <button type="submit" class="boton boton-exito">Actualizar Datos</button>
          <button type="button" @click="usuarioAEditar = null" class="boton boton-secundario">Cancelar</button>
        </div>
      </form>
    </div>
    <div class="tabla-contenedor">
      <table class="tabla-admin">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Contraseña</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in listaUsuarios" :key="user.id">
            <td>{{ user.id }}</td>
            <td class="nombre-destacado">{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td class="pass-celda"><code>{{ user.password }}</code></td>
            <td>
              <span :class="['badge-rol', user.admin ? 'es-admin' : 'es-cliente']">
                {{ user.admin ? 'Admin' : 'Cliente' }}
              </span>
            </td>
            <td class="acciones-tabla">
              <button @click="mostrarDetalles(user)" class="boton-accion boton-ver">👁️</button>
              <button @click="iniciarEdicion(user)" class="boton-accion boton-editar">✏️</button>
              <button @click="eliminarUsuario(user.id, user.username)" class="boton-accion boton-eliminar">⛔</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="usuarioSeleccionado" class="contenedor-detalles">
      <h2>Detalles del Usuario</h2>
      <div class="grilla-detalles">
        <p><strong>ID:</strong> #{{ usuarioSeleccionado.id }}</p>
        <p><strong>Nombre:</strong> {{ usuarioSeleccionado.username }}</p>
        <p><strong>Email:</strong> {{ usuarioSeleccionado.email }}</p>
        <p><strong>Rol:</strong> {{ usuarioSeleccionado.admin ? 'Administrador' : 'Cliente' }}</p>
      </div>
      <div class="historial-carrito">
        <h3>Historial de Compras:</h3>
        <div v-if="carritoUsuario && carritoUsuario.itemsProductos && carritoUsuario.itemsProductos.length">
          <ul class="lista-carrito">
            <li v-for="(item, index) in carritoUsuario.itemsProductos" :key="index">
              <span class="id-prod-historial">📦 Producto ID: #{{ item.id }}</span>
              <span class="etiqueta-cantidad">Cantidad: {{ item.cantidad }}</span>
            </li>
          </ul>
        </div>
        <p v-else class="carrito-vacio">Este usuario no tiene productos en su carrito actualmente.</p>
      </div>
      <button @click="usuarioSeleccionado = null" class="boton boton-secundario">Cerrar Detalles</button>
    </div>
  </div>
</template>

<style scoped>
.contenedor-admin {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  color: #2b2b2b;
}

.titulo-admin {
  font-size: 34px;
  font-weight: 800;
  color: #e60000;
  margin-bottom: 25px;
  border-bottom: 3px solid #333;
  padding-bottom: 12px;
}

.barra-acciones {
  margin-bottom: 25px;
}

.boton {
  padding: 14px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.1s;
}

.boton:active {
  transform: scale(0.98);
}

.boton-primario {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
}
.boton-primario:hover {
  background: #45a049;
}

.boton-secundario {
  background-color: #ffffff;
  color: #444;
  border: 1px solid #ccc;
}
.boton-secundario:hover { background-color: #f1f1f1; border-color: #888; }

.boton-exito {
  background-color: #28a745;
  color: white;
}
.boton-exito:hover { background-color: #218838; }

.tabla-contenedor {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  margin-bottom: 30px;
}

.tabla-admin {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 16px;
}

.tabla-admin th {
  background-color: #f8f9fa;
  color: #444;
  padding: 15px 16px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 14px;
  border-bottom: 2px solid #eaeaea;
}

.tabla-admin td {
  padding: 18px 16px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.nombre-destacado {
  font-weight: 700;
  color: #333;
}

.pass-celda code {
  background-color: #f1f1f1;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 15px;
  color: #555;
}

.badge-rol {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.badge-rol.es-admin {
  background-color: #fff5f5;
  color: #e60000;
  border: 1px solid #fce8e6;
}

.badge-rol.es-cliente {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #eaeaea;
}

.acciones-tabla {
  display: flex;
  gap: 10px;
}

.boton-accion {
  background: #ffffff;
  border: 1px solid #ccc;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #444;
  transition: all 0.2s;
}

.boton-accion.boton-ver{
  background: #3498db;
  color: white;
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0 4px;
}
.boton-accion.boton-editar {
  background: #f39c12;
  color: white;
    width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0 4px;
}

.boton-accion.boton-eliminar {
  background: #e74c3c;
  color: white;
    width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.contenedor-formulario {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 35px;
  margin-bottom: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.contenedor-formulario h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
}

.contenedor-formulario.modo-edicion {
  border-left: 5px solid #ffc107;
}

.formulario-admin {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 500px;
}

.grupo-formulario {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grupo-formulario label {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.grupo-formulario input[type="text"],
.grupo-formulario input[type="email"] {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.grupo-formulario input:focus {
  outline: none;
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(230, 0, 0, 0.1);
}

.checkbox-contenedor {
  margin: 8px 0;
}

.etiqueta-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.input-checkbox {
  accent-color: #e60000;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.acciones-formulario {
  display: flex;
  gap: 12px;
}

.contenedor-detalles {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.contenedor-detalles h2 {
  font-size: 22px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 20px;
}

.grilla-detalles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.grilla-detalles p {
  margin: 0;
  font-size: 15px;
}

.historial-carrito h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 15px;
}

.lista-carrito {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lista-carrito li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background-color: #ffffff;
  border: 1px solid #eee;
  border-left: 4px solid #333;
  border-radius: 6px;
  max-width: 450px;
}

.id-prod-historial {
  font-weight: 600;
  font-size: 14px;
}

.etiqueta-cantidad {
  background-color: #e60000;
  color: white;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.carrito-vacio {
  color: #777;
  font-style: italic;
  font-size: 14px;
}

.contenedor-detalles {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>