const express = require('express');
const router = express.Router();
const mongoDB = require('../config/mongodb');

console.log('✅ messages.js loaded');

// Get all messages for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const db = await mongoDB.connect();
    const messagesCollection = db.collection('messages');
    
    const messages = await messagesCollection
      .find({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    // Group by chatId
    const groupedMessages = {};
    messages.forEach(msg => {
      if (!groupedMessages[msg.chatId]) {
        groupedMessages[msg.chatId] = [];
      }
      groupedMessages[msg.chatId].push({
        id: msg.messageId,
        text: msg.text,
        senderId: msg.senderId,
        senderName: msg.senderName,
        timestamp: msg.timestamp,
        read: msg.read
      });
    });
    
    res.json({ success: true, data: groupedMessages });
    
  } catch (error) {
    console.error('Error loading messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;