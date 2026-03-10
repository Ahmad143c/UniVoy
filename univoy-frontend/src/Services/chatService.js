import axios from 'axios';

// use the same environment variable as other services
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const chatService = {
  // Get all messages between two users
  getMessages: async (recipientId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages/${recipientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a new message
  sendMessage: async (recipientId, content) => {
    try {
      const response = await axios.post(
        `${API_URL}/chat/messages`,
        { recipientId, content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get available chats for the current user
  getAvailableChats: async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/available-chats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available chats:', error);
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (senderId) => {
    try {
      const response = await axios.put(
        `${API_URL}/chat/messages/read/${senderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
};

export default chatService; 