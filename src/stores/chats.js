import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'

export const useChatStore = defineStore('chatStore', () => {
  const conversations = ref([])
  const loading = ref(false)
  const error = ref(null)
  const apiKeyType = ref('dev')

  const getConversationById = (id) => {
    return conversations.value.find(conv => conv.id === id) || null;
  };

  async function searchConversationById(conversationId) {
    loading.value = true;
    error.value = null;
    conversations.value = [];

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/conversations/${conversationId}?keyType=${apiKeyType.value}`;
      console.log('Llamando al backend para buscar conversación:', url);
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al buscar conversación: ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      if (data.data) {
         console.log('Conversación encontrada:', data.data);
         conversations.value.push(data.data);
      } else {
         error.value = 'Conversación no encontrada o datos inesperados.';
         console.log('Conversación no encontrada o datos inesperados.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error searching conversation:', err);
    } finally {
      loading.value = false;
    }
  }

  async function searchConversationsByUserId(userId) {
    loading.value = true;
    error.value = null;
    conversations.value = [];

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/users/${userId}/conversations?keyType=${apiKeyType.value}`;
      console.log('Llamando al backend para buscar conversaciones por usuario:', url);
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al buscar conversaciones del usuario: ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
         console.log('Conversaciones encontradas para el usuario:', data.data);
         conversations.value = data.data; // Asignar el array directamente
      } else {
         error.value = 'No se encontraron conversaciones para este usuario o datos inesperados.';
         console.log('No se encontraron conversaciones para este usuario o datos inesperados.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error searching conversations by user:', err);
    } finally {
      loading.value = false;
    }
  }

  return { conversations, loading, error, apiKeyType, getConversationById, searchConversationById, searchConversationsByUserId }
}) 