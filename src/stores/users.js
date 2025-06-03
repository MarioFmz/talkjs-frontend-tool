import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('userStore', () => {
  // State for users and search
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  // State for search (only searchTerm needed now)
  const searchTerm = ref('');
  // Remove searchType state
  // const searchType = ref('name'); // Default search type

  // Computed property to filter users based on search term across all fields
  const filteredUsers = computed(() => {
    if (!searchTerm.value) {
      return users.value; // If no search term, return all users
    }
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
    return users.value.filter(user => {
      // Check if the search term exists in id, name, or any email
      const idMatch = user.id && String(user.id).toLowerCase().includes(lowerCaseSearchTerm);
      const nameMatch = user.name && user.name.toLowerCase().includes(lowerCaseSearchTerm);
      const emailMatch = user.email && user.email.some(email => email.toLowerCase().includes(lowerCaseSearchTerm));

      return idMatch || nameMatch || emailMatch;
    });
  });

  // Function to fetch users (fetches all users to be filtered locally)
  async function fetchUsers(keyType = 'dev') {
    loading.value = true;
    error.value = null; // Clear previous errors
    users.value = []; // Clear previous users
    // Do not clear searchTerm here

    try {
      // Use the absolute URL for the backend endpoint
      // Include keyType as a query parameter in the URL
      const url = `http://localhost:3000/users?keyType=${keyType}`;
      console.log('Fetching all users:', url);

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error fetching users: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      // Assuming your backend now returns { users: [...] }
      if (data && Array.isArray(data.users)) {
        users.value = data.users;
        console.log('All users fetched successfully:', users.value);
      } else {
        error.value = 'Unexpected data format when fetching users.';
        console.error(error.value, data);
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching users:', err);
    } finally {
      loading.value = false;
    }
  }

  // Return state and actions, including new search state and filteredUsers
  return {
    users,
    loading,
    error,
    searchTerm, // Only searchTerm returned now
    // searchType, // Removed searchType from return
    filteredUsers, // Return the computed property
    fetchUsers,
  }
}) 