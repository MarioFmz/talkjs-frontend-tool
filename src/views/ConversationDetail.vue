<script setup>
// Este componente será el encargado de mostrar los detalles de una conversación específica.
// Recibirá el 'id' de la conversación como prop gracias a la configuración del router.
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Importa useRouter
import { useChatStore } from '../stores/chats'; // Importa el store
import { useUserStore } from '../stores/users'; // Importa useUserStore

const route = useRoute();
const router = useRouter(); // Usa useRouter
const conversationId = route.params.id;

const chatStore = useChatStore(); // Usa el store
const userStore = useUserStore(); // Usa el store de usuarios

const userIdToAdd = ref(''); // Para el input del ID de usuario a añadir
const addingParticipant = ref(false); // Estado para indicar si se está añadiendo un participante
const removingParticipantId = ref(null); // Estado para indicar qué participante se está eliminando
const participantActionError = ref(null); // Para mostrar errores específicos de las acciones

// Reactive object to store fetched user names
const userNames = ref({});

// Reactive variable for copy feedback message
const copiedMessage = ref(null);

// List of frequently used users for easy copy-pasting
const frequentlyUsedUsers = [
  { name: 'Marco', id: '85b03c06-efc8-4722-9110-aaf38aa17a94' },
  { name: 'Rubén', id: '27df89d0-74e0-4818-925b-628996a66fa7' },
  { name: 'Ana', id: 'a766f871-e909-4a0c-8b23-86a255a452c4' },
  { name: 'Marta', id: 'e8d6fd54-c64b-4755-8e6a-d9c438098927'},
  { name: 'Daniel', id: 'eba2de76-0973-44c8-9d9a-eed3ccf9a092'}
];

// Function to fetch user name from the backend
const fetchUserName = async (userId, appId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/v1/${appId}/users/${userId}`);
    if (!res.ok) {
      // If we can't fetch the name, just return the userId
      console.error(`Error fetching name for user ${userId}: ${res.statusText}`);
      return userId;
    }
    const userData = await res.json();
    // Assuming the backend returns user data with a 'name' property
    return userData.name || userId; // Fallback to userId if name is not available
  } catch (error) {
    console.error(`Error fetching name for user ${userId}:`, error);
    return userId; // Return userId in case of any error
  }
};

// Obtener la conversación específica del store
const conversationDetails = computed(() => {
  return chatStore.getConversationById(conversationId);
});

// Obtener los participantes de la conversación específica
const participants = computed(() => {
  return conversationDetails.value?.participants || {};
});

// Watch for changes in participants and fetch names
watch(participants, async (newParticipants) => {
  if (newParticipants) {
    // No longer need to get appId from store here, fetchUserName handles it.
    const names = {};
    // Pass apiKeyType to fetchUserName
    const currentKeyType = chatStore.apiKeyType; // Get keyType from store state
    for (const userId in newParticipants) {
      names[userId] = await fetchUserName(userId, currentKeyType);
    }
    userNames.value = names;
  }
}, { immediate: true }); // Fetch names immediately if participants are already available

// Function to copy user ID to clipboard
const copyUserId = async (userId) => {
  try {
    await navigator.clipboard.writeText(userId);
    copiedMessage.value = 'ID copiado!';
    // Clear the message after a few seconds
    setTimeout(() => {
      copiedMessage.value = null;
    }, 2000);
  } catch (err) {
    console.error('Error copying ID:', err);
    copiedMessage.value = 'Error al copiar ID.';
     setTimeout(() => {
      copiedMessage.value = null;
    }, 2000);
  }
};

// Función para añadir un participante
const addParticipant = async () => {
  // Usamos apiKeyType directly from the store
  const currentKeyType = chatStore.apiKeyType;

  if (!userIdToAdd.value) {
    participantActionError.value = 'Introduce un ID de usuario para añadir.';
    return;
  }
  addingParticipant.value = true;
  participantActionError.value = null;
  try {
    // Llamar al endpoint del backend para añadir participante, passing keyType from the store
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations/${conversationId}/participants/${userIdToAdd.value}?keyType=${currentKeyType}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      // Optional: you can send access/notify in the body if your backend expects it
      // body: JSON.stringify({ access: 'ReadWrite', notify: true })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error al añadir participante: ${errorData.error || res.statusText}`);
    }
    
    // Success: Clear input and refetch the conversation using the keyType from the store
    userIdToAdd.value = '';
    await chatStore.searchConversationById(conversationId); // searchConversationById now reads keyType from the store

  } catch (err) {
    participantActionError.value = err.message;
    console.error('Error adding participant:', err);
  } finally {
    addingParticipant.value = false;
  }
};

// Función para eliminar un participante
const removeParticipant = async (userId) => {
  // Usamos apiKeyType directly from the store
  const currentKeyType = chatStore.apiKeyType;

  if (!confirm(`¿Estás seguro de que quieres eliminar al participante ${userNames.value[userId] || userId}?`)) {
    return;
  }
  removingParticipantId.value = userId;
  participantActionError.value = null;
  try {
    // Llamar al endpoint del backend para eliminar participante, passing keyType from the store
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/conversations/${conversationId}/participants/${userId}?keyType=${currentKeyType}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (!res.ok) {
       const errorData = await res.json();
       throw new Error(`Error al eliminar participante: ${errorData.error || res.statusText}`);
    }
    
    // Success: Refetch the conversation using the keyType from the store.
     await chatStore.searchConversationById(conversationId);

  } catch (err) {
    participantActionError.value = err.message;
    console.error('Error removing participant:', err);
  } finally {
    removingParticipantId.value = null;
  }
};

// Function to navigate back using browser history
const goBack = () => {
  router.back();
};

// Cargar la conversación específica cuando se accede a esta ruta, using keyType from the store
onMounted(async () => {
  // No need to read keyType from the route here, the store action will read it from the global state.
  // Load the specific conversation if it's not already loaded or if there was a previous error
  if (!conversationDetails.value && !chatStore.loading && !chatStore.error) {
     // The searchConversationById action now reads keyType from the store
     await chatStore.searchConversationById(conversationId);
  }
  // Ensure users are fetched if not already to display participant details correctly
  if (userStore.users.length === 0 && !userStore.loading) {
      userStore.fetchUsers(chatStore.apiKeyType); // Fetch users using the current environment
  }
});

</script>

<template>
  <div class="container">
    <!-- Use a button with a click handler to go back -->
    <button @click="goBack" class="back-link">Volver a la lista</button>

    <h2>Detalles de la Conversación</h2>

    <!-- Manejar estados de carga y error globales del store -->
    <div v-if="chatStore.loading" class="status-message">Cargando detalles...</div>
    <div v-else-if="chatStore.error" class="error-message">Error al cargar detalles: {{ chatStore.error }}</div>
    
    <!-- Mostrar detalles si no hay carga ni error y la conversación existe -->
    <div v-else-if="!conversationDetails" class="status-message no-results">Conversación no encontrada con ID: {{ conversationId }}</div>
    <div v-else class="conversation-details">
      <p><strong>ID:</strong> {{ conversationDetails.id }}</p>
      <p v-if="conversationDetails.subject"><strong>Asunto:</strong> {{ conversationDetails.subject }}</p>
      <p><strong>Creado:</strong> {{ new Date(conversationDetails.createdAt).toLocaleString() }}</p>

      <div class="participants-detail">
        <h3>Participantes:</h3>
        <!-- List of frequently used users -->
        <div class="frequently-users">
          <h4>Usuarios frecuentes:</h4>
          <ul>
            <li v-for="user in frequentlyUsedUsers" :key="user.id" class="frequent-user-item">
              <span class="user-name">{{ user.name }}</span> 
              <span class="user-id">{{ user.id }}</span>
              <button @click="copyUserId(user.id)" class="copy-button">Copiar ID</button>
            </li>
          </ul>
           <div v-if="copiedMessage" class="copied-feedback">{{ copiedMessage }}</div>
        </div>
         <!-- Input para añadir participante -->
        <div class="add-participant">
          <input
            type="text"
            v-model="userIdToAdd"
            placeholder="ID de usuario a añadir"
          />
          <button @click="addParticipant" :disabled="addingParticipant || removingParticipantId !== null || !conversationDetails" class="add-button">
            {{ addingParticipant ? 'Añadiendo...' : 'Añadir Participante' }}
          </button>
        </div>
        <div v-if="participantActionError" class="action-error">{{ participantActionError }}</div>

        <!-- Display participant details in boxes ONLY if conversation participants and userStore users are loaded -->
        <div v-if="conversationDetails.participants && userStore?.users?.length > 0">
          <p><strong>Participantes:</strong></p>
          <div class="participant-boxes-container">
            <div v-for="participantId in Object.keys(conversationDetails.participants)" :key="participantId" class="participant-box">
              <!-- Find the participant in the userStore and display their ID, name, and email -->
              <template v-if="userStore.users.find(user => user.id === participantId)">
                <p><strong>Nombre:</strong> {{ userStore.users.find(user => user.id === participantId).name }}</p>
                <p><strong>ID:</strong> {{ userStore.users.find(user => user.id === participantId).id }}</p>
                <p v-if="userStore.users.find(user => user.id === participantId).email && userStore.users.find(user => user.id === participantId).email.length > 0">
                  <strong>Email:</strong> {{ userStore.users.find(user => user.id === participantId).email.join(', ') }}
                </p>
              </template>
              <template v-else>
                <p><strong>ID:</strong> {{ participantId }}</p>
                <p>Usuario Desconocido</p>
              </template>
            </div>
          </div>
        </div>
         <!-- Loading/Error state for userStore if participants exist but userStore is not ready -->
        <div v-else-if="conversationDetails.participants && (userStore.loading || userStore.error)" class="status-message">
            {{ userStore.loading ? 'Cargando detalles de participantes...' : 'Error al cargar detalles de participantes.' }}
        </div>
        <div v-else-if="conversationDetails.participants && userStore.users.length === 0 && !userStore.loading && !userStore.error" class="status-message no-results">
           No hay datos de usuarios cargados para mostrar los participantes con detalle.
        </div>


      </div>

      <div v-if="conversationDetails.lastMessage" class="last-message">
        <h3>Último Mensaje:</h3>
        <!-- Display sender name instead of ID -->
        <p><strong>De:</strong> <span class="sender-name">{{ userNames[conversationDetails.lastMessage.senderId] || conversationDetails.lastMessage.senderId }}</span></p>
        <p><strong>Texto:</strong> {{ conversationDetails.lastMessage.text }}</p>
        <p><strong>Enviado:</strong> {{ new Date(conversationDetails.lastMessage.createdAt).toLocaleString() }}</p>
      </div>
       <div v-else class="last-message">
        <h3>Último Mensaje:</h3>
        <p>No hay último mensaje.</p>
      </div>

      <div v-if="conversationDetails.custom && Object.keys(conversationDetails.custom).length" class="custom-data">
        <h3>Datos Custom:</h3>
        <pre>{{ conversationDetails.custom }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1024px; /* Limitar ancho */
  margin: 20px auto; /* Centrar */
  padding: 20px;
  background-color: #ffffff; /* Fondo blanco limpio */
  border-radius: 8px; /* Bordes redondeados sutiles */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); /* Sombra suave */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* Fuente moderna y legible */
  color: #333; /* Color de texto principal oscuro */
}

.back-link {
    display: inline-block;
    margin-bottom: 1.5em;
    color: #0056b3; /* Azul profesional para enlaces */
    text-decoration: none;
    font-size: 0.95em;
    transition: color 0.2s ease;
}

.back-link:hover {
    text-decoration: underline;
    color: #004085; /* Azul más oscuro en hover */
}

h2, h3 {
  color: #333; /* Color de texto oscuro */
  margin-bottom: 0.8em;
}

h2 {
    text-align: center;
    margin-bottom: 1.5em;
}

.conversation-details > p {
    margin-bottom: 0.8em;
    font-size: 1em;
}

.status-message {
    text-align: center;
    margin-top: 1em;
    font-style: italic;
    color: #555;
    padding: 1em; /* Padding interno */
    background-color: #e9ecef; /* Gris muy claro */
    border-radius: 4px;
}

.error-message {
    color: #dc3545; /* Rojo para errores */
    font-weight: bold;
    background-color: #f8d7da; /* Fondo rojo claro */
    border: 1px solid #f5c6cb;
}

.no-results {
    color: #ffc107; /* Amarillo para sin resultados */
    background-color: #fff3cd; /* Fondo amarillo claro */
    border: 1px solid #ffeeba;
}

.participants-detail {
    margin-top: 2em;
    border-top: 1px solid #eee;
    padding-top: 1.5em;
}

.add-participant {
  margin-bottom: 1.5em;
  display: flex;
  gap: 0.8em; /* Aumentar espacio */
  align-items: center;
}

.add-participant input[type="text"] {
    flex-grow: 1;
    padding: 0.6em 1em; /* Padding ajustado */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
}

.add-participant input[type="text"]:focus {
    outline: none;
    border-color: #007bff; /* Azul de enfoque */
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.add-participant button {
    padding: 0.6em 1.2em; /* Padding ajustado */
    background-color: #28a745; /* Verde para añadir */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease, opacity 0.2s ease;
    font-size: 1em;
}

.add-participant button:hover:not(:disabled) {
    background-color: #218838;
}

.add-participant button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.action-error {
    color: #dc3545; /* Rojo */
    font-size: 0.9em;
    margin-top: 0.5em;
}

/* Styles for frequently used users list */
.frequently-users {
  margin-bottom: 1.5em;
  padding: 1em;
  background-color: #e2f0cb; /* Verde claro */
  border-radius: 8px;
  border: 1px solid #c5e1a5; /* Borde verde */
}

.frequently-users h4 {
  margin-top: 0;
  margin-bottom: 0.8em;
  color: #558b2f; /* Verde oscuro */
  font-size: 1em;
}

.frequently-users ul {
  list-style: none;
  padding: 0;
}

.frequent-user-item {
  background-color: #dcedc8; /* Verde más claro */
  padding: 0.6em 0.8em;
  border-bottom: 1px solid #c5e1a5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9em;
}

.frequent-user-item:last-child {
  border-bottom: none;
}

.frequent-user-item .user-name {
  font-weight: bold;
  margin-right: 0.5em;
  color: #33691e; /* Verde muy oscuro */
}

.frequent-user-item .user-id {
  font-family: monospace;
  font-size: 0.8em;
  color: #424242;
  flex-grow: 1;
  margin-right: 0.8em;
}

.frequent-user-item .copy-button {
  padding: 0.3em 0.6em;
  background-color: #8bc34a; /* Verde */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.frequent-user-item .copy-button:hover {
  background-color: #7cb342;
}

.copied-feedback {
  margin-top: 0.8em;
  padding: 0.5em;
  background-color: #c8e6c9; /* Verde claro */
  color: #2e7d32; /* Verde oscuro */
  border-radius: 4px;
  text-align: center;
  font-size: 0.9em;
}

.participant-boxes-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
}

.participant-box {
    border: 1px solid #b0b0b0; /* Borde gris */
    border-radius: 4px; /* Bordes redondeados */
    padding: 8px 12px; /* Padding ajustado */
    background-color: #f0f0f0; /* Fondo gris claro */
    margin-bottom: 5px;
    font-size: 0.85em; /* Tamaño de fuente ligeramente más pequeño */
    color: #444;
}

.participant-box p {
    margin: 0;
    line-height: 1.4;
}

.participant-box p strong {
    color: #333;
}

.last-message {
    margin-top: 2em;
    border-top: 1px solid #eee;
    padding-top: 1.5em;
}

.last-message h3 {
    margin-bottom: 0.8em;
    color: #555;
}

.last-message p {
    margin-bottom: 0.5em;
    font-size: 0.95em; /* Tamaño de fuente ligeramente más grande */
    line-height: 1.5;
}

.sender-name {
    font-weight: bold;
    color: #0056b3; /* Azul para el nombre del remitente */
}

.custom-data {
    margin-top: 2em;
    border-top: 1px solid #eee;
    padding-top: 1.5em;
}

.custom-data h3 {
    margin-bottom: 0.8em;
    color: #555;
}

.custom-data pre {
    background-color: #e9ecef; /* Fondo gris claro */
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.9em;
    color: #333;
}
</style> 