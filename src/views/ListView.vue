<script setup>
// Import necessary functions from Vue
import { onMounted, watch } from 'vue';
// Import the user store
import { useUserStore } from '../stores/users';
// Import the chat store (needed for apiKeyType)
import { useChatStore } from '../stores/chats';

// Get access to the stores
const userStore = useUserStore();
const chatStore = useChatStore();

// Fetch users when the component is mounted, using the current apiKeyType from chatStore
onMounted(() => {
  userStore.fetchUsers(chatStore.apiKeyType);
});

// Watch the apiKeyType in the chat store and fetch users when it changes
watch(() => chatStore.apiKeyType, (newKeyType) => {
  console.log('Environment changed to:', newKeyType, '. Fetching users...');
  userStore.fetchUsers(newKeyType);
  // Optional: clear search term when environment changes
  // userStore.searchTerm = '';
});

</script>

<template>
  <div class="list-view-container">
    <!-- Keep the original title -->
    <h1>Healz TalkJs Chats</h1>

    <!-- Keep the environment selector -->
    <div class="environment-selector-container">
      <label for="apiKeyType">Seleccionar Entorno:</label>
      <select v-model="chatStore.apiKeyType" id="apiKeyType" class="environment-select">
        <option value="dev">Desarrollo</option>
        <option value="prod">Producción</option>
      </select>
    </div>

    <hr> <!-- Keep the separator -->

    <!-- User Search Section -->
    <h2>Buscar Usuarios ({{ chatStore.apiKeyType }})</h2> <!-- Indicate environment -->

    <!-- Search Input for Users -->
    <div class="search-bar">
      <input
        type="text"
        v-model="userStore.searchTerm"
        placeholder="Buscar usuario por ID, nombre o email"
        autocomplete="off"
      />
       <!-- No search button needed as filtering is reactive -->
    </div>

    <!-- Loading, Error, and Empty States for Users -->
    <div v-if="userStore.loading" class="status-message">Cargando usuarios para buscar...</div>
    <div v-else-if="userStore.error" class="error-message">Error al cargar usuarios: {{ userStore.error }}</div>
    <!-- Display message if no users found AFTER fetching -->
    <div v-else-if="userStore.users.length === 0 && !userStore.loading && !userStore.error" class="status-message no-results">No hay usuarios disponibles para este entorno.</div>
    <!-- Display message if no filtered users found AFTER fetching and searching -->
    <div v-else-if="userStore.filteredUsers.length === 0 && userStore.searchTerm" class="status-message no-results">
        No se encontraron usuarios para el término "{{ userStore.searchTerm }}".
    </div>

    <!-- User List: Display filtered users from the user store ONLY if searchTerm is not empty -->
    <div v-else-if="userStore.searchTerm" class="users-list">
       <h3>Resultados de la búsqueda de usuarios:</h3>
      <!-- Iterate over userStore.filteredUsers -->
      <div v-for="user in userStore.filteredUsers" :key="user.id">
        <!-- Wrap user item in router-link -->
        <router-link :to="{ name: 'user-conversations', params: { userId: user.id } }" class="user-item-link">
          <div class="user-item">
            <!-- Display user information here. Adjust based on your user object structure -->
            <p>ID: {{ user.id }}</p>
            <p>Nombre: {{ user.name }}</p>
            <p>Email: {{ user.email ? user.email.join(', ') : 'N/A' }}</p>
            <!-- Add more user properties as needed -->
          </div>
        </router-link>
      </div>
    </div>
     <!-- Display initial message when no search term is present and no other states are active -->
     <div v-else class="status-message initial-message">
      Introduce un término de búsqueda para encontrar usuarios.
    </div>

  </div>
</template>
<style scoped>
.list-view-container {
  max-width: 1024px; /* Limitar ancho para mejor lectura */
  margin: 20px auto; /* Centrar y dar espacio superior/inferior */
  padding: 20px; /* Padding interno */
  background-color: #ffffff; /* Fondo blanco limpio */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* Fuente moderna y legible */
  color: #333; /* Color de texto principal oscuro */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .list-view-container {
    margin: 10px;
    padding: 15px;
  }
}

h1 {
  text-align: center;
  color: #0056b3; /* Azul profesional para títulos */
  margin-bottom: 1.5em;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  h1 {
    font-size: 1.8em;
    margin-bottom: 1em;
  }
}

.environment-selector-container {
  margin-bottom: 1em;
  padding: 0.8em;
  border: 1px solid #ccc;
  border-radius: 4px; /* Bordes ligeramente redondeados */
  background-color: #f8f9fa; /* Gris muy claro para secciones */
  display: flex;
  align-items: center;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .environment-selector-container {
    flex-direction: column; /* Stack elements */
    align-items: flex-start; /* Align items to the start */
    padding: 0.6em;
  }

  .environment-selector-container label {
    margin-bottom: 0.5em; /* Add space below label */
    margin-right: 0; /* Remove right margin */
  }

  .environment-select {
    width: 100%; /* Make select full width */
    padding: 0.5em; /* Consistent padding */
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1em;
  }

    .environment-select:focus {
    outline: none;
    border-color: #007bff; /* Azul de enfoque */
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
}

h2 {
  color: #333; /* Color de texto oscuro */
  text-align: center; /* Centrar título */
  margin-bottom: 1.5em; /* Espacio */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  h2 {
    font-size: 1.5em;
    margin-bottom: 1em;
  }
}

.search-bar {
  margin-bottom: 2em; /* Espacio después de la barra de búsqueda */
  display: flex;
  align-items: center;
  gap: 0.8em; /* Aumentar espacio entre elementos */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column; /* Stack input and buttons */
    gap: 0.8em; /* Increase gap when stacked */
  }

  .search-bar input {
    min-width: auto; /* Remove min-width constraint */
    width: 100%; /* Make input full width */
  }
}

.search-bar input {
  padding: 0.8em 1em; /* Más padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 250px;
  flex-grow: 1;
  font-size: 1em; /* Tamaño de fuente legible */
}

.search-bar input:focus {
    outline: none;
    border-color: #007bff; /* Azul de enfoque */
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.status-message {
    text-align: center; /* Centrar mensajes de estado */
    margin-top: 1.5em; /* Más espacio arriba */
    font-style: italic;
    color: #555; /* Color de texto neutro */
    padding: 1em; /* Padding interno */
    background-color: #e9ecef; /* Gris muy claro */
    border-radius: 4px;
}

.error-message {
    color: #dc3545; /* Rojo para errores */
    font-weight: bold;
    background-color: #f8d7da; /* Fondo rojo claro */
    border: 1px solid #f5c6cb; /* Borde rojo claro */
}

.no-results {
    color: #ffc107; /* Amarillo para sin resultados */
    background-color: #fff3cd; /* Fondo amarillo claro */
    border: 1px solid #ffeeba; /* Borde amarillo claro */
}

.initial-message {
    color: #17a2b8; /* Azul turquesa para mensaje inicial */
    background-color: #d1ecf1; /* Fondo azul turquesa claro */
    border: 1px solid #bee5eb; /* Borde azul turquesa claro */
}

.users-list {
  margin-top: 2em; /* Espacio antes de la lista de resultados */
}

.users-list h3 {
    color: #555; /* Color de texto oscuro */
    margin-bottom: 1em;
    border-bottom: 1px solid #eee; /* Separador ligero */
    padding-bottom: 0.5em;
}

/* Estilos para hacer el área del Item clickeable */
.user-item-link {
    text-decoration: none; /* Remover subrayado */
    color: inherit; /* Heredar color de texto */
    display: block; /* Hacer el enlace un bloque para que envuelva todo el div */
    margin-bottom: 10px; /* Espacio entre elementos de usuario */
    border: 1px solid #e0e0e0; /* Borde gris claro */
    border-radius: 4px; /* Bordes redondeados */
    background-color: #ffffff; /* Fondo blanco */
    padding: 15px; /* Padding interno */
    transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out; /* Transición suave */
}

.user-item-link:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Sombra sutil al pasar el ratón */
    border-color: #b0b0b0; /* Cambiar color del borde */
}

.user-item p {
  margin: 0 0 0.5em 0; /* Espacio entre párrafos */
  font-size: 0.95em;
}

.user-item p:last-child {
    margin-bottom: 0;
}

.user-item p strong {
    color: #555; /* Color ligeramente más oscuro para las etiquetas */
    margin-right: 0.5em;
}

/* Estilos para el selector de entorno */
.environment-selector-container label {
  margin-right: 0.8em;
  font-weight: bold;
  color: #555;
}

.environment-select {
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
}

.environment-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Estilos para el título principal */
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5em;
}

/* Estilos para la línea separadora */
hr {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #eee;
}

/* Estilos básicos para la lista de usuarios */
.users-list {
  margin-top: 20px;
}

/* Mantener estilos user-item */
.user-item {
  padding: 0; /* Eliminar padding si estaba en .user-item */
  margin-bottom: 0; /* Eliminar margin si estaba en .user-item */
  border: none; /* Eliminar border si estaba en .user-item */
  background-color: transparent; /* Eliminar background si estaba en .user-item */
}

/* Estilos para el enlace del item de usuario */
.user-item-link {
    text-decoration: none; /* Eliminar subrayado */
    color: inherit; /* Heredar color de texto */
    display: block; /* Hacer el enlace un bloque para envolver el div */
    margin-bottom: 10px; /* Agregar espacio entre items de usuario */
    border: 1px solid #eee; /* Agregar un borde */
    border-radius: 4px; /* Esquinas redondeadas */
    background-color: #f9f9f9; /* Fondo claro */
    padding: 10px; /* Agregar padding interno */
    transition: box-shadow 0.2s ease; /* Agregar un efecto hover sutil */
}

.user-item-link:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Aumentar sombra en hover */
}

.pagination-controls {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination-controls button {
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #eee;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

  </style>