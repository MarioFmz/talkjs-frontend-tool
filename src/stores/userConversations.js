import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserConversationsStore = defineStore('userConversationsStore', () => {
  // State for conversations of a specific user
  const conversations = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentUserId = ref(null); // To keep track of which user's conversations are loaded

  // Action to fetch conversations for a user
  async function fetchConversationsForUser(userId, keyType = 'dev') {
    if (!userId) {
        error.value = 'User ID is required to fetch conversations.';
        console.error(error.value);
        return;
    }
    
    loading.value = true;
    error.value = null; // Clear previous errors
    conversations.value = []; // Clear previous conversations
    currentUserId.value = userId; // Set the current user ID

    try {
      // Use the absolute URL for the backend endpoint, including userId and keyType
      const url = `http://localhost:3000/users/${userId}/conversations?keyType=${keyType}`;
      console.log(`Fetching conversations for user ${userId} from ${url}`);

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error fetching conversations: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      // Assuming your backend returns { conversations: [...] }
      if (data && Array.isArray(data.conversations)) {
        conversations.value = data.conversations;
        console.log(`Conversations for user ${userId} fetched successfully:`, conversations.value);
      } else {
        error.value = 'Unexpected data format when fetching conversations.';
        console.error(error.value, data);
      }
    } catch (err) {
      error.value = err.message;
      console.error(`Error fetching conversations for user ${userId}:`, err);
    } finally {
      loading.value = false;
    }
  }

  // Return state and actions
  return {
    conversations,
    loading,
    error,
    currentUserId,
    fetchConversationsForUser,
  }
}) 