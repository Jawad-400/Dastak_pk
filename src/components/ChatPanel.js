import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';

// Accept onExpand as an optional prop (default no-op) to avoid undefined errors
const ChatPanel = ({ selectedWorker, user, onExpand = () => {} }) => {
  const workerId = selectedWorker?.id || 'general';
  const room = `chat:${user?.id || 'guest'}:${workerId}`;

  const { connected, joinRoom, leaveRoom, emit, on, off } = useSocket(user);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const prevRoomRef = useRef(null);

  useEffect(() => {
    // on room change: join and request history
    if (!user) return;

    // leave previous
    if (prevRoomRef.current && prevRoomRef.current !== room) {
      leaveRoom(prevRoomRef.current);
    }

    prevRoomRef.current = room;

    joinRoom(room);
    // ask server for history (server may respond with `history` event)
    emit('history', { room });

    const handleHistory = (payload) => {
      if (payload?.room === room) setMessages(payload.messages || []);
    };

    const handleMessage = (msg) => {
      if (msg?.room === room) setMessages((p) => [...p, msg]);
    };

    on('history', handleHistory);
    on('message', handleMessage);

    // offline fallback: load from localStorage when not connected
    if (!connected) {
      const saved = JSON.parse(localStorage.getItem('conversations') || '{}');
      if (saved[workerId]) setMessages(saved[workerId]);
    }

    return () => {
      off('history', handleHistory);
      off('message', handleMessage);
      leaveRoom(room);
    };
  }, [room, user?.id, workerId, connected]);

  // persist for offline fallback
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('conversations') || '{}');
    all[workerId] = messages;
    localStorage.setItem('conversations', JSON.stringify(all));
  }, [messages, workerId]);

  const sendMessage = () => {
    if (!message) return;
    const msg = { room, from: user?.id || 'guest', sender: user?.name || 'You', text: message, ts: Date.now() };
    if (connected) {
      emit('message', msg);
    } else {
      setMessages((p) => [...p, msg]);
    }
    setMessage('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="panel chat-panel">
      <h3>
        Chat {selectedWorker ? `with ${selectedWorker.name}` : ''}
        <div style={{ float: 'right', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: connected ? '#16a34a' : '#c2410c' }}>{connected ? '● online' : '● offline'}</span>
          <button className="btn btn-ghost small" onClick={() => onExpand && onExpand()}>Expand</button>
        </div>
      </h3>

      {!selectedWorker && (
        <div className="chat-empty-note">
          <p>Select a worker on the map to start a direct chat, or use the general chat below.</p>
        </div>
      )}

      <div className="chat-window">
        {messages.length === 0 && <div className="empty-state">No messages yet. Say hello 👋</div>}

        {messages.map((m, idx) => (
          <div key={idx} className={`chat-msg ${m.from === (user?.id || 'guest') ? 'out' : 'in'}`}>
            <div className="msg-sender">{m.sender}</div>
            <div className="msg-text">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKey} placeholder={selectedWorker ? "Write a message..." : "Write a message to general chat..."} />
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPanel;