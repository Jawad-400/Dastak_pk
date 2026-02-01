import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import PostRequestPanel from '../components/PostRequestPanel';
import OrderList from '../components/OrderList';
import ChatPanel from '../components/ChatPanel';
import ChatModal from '../components/ChatModal';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';

const CustomerPortalMap = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!requireAuth()) navigate('/customer-login');
  }, [requireAuth, navigate]);

  // Mock state for workers, orders and selected worker for chat
  const [workers, setWorkers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const { connected, emit } = useSocket(user);

  useEffect(() => {
    // Mock nearby workers (lat, lng) - replace with real API later
    setWorkers([
      { id: 'w1', name: 'Ahmed', service: 'Plumber', lat: 24.867, lng: 67.001, rating: 4.7 },
      { id: 'w2', name: 'Sara', service: 'AC Technician', lat: 24.863, lng: 67.010, rating: 4.8 },
      { id: 'w3', name: 'Bilal', service: 'Electrician', lat: 24.857, lng: 67.005, rating: 4.6 }
    ]);

    // Rehydrate orders from localStorage
    const saved = localStorage.getItem('customer_orders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('customer_orders', JSON.stringify(orders));
  }, [orders]);

  const handlePostRequest = (payload) => {
    // Add a created order with an id and status
    const newOrder = {
      id: `o_${Date.now()}`,
      ...payload,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setOrders([newOrder, ...orders]);

    // notify workers via socket (dev server will broadcast)
    try { emit('create_request', newOrder); } catch (e) { /* ignore */ }

    return newOrder;
  };

  const handleAssignWorker = (orderId, workerId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'assigned', workerId } : o));
  };

  const openChat = (worker) => {
    setSelectedWorker(worker || null);
    setShowChatModal(true);
  };

  return (
    <section className="customer-portal">
      <div className="container portal-layout">
        <div className="portal-left">
          <MapView
            workers={workers}
            orders={orders}
            onWorkerSelect={(w) => openChat(w)}
            onAssignWorker={handleAssignWorker}
          />
        </div>

        <div className="portal-right">
          <PostRequestPanel onPost={handlePostRequest} />
          <OrderList orders={orders} onAssignWorker={handleAssignWorker} workers={workers} onOpenChat={openChat} />
          <ChatPanel selectedWorker={selectedWorker} user={user} onExpand={() => setShowChatModal(true)} />
        </div>
      </div>

      <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} selectedWorker={selectedWorker} user={user} />
    </section>
  );
};

export default CustomerPortalMap;
