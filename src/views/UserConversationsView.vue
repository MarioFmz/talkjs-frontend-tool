<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserConversationsStore } from '../stores/userConversations';
import { useChatStore } from '../stores/chats'; // To get the current environment keyType
import { useUserStore } from '../stores/users'; // Import useUserStore
// Assuming you might have a component to display a single conversation item
// import ConversationItem from '../components/ConversationItem.vue';

const route = useRoute();
const router = useRouter(); // Get router instance
const userConversationsStore = useUserConversationsStore();
const chatStore = useChatStore();
const userStore = useUserStore(); // Get user store instance

const userId = ref(null);

// Computed property to find the user from the userStore based on the route userId
const currentUser = computed(() => {
    // Find the user in the userStore.users array
    return userStore.users.find(user => user.id === userId.value);
});

// Function to fetch conversations based on the userId from the route and current environment
const fetchUserConversations = (id) => {
    if (id) {
        userId.value = id;
        userConversationsStore.fetchConversationsForUser(id, chatStore.apiKeyType);
    }
};

// Fetch conversations when the component is mounted, using the userId from the initial route
onMounted(() => {
    fetchUserConversations(route.params.userId);
});

// Watch for changes in the route's userId parameter
watch(() => route.params.userId, (newUserId) => {
    fetchUserConversations(newUserId);
});

// Also watch for changes in the environment (apiKeyType) and refetch conversations
watch(() => chatStore.apiKeyType, (newKeyType) => {
    console.log('Environment changed to:', newKeyType, '. Refetching user conversations...');
    if (userId.value) { // Only refetch if a user ID is already loaded
        userConversationsStore.fetchConversationsForUser(userId.value, newKeyType);
    }
});

// Function to navigate back
const goBack = () => {
    router.back(); // Use router.back() to go to the previous history entry
};

</script>

<template>
  <div class="user-conversations-container">
    <!-- Add a back button -->
    <button @click="goBack" class="back-button">Volver Atrás</button>

    <!-- Update the title to show user's name if available -->
    <h1 v-if="currentUser">Conversaciones de {{ currentUser.name }} ({{ chatStore.apiKeyType }})</h1>
    <h1 v-else-if="userId">Conversaciones del Usuario: {{ userId }} ({{ chatStore.apiKeyType }})</h1>
    <h1 v-else>Selecciona un usuario para ver sus conversaciones</h1>

    <!-- Loading, Error, and Empty States for Conversations -->
    <div v-if="userConversationsStore.loading" class="status-message">Cargando conversaciones...</div>
    <div v-else-if="userConversationsStore.error" class="error-message">Error al cargar conversaciones: {{ userConversationsStore.error }}</div>
    <div v-else-if="userConversationsStore.conversations.length === 0" class="status-message no-results">No hay conversaciones para este usuario en este entorno.</div>

    <!-- Conversations List -->
    <div v-else class="conversations-list">
      <h3>Conversaciones:</h3>
      <div v-for="conversation in userConversationsStore.conversations" :key="conversation.id">
        <!-- Wrap conversation item in router-link -->
        <router-link :to="{ name: 'conversation-detail', params: { id: conversation.id } }" class="conversation-item-link">
          <div class="conversation-item">
            <!-- Display conversation information -->
            <p><strong>ID:</strong> {{ conversation.id }}</p>
            <p><strong>Asunto:</strong> {{ conversation.subject || 'Sin Asunto' }}</p>

            <!-- Display participant details in boxes -->
            <div v-if="conversation.participants">
              <p><strong>Participantes:</strong></p>
              <div class="participant-boxes-container">
                <div v-for="participantId in Object.keys(conversation.participants)" :key="participantId" class="participant-box">
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
          </div>
        </router-link>
      </div>
    </div>

  </div>
</template>

<style scoped>
.user-conversations-container {
  max-width: 1024px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff; /* Fondo blanco limpio */
  border-radius: 8px; /* Bordes redondeados sutiles */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); /* Sombra suave */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* Fuente moderna y legible */
  color: #333; /* Color de texto principal oscuro */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-conversations-container {
    margin: 10px;
    padding: 15px;
    border-radius: 6px; /* Ligeramente menos redondeado en pantallas pequeñas */
  }
}

.back-button {
  display: inline-block;
  padding: 0.6em 1.2em; /* Padding ajustado */
  background-color: #6c757d; /* Gris neutro */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1.5em;
  font-size: 0.95em; /* Tamaño de fuente ligeramente más pequeño */
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #5a6268;
}

h1 {
  text-align: center;
  color: #0056b3; /* Azul profesional */
  margin-top: 1em;
  margin-bottom: 1.5em;
  font-size: 2em;
  font-weight: 600;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5em;
    margin-bottom: 1em;
  }
}

h3 {
  color: #555; /* Color de texto oscuro */
  margin-top: 1.5em;
  margin-bottom: 1em;
  border-bottom: 1px solid #eee; /* Separador ligero */
  padding-bottom: 0.5em;
}

.status-message {
  text-align: center;
  margin-top: 1.5em;
  font-style: italic;
  color: #555;
  padding: 1em;
  background-color: #e9ecef; /* Gris muy claro */
  border-radius: 4px;
}

.error-message {
  color: #dc3545; /* Rojo */
  font-weight: bold;
  background-color: #f8d7da; /* Fondo rojo claro */
  border: 1px solid #f5c6cb;
  padding: 1em;
  border-radius: 8px;
}

.no-results {
  color: #ffc107; /* Amarillo/Naranja */
  background-color: #fff3cd; /* Fondo amarillo claro */
  border: 1px solid #ffeeba;
}

/* Styles for the conversation item link */
.conversation-item-link {
    text-decoration: none;
    color: inherit;
    display: block;
    margin-bottom: 15px;
    border: 1px solid #e0e0e0; /* Borde gris claro */
    border-radius: 8px; /* Bordes redondeados */
    background-color: #ffffff; /* Fondo blanco */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Sombra suave */
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out; /* Añadir border-color a la transición */
}

.conversation-item-link:hover {
    transform: translateY(-3px); /* Ligero efecto de elevación */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Aumentar sombra */
    border-color: #b0b0b0; /* Cambiar color del borde */
}

.conversation-item {
  padding: 15px;
  margin-bottom: 0;
}

.conversation-item p {
  margin-bottom: 8px;
  line-height: 1.5;
}

.conversation-item p strong {
    color: #555;
}

/* Styles for the new participant boxes */
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
</style> 