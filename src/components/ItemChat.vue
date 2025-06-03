<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chats'
// Import interfaces from the new types directory
import type { Conversation } from '../types/chat'

// Remove interface definitions as they are now in types/chat.ts
// interface Participant { ... }
// interface Message { ... }
// interface Conversation { ... }

const props = defineProps<{
  conversation: Conversation
}>()

const router = useRouter()
const chatStore = useChatStore()

function formatDate(ts: number | undefined): string {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleString();
}

// Obtener los detalles del participante desde el store si están disponibles
// Esta función ya no es relevante en este componente como se notó antes,
// pero la mantengo para ilustrar cómo se tiparía si fuera necesaria.
const getParticipantDetails = (userId: string) => {
  // Logic to get user details, potentially from a store or another source
  // Return type would be a User interface or null/undefined
  return null; // Placeholder
};

// Mostrar el nombre de los participantes en el encabezado si no hay asunto
const participantNames = computed(() => {
  if (!props.conversation || !props.conversation.participants) {
    return 'No participants';
  }
  // Aquí solo tenemos los IDs de usuario como claves en el objeto participants.
  const participantIds = Object.keys(props.conversation.participants);
  return participantIds.join(', ');
});

// Snippet del último mensaje
const lastMessageSnippet = computed(() => {
  if (!props.conversation || !props.conversation.lastMessage) {
    return 'No hay mensajes.';
  }
  const text = props.conversation.lastMessage.text;
  return text ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : 'Mensaje sin texto';
});

// Hora del último mensaje
const lastMessageTime = computed(() => {
  if (!props.conversation || !props.conversation.lastMessage) {
    return '';
  }
  return new Date(props.conversation.lastMessage.createdAt).toLocaleTimeString();
});

// La función goToDetail ya no es necesaria si usamos router-link
// const goToDetail = () => {
//   if (props.conversation && props.conversation.id) {
//     // Aquí usas el router para navegar a la vista de detalle
//     // import { useRouter } from 'vue-router';
//     // const router = useRouter();
//     // router.push(`/conversations/${props.conversation.id}`);
//   }
// };

</script>

<template>
  <!-- Asegúrate de que conversation y conversation.id existan antes de usarlo -->
  <div v-if="conversation && conversation.id" class="chat-item-content">
    <div class="chat-header">
      <!-- Mostrar asunto si existe, de lo contrario, mostrar IDs de participantes -->
      <h3 class="chat-subject">{{ conversation.subject || participantNames }}</h3>
      <span class="chat-time">{{ lastMessageTime }}</span>
    </div>
    <p class="chat-snippet">{{ lastMessageSnippet }}</p>
    <div class="chat-participants">
        <span class="participant-label">Participantes:</span>
        <!-- Aquí solo tenemos los IDs de participantes -->
        <span v-for="(participantData, userId) in conversation.participants" :key="userId" class="participant-tag">
          {{ userId }}
        </span>
    </div>
  </div>
   <!-- Mostrar un mensaje si la conversación es inválida -->
   <div v-else class="chat-item-content invalid-conversation">
      <p>Error: Datos de conversación inválidos.</p>
   </div>
</template>

<style scoped>
/* Los estilos de .chat-item, etc., se movieron al .item-chat-link en ListView.vue */
/* Este componente ahora solo estiliza el *contenido* dentro del enlace */
.chat-item-content {
  padding: 1em; /* Padding interno */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-item-content {
    padding: 0.8em; /* Reduce padding on smaller screens */
  }
}

.chat-item-content.invalid-conversation {
   padding: 1em; /* Asegurar padding también para el mensaje de error */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-item-content.invalid-conversation {
    padding: 0.8em; /* Reduce padding on smaller screens */
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-header {
    flex-direction: column; /* Stack subject and time */
    align-items: flex-start;
    margin-bottom: 0.3em; /* Reduce space */
  }
}

.chat-subject {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
  margin-right: 1em;
  color: #333; /* Color de texto principal */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-subject {
    font-size: 1em; /* Slightly smaller font */
    margin-right: 0; /* Remove right margin */
    margin-bottom: 0.3em; /* Add space below subject when stacked */
  }
}

.chat-time {
  font-size: 0.8em;
  color: #555;
  flex-shrink: 0;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-time {
    font-size: 0.7em; /* Slightly smaller font */
  }
}

.chat-snippet {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-snippet {
    font-size: 0.8em; /* Slightly smaller font */
    margin-bottom: 0.5em; /* Reduce space */
  }
}

.chat-participants {
  font-size: 0.8em;
  color: #777;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .chat-participants {
    font-size: 0.7em; /* Slightly smaller font */
  }
}

.participant-label {
    font-weight: bold;
    margin-right: 0.5em;
}

.participant-tag {
    background-color: #e9e9eb;
    padding: 0.2em 0.5em;
    border-radius: 4px;
    margin-right: 0.5em;
    white-space: nowrap;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .participant-tag {
    padding: 0.1em 0.3em; /* Reduce padding */
    margin-right: 0.3em; /* Reduce margin */
  }
}

.invalid-conversation {
    color: #d32f2f;
    background-color: #ffebee; /* Fondo más claro para el error */
}
</style> 