<script setup>
import { ref, onMounted } from "vue";

const users = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/users"
const carritos = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/carts"
const listaUsuarios = ref([]);
const usuarioSeleccionado = ref(null);
const carritoUsuario = ref(null);
const mostrarFormularioCrear = ref(false);

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
    carritoUsuario.value = null; // Limpiar carrito anterior
    try {
        const response = await fetch(carritos);
        const carritosData = await response.json();
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

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <h1>Panel de Administración: Usuarios</h1>
  
  <button v-if = "!mostrarFormularioCrear" @click="mostrarFormularioCrear = true">Crear Nuevo Usuario
  </button>
  
  <div v-if="mostrarFormularioCrear">
    <h3>Crear Nuevo Usuario</h3>
    <form @submit.prevent="crearUsuario">
      <label>Username: </label>
      <input type="text" v-model="nuevoUsuario.username" required /><br><br>

      <label>Email: </label>
      <input type="email" v-model="nuevoUsuario.email" required /><br><br>

      <label>Contraseña: </label>
      <input type="password" v-model="nuevoUsuario.password" required /><br><br>

      <button type="submit">Guardar en API</button>
    </form>
    <hr />
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
        <th>Contraseña</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in listaUsuarios" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.password }}</td>
        <td>
          <button @click="mostrarDetalles(user)">Ver Detalles</button>
          <button>✏️ Editar</button>
        </td>
      </tr>
    </tbody>
  </table>

  <div v-if="usuarioSeleccionado">
    <hr />
    <h2>Detalles del Usuario</h2>
    <p>Nombre: {{ usuarioSeleccionado.username }}</p>
    <p>Email: {{ usuarioSeleccionado.email }}</p>
    <p>Contraseña: {{ usuarioSeleccionado.password }}</p>
    <p>ID: {{ usuarioSeleccionado.id }}</p>

    <h3>Historial de Carrito / Compras:</h3>
    <div v-if="carritoUsuario && carritoUsuario.itemsProductos && carritoUsuario.itemsProductos.length">
      <ul>
        <li v-for="(item, index) in carritoUsuario.itemsProductos" :key="index">
          Producto ID: {{ item.idProducto }} - Cantidad: {{ item.cantidad }}
        </li>
      </ul>
    </div>
    <p v-else>Este usuario no tiene productos en su carrito.</p>
    
    <button @click="usuarioSeleccionado = null">Cerrar Detalles</button>
  </div>
</template>