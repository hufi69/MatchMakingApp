import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatService {
  constructor() {
    this.isConnected = true; 
  }

  
  getConnectionStatus() {
    return {
      isConnected: true,
      socketId: 'local-chat',
      userId: null
    };
  }

  // Save message to local storage
  async saveMessage(conversationId, message) {
    try {
      const key = `chat_${conversationId}`;
      const existingMessages = await this.getMessages(conversationId);
      
      const newMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        conversationId: conversationId
      };
      
      const updatedMessages = [...existingMessages, newMessage];
      await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      
      console.log(' Message saved locally:', newMessage);
      return newMessage;
    } catch (error) {
      console.error(' Error saving message:', error);
      throw error;
    }
  }

  
  async getMessages(conversationId) {
    try {
      const key = `chat_${conversationId}`;
      const messages = await AsyncStorage.getItem(key);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error(' Error getting messages:', error);
      return [];
    }
  }

  
  async clearChat(conversationId) {
    try {
      const key = `chat_${conversationId}`;
      await AsyncStorage.removeItem(key);
      console.log(' Chat cleared for:', conversationId);
    } catch (error) {
      console.error(' Error clearing chat:', error);
    }
  }

  
  async getAllConversations() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(key => key.startsWith('chat_'));
      const conversations = [];
      
      for (const key of chatKeys) {
        const conversationId = key.replace('chat_', '');
        const messages = await this.getMessages(conversationId);
        if (messages.length > 0) {
          conversations.push({
            conversationId,
            lastMessage: messages[messages.length - 1],
            messageCount: messages.length
          });
        }
      }
      
      return conversations;
    } catch (error) {
      console.error(' Error getting conversations:', error);
      return [];
    }
  }
  startTyping(conversationId) {
    console.log(' Typing started in:', conversationId);
  }

  stopTyping(conversationId) {
    console.log(' Typing stopped in:', conversationId);
  }

  joinChatRoom(conversationId) {
    console.log(' Joined chat room:', conversationId);
  }

  leaveChatRoom(conversationId) {
    console.log(' Left chat room:', conversationId);
  }

  
  disconnect() {
    console.log('Local chat disconnected');
  }
}

const chatService = new ChatService();
export default chatService;
