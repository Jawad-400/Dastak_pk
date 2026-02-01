import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issues in many setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const LocateControl = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);
  return null;
};

const MapView = ({ workers = [], orders = [], onWorkerSelect, onAssignWorker }) => {
  const mapRef = useRef();
  const defaultPos = [24.8607, 67.0011]; // Karachi fallback

  useEffect(() => {
    // try to get browser geolocation and center map
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current.setView([latitude, longitude], 13);
      });
    }
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer center={defaultPos} zoom={13} style={{ height: '620px', width: '100%' }} whenCreated={(m) => (mapRef.current = m)}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {workers.map(w => (
          <Marker key={w.id} position={[w.lat, w.lng]}>
            <Popup>
              <div className="worker-popup">
                <strong>{w.name}</strong>
                <div>{w.service}</div>
                <div>Rating: {w.rating}</div>
                <div className="popup-actions">
                  <button className="btn" onClick={() => onWorkerSelect && onWorkerSelect(w)}>Chat</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {orders.map(o => o.lat && (
          <Circle key={o.id} center={[o.lat, o.lng]} radius={200} pathOptions={{ color: '#3b82f6', opacity: 0.35 }} />
        ))}

      </MapContainer>
    </div>
  );
};

export default MapView;