import React from 'react';
import ChatPanel from './ChatPanel';

const ChatModal = ({ isOpen, onClose, selectedWorker, user }) => {
  if (!isOpen) return null;
  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <div className="chat-modal-header">
          <h4>Chat {selectedWorker ? `with ${selectedWorker.name}` : ''}</h4>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div className="chat-modal-body">
          <ChatPanel selectedWorker={selectedWorker} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;