import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatBox = ({ currentUser, recipientRole, recipientEmail }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Set up interval to refresh messages
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUser, recipientRole, recipientEmail]);

  const loadMessages = () => {
    try {
      const chatKey = getChatKey();
      const chatHistory = JSON.parse(localStorage.getItem(chatKey)) || [];
      setMessages(chatHistory);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const getChatKey = () => {
    // Create a unique key for the chat based on participants
    const participants = [currentUser.email, recipientEmail].sort();
    return `chat_${participants.join('_')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    try {
      const chatKey = getChatKey();
      const chatHistory = JSON.parse(localStorage.getItem(chatKey)) || [];
      
      const message = {
        id: Date.now(),
        sender: currentUser.email,
        senderName: `${currentUser.profile?.firstName || ''} ${currentUser.profile?.lastName || ''}`,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedChat = [...chatHistory, message];
      localStorage.setItem(chatKey, JSON.stringify(updatedChat));
      
      setMessages(updatedChat);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, bgcolor: '#4CAF50', color: 'white' }}>
        <Typography variant="h6">
          Chat with {recipientRole === 'admin' ? 'Admin' : 
                    recipientRole === 'consultant' ? 'Consultant' : 'Student'}
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {messages.map((message) => {
          const isSender = message.sender === currentUser.email;
          
          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: isSender ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: isSender ? '#4CAF50' : '#f0f0f0',
                  color: isSender ? 'white' : '#333',
                  borderRadius: isSender ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  p: 2,
                  boxShadow: 1,
                  position: 'relative',
                  '&::before': !isSender ? {
                    content: '""',
                    position: 'absolute',
                    left: -8,
                    top: 12,
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '8px solid #f0f0f0',
                  } : {},
                  '&::after': isSender ? {
                    content: '""',
                    position: 'absolute',
                    right: -8,
                    top: 12,
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderLeft: '8px solid #4CAF50',
                  } : {},
                }}
              >
                <Typography variant="caption" display="block" sx={{ 
                  opacity: 0.8, 
                  mb: 0.5,
                  fontWeight: 'medium'
                }}>
                  {message.senderName}
                </Typography>
                <Typography sx={{ 
                  wordBreak: 'break-word',
                  lineHeight: 1.4
                }}>
                  {message.content}
                </Typography>
                <Typography variant="caption" display="block" sx={{ 
                  opacity: 0.7, 
                  textAlign: 'right',
                  mt: 0.5,
                  fontSize: '0.7rem'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatBox; 