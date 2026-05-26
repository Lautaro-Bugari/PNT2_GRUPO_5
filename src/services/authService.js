import { ref } from "vue"

const users = ref([])

const URL ="https://6a14f50691ff9a63de0731e9.mockapi.io/api/users"

export const authService = {
  async login(username, password) {
    const response = await fetch(URL)
    const data = await response.json()
    users.value = data

    const user = users.value.find(u => (u.username === username || u.email === username) && u.password === password)
    if (user) {
      return user
    } else {
      throw new Error('Usuario o contraseña incorrectos.')
    }
  }
}