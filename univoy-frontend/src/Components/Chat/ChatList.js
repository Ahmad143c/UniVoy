import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Divider,
  Badge
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import chatService from '../../Services/chatService';
import { io } from 'socket.io-client';

// compute socket URL from the API_URL environment variable so we can point at
// the forwarded backend host in Codespaces.
const SOCKET_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace('/api', '')) ||
  'http://localhost:5001';

const ChatList = ({ currentUser, onSelectChat }) => {
  const [availableChats, setAvailableChats] = useState([]);

  useEffect(() => {
    const fetchAvailableChats = async () => {
      try {
        const chats = await chatService.getAvailableChats();
        setAvailableChats(chats);
      } catch (error) {
        console.error('Error fetching available chats:', error);
      }
    };
    fetchAvailableChats();

    // Setup socket connection
    const socket = io(SOCKET_URL);
    socket.on('new_message', (data) => {
      if (data.recipientId === currentUser._id || data.senderId === currentUser._id) {
        fetchAvailableChats();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  return (
    <Paper elevation={3} sx={{ height: '500px', overflow: 'auto' }}>
      <Box sx={{ p: 2, bgcolor: '#4CAF50', color: 'white' }}>
        <Typography variant="h6">Available Chats</Typography>
      </Box>
      <List>
        {availableChats.map((chat, index) => (
          <React.Fragment key={chat._id}>
            <ListItem
              button
              onClick={() => onSelectChat(chat)}
              sx={{
                '&:hover': {
                  bgcolor: '#f5f5f5',
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
                  <Avatar src={chat.profile?.profilePicture}>
                    <PersonIcon />
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={chat.email || chat.name}
                secondary={`${chat.role.charAt(0).toUpperCase() + chat.role.slice(1)}`}
              />
            </ListItem>
            {index < availableChats.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {availableChats.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No available chats"
              secondary="You don't have any available chats at the moment."
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default ChatList; 