import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';

const ChatScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  const flatListRef = useRef(null);

  // Get match data from navigation params
  const match = route.params?.match;
  const otherUser = match?.userOne?._id === user?.id ? match?.userTwo : match?.userOne;
  
  // Create conversation ID from match
  const conversationId = match ? `${match._id}_chat` : null;

  useEffect(() => {
    if (match && user && conversationId) {
      loadMessages();
      chatService.joinChatRoom(conversationId);
    }

    return () => {
      if (conversationId) {
        chatService.leaveChatRoom(conversationId);
      }
    };
  }, [match, user, conversationId]);

  const loadMessages = async () => {
    try {
      const savedMessages = await chatService.getMessages(conversationId);
      
      if (savedMessages.length === 0) {
        // Add sample messages if no saved messages
        const sampleMessages = [
          {
            id: '1',
            text: 'Hey! Great to match with you! 👋',
            senderId: otherUser?._id,
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: '2',
            text: 'Hi there! Excited to connect! 👋',
            senderId: user?.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
          },
        ];
        
        // Save sample messages
        for (const msg of sampleMessages) {
          await chatService.saveMessage(conversationId, msg);
        }
        
        setMessages(sampleMessages);
      } else {
        setMessages(savedMessages);
      }
    } catch (error) {
      console.error(' Error loading messages:', error);
    }
  };

  const addMessageToChat = (message) => {
    setMessages(prev => [...prev, message]);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim() || !conversationId) return;
    
    try {
      // Create new message
      const newMessage = {
        text: message.trim(),
        senderId: user?.id,
        receiverId: otherUser?._id,
      };

    
      const savedMessage = await chatService.saveMessage(conversationId, newMessage);
      
      
      addMessageToChat(savedMessage);
      setMessage('');
      
      console.log('Message sent and saved locally');
      
    } catch (error) {
      console.error(' Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isMyMessage ? styles.myTimestamp : styles.otherTimestamp
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {otherUser?.name || 'Unknown User'}
          </Text>
          <View style={styles.headerStatus}>
            <Text style={styles.headerSubtitle}>
              {otherUser?.role || 'Role not specified'}
            </Text>
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Local Chat Status */}
      {/* <View style={styles.connectionStatus}>
        <Text style={styles.connectionText}>
           Local Chat Mode - Messages saved on device
        </Text>
      </View> */}

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 150}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          onLayout={() => {
            // Scroll to bottom when layout changes (keyboard opens/closes)
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        />
      </KeyboardAvoidingView>

      {/* Message Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            textAlignVertical="top"
            onContentSizeChange={(event) => {
              // Auto-adjust height for multi-line text
              const { height } = event.nativeEvent.contentSize;
              if (height > 100) {
                // Scroll to bottom when text gets long
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            }}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Text style={[
              styles.sendButtonText,
              !message.trim() && styles.sendButtonTextDisabled
            ]}>
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: '#495057',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#6c757d',
    fontSize: 14,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 16,
  },
  connectionStatus: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#e9ecef',
  },
  connectionText: {
    fontSize: 14,
    color: '#6c757d',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#212529',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  myTimestamp: {
    color: '#fff',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#6c757d',
  },
  typingText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 120,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#adb5bd',
  },
});

export default ChatScreen;
