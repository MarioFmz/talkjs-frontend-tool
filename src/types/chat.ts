// frontend/src/types/chat.ts

// Define interfaces for better type safety
export interface Participant {
  // Based on the structure observed from API responses
  // We only have userId in the conversation participants object
  // Full user details would come from a separate /users endpoint if implemented
  // For now, we define what we know is present.
  // The access and notify fields might also be present depending on the TalkJS API structure returned within the conversation participant list
  access?: string;
  notify?: boolean | 'MentionsOnly';
  // Assuming userId is the key in the participants object, but it's good practice to define its type if it were a property within the participantData object.
  // Since participantData is currently an empty object {} in the conversation structure based on our current understanding, we'll keep it minimal.
  // If the API returned participant objects with more properties, they would be defined here.
  // Example if API returned { id: string, name: string, ... }: id: string; name: string; 
}

export interface Message {
  id?: string;
  text?: string;
  createdAt: number; // Timestamp
  senderId: string;
  // Other potential message properties could be added here
}

export interface Conversation {
  id: string;
  subject?: string;
  lastMessage?: Message | null;
  participants: { [userId: string]: Participant }; // Map of userId to Participant data
  // Other potential conversation properties could be added here (e.g., custom data, status)
  photoUrl?: string; // Example of another potential property
} 