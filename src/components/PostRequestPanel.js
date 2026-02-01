import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PostRequestPanel = ({ onPost }) => {
  const [form, setForm] = useState({ serviceType: '', description: '', location: '', dateTime: '', budget: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // If the customer is not signed in, redirect them to the sign-in page
    if (!requireAuth()) {
      navigate('/customer-login');
      return;
    }

    if (!form.serviceType || !form.description || !form.location) {
      setError('Please fill required fields.');
      return;
    }
    setError('');

    // attach mock lat/lng from geolocation if available
    const attemptGeo = () => new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), () => resolve(null));
      } else resolve(null);
    });

    attemptGeo().then(coords => {
      const payload = { ...form, lat: coords ? coords.lat : null, lng: coords ? coords.lng : null };
      const created = onPost ? onPost(payload) : null;
      setSuccess('Request posted successfully');
      setForm({ serviceType: '', description: '', location: '', dateTime: '', budget: '' });
      // auto clear success
      setTimeout(() => setSuccess(''), 3000);
    });
  };

  return (
    <div className="panel post-panel">
      <h3>Post a Service Request</h3>
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Type</label>
          <select name="serviceType" value={form.serviceType} onChange={handleChange} required>
            <option value="">Select Service</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrician">Electrician</option>
            <option value="ac-repair">AC Repair</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} required />
        </div>

        <div className="form-group">
          <label>Location (area/city)</label>
          <input name="location" value={form.location} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Preferred Time</label>
            <input type="datetime-local" name="dateTime" value={form.dateTime} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Budget (PKR)</label>
            <input type="number" name="budget" value={form.budget} onChange={handleChange} />
          </div>
        </div>

        <button className="btn btn-primary btn-full" type="submit">Post Request & Get Orders</button>
      </form>
    </div>
  );
};

export default PostRequestPanel;