import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import chatService from '../../Services/chatService';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

const ChatSection = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [availableChats, setAvailableChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchAvailableChats = async () => {
      try {
        setError(null);
        const chats = await chatService.getAvailableChats();
        setAvailableChats(chats);
      } catch (error) {
        console.error('Error fetching available chats:', error);
        if (error.response?.status !== 404) {
          setError('Error loading chats. Please try again later.');
        }
      }
    };

    fetchAvailableChats();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        setLoading(true);
        try {
          const fetchedMessages = await chatService.getMessages(selectedChat._id);
          setMessages(fetchedMessages);
          await chatService.markMessagesAsRead(selectedChat._id);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError('Error loading messages. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Setup socket connection
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('new_message', (data) => {
      // If the message is for the current user (as recipient or sender), refresh chats
      if (
        data.recipientId === currentUser._id ||
        data.senderId === currentUser._id
      ) {
        // Re-fetch available chats
        chatService.getAvailableChats().then(setAvailableChats);
        // If the selected chat is open and matches sender/recipient, refresh messages
        if (
          selectedChat &&
          (selectedChat._id === data.senderId || selectedChat._id === data.recipientId)
        ) {
          chatService.getMessages(selectedChat._id).then(setMessages);
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedChat]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      try {
        const sentMessage = await chatService.sendMessage(selectedChat._id, newMessage);
        setMessages([...messages, sentMessage]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Error sending message. Please try again later.');
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // After marking messages as read, update unreadCount for that chat
  useEffect(() => {
    if (selectedChat) {
      const updateUnreadCount = async () => {
        await chatService.markMessagesAsRead(selectedChat._id);
        setAvailableChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id ? { ...chat, unreadCount: 0 } : chat
          )
        );
      };
      updateUnreadCount();
    }
    // Only run when selectedChat changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 200px)',
      bgcolor: '#f5f5f5',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Chat List */}
      <Paper sx={{ 
        width: 300, 
        overflow: 'auto', 
        borderRight: 1, 
        borderColor: 'divider',
        bgcolor: 'white'
      }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: '#4CAF50', 
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Conversations
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        <List sx={{ p: 0 }}>
          {availableChats.map((chat) => (
            <ListItem
              key={chat._id}
              button
              selected={selectedChat?._id === chat._id}
              onClick={() => setSelectedChat(chat)}
              sx={{
                borderBottom: '1px solid #f0f0f0',
                '&.Mui-selected': {
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(76, 175, 80, 0.12)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.04)',
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="error"
                  badgeContent={chat.unreadCount > 0 ? chat.unreadCount : null}
                  invisible={chat.unreadCount === 0}
                  sx={{
                    '& .MuiBadge-badge': {
                      right: 3,
                      top: 3,
                    },
                  }}
                >
                  <Avatar 
                    src={chat.profile?.profilePicture}
                    sx={{ 
                      bgcolor: '#4CAF50',
                      width: 40,
                      height: 40
                    }}
                  >
                    {chat.email[0].toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                    {chat.email}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {chat.role.charAt(0).toUpperCase() + chat.role.slice(1)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          {availableChats.length === 0 && !error && (
            <ListItem>
              <ListItemText
                primary="No available chats"
                secondary="Complete your profile to start chatting"
                sx={{ textAlign: 'center', py: 2 }}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Chat Messages */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'white'
      }}>
        {selectedChat ? (
          <>
            <Box sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: '#4CAF50',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedChat.email}
              </Typography>
            </Box>

            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2,
              bgcolor: '#f8f9fa'
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress sx={{ color: '#4CAF50' }} />
                </Box>
              ) : (
                <Stack spacing={2}>
                  {messages.map((message) => {
                    // Handle both possible field names for user ID
                    const messageSenderId = message.sender?._id || message.sender?.id;
                    const currentUserId = currentUser?._id || currentUser?.id;
                    const isSender = messageSenderId && currentUserId && messageSenderId === currentUserId;
                    
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          display: 'flex',
                          justifyContent: isSender ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start',
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
                            {message.sender?.email || 'Unknown User'}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            wordBreak: 'break-word',
                            lineHeight: 1.4
                          }}>
                            {message.content}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              textAlign: 'right',
                              fontSize: '0.7rem'
                            }}
                          >
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
                </Stack>
              )}
            </Box>

            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: 'white'
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                bgcolor: 'white',
                borderRadius: 2,
                p: 1
              }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{
                    bgcolor: '#4CAF50',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#388E3C',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#9e9e9e',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            bgcolor: '#f8f9fa'
          }}>
            <Typography variant="h6" color="textSecondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatSection; 