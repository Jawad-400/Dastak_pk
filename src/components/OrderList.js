import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderList = ({ orders = [], onAssignWorker = () => {}, workers = [], onOpenChat = () => {} }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');

  const activeOrders = orders.filter(o => o.status === 'open' || o.status === 'assigned');
  const historyOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="panel orders-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Your Orders</h3>
        <div className="tab-controls">
          <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active</button>
          <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
        </div>
      </div>

      {tab === 'active' && activeOrders.length === 0 && (
        <div className="empty-state">
          <p>No active orders yet. Post a request to find nearby workers.</p>
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={() => navigate('/post-request')}>Post a Request</button>
          </div>
        </div>
      )}

      {tab === 'history' && historyOrders.length === 0 && (
        <div className="empty-state">
          <p>No history yet. Completed orders will appear here.</p>
        </div>
      )}

      <ul className="orders-list">
        {(tab === 'active' ? activeOrders : historyOrders).map(o => (
          <li key={o.id} className="order-card">
            <div className="order-header">
              <strong>{o.serviceType || 'Service Request'}</strong>
              <span className="order-status">{o.status}</span>
            </div>
            <div className="order-body">{o.description}</div>
            <div className="order-meta">{o.location} • {new Date(o.createdAt).toLocaleString()}</div>

            {o.status === 'open' && (
              <div className="order-actions">
                <div style={{ fontSize: 13, color: '#475569' }}>Waiting for Orders from nearby workers</div>
              </div>
            )}

            {o.status === 'assigned' && (
              <div className="order-actions">
                <div>Assigned Worker: {workers.find(w => w.id === o.workerId)?.name || o.workerId}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={() => onOpenChat(workers.find(w => w.id === o.workerId))}>Open Chat</button>
                </div>
              </div>
            )}

            {tab === 'history' && <div style={{ marginTop: 8, color: '#64748b' }}>Status: {o.status}</div>}

          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList;