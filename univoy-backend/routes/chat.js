const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all messages between two users
router.get('/messages/:recipientId', auth, async (req, res) => {
  try {
    console.log('Fetching messages between:', req.user.id, 'and', req.params.recipientId);
    
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.recipientId },
        { sender: req.params.recipientId, recipient: req.user.id }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'email profile')
    .populate('recipient', 'email profile');

    console.log('Found messages:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/messages', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    console.log('Sending message from:', req.user.id, 'to:', recipientId, 'content:', content);

    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'email profile')
      .populate('recipient', 'email profile');

    console.log('Message saved:', populatedMessage);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      // Emit to recipient and sender (can use rooms for more granularity)
      io.emit('new_message', {
        message: populatedMessage,
        recipientId: recipientId,
        senderId: req.user.id
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get available chats for the current user
router.get('/available-chats', auth, async (req, res) => {
  try {
    console.log('Fetching available chats for user:', req.user.id, 'with role:', req.user.role);
    
    let users = [];
    
    switch (req.user.role) {
      case 'student':
        // Students can only chat with admin
        users = await User.find({ role: 'admin' })
          .select('email profile role')
          .populate('profile');
        break;
      
      case 'consultant':
        // Consultants can only chat with admin
        users = await User.find({ role: 'admin' })
          .select('email profile role')
          .populate('profile');
        break;
      
      case 'admin':
        // Admin can chat with all students and consultants
        users = await User.find({ role: { $in: ['student', 'consultant'] } })
          .select('email profile role')
          .populate('profile');
        break;
      
      default:
        console.log('Unknown role:', req.user.role);
        users = [];
    }

    // For each user, count unread messages from them to the current user
    const usersWithUnread = await Promise.all(users.map(async (user) => {
      const unreadCount = await Message.countDocuments({
        sender: user._id,
        recipient: req.user.id,
        read: false
      });
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        unreadCount
      };
    }));

    console.log('Available users for chat:', usersWithUnread.length);
    res.json(usersWithUnread);
  } catch (error) {
    console.error('Error fetching available chats:', error);
    res.status(500).json({ message: 'Error fetching available chats' });
  }
});

// Mark messages as read
router.put('/messages/read/:senderId', auth, async (req, res) => {
  try {
    console.log('Marking messages as read from:', req.params.senderId, 'to:', req.user.id);
    
    const result = await Message.updateMany(
      {
        sender: req.params.senderId,
        recipient: req.user.id,
        read: false
      },
      { read: true }
    );

    console.log('Messages marked as read:', result.modifiedCount);
    res.json({ message: 'Messages marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

module.exports = router; 