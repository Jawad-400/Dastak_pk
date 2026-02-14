import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaCrosshairs, FaSearch } from 'react-icons/fa';
import { geocodeAddress, reverseGeocode } from '../Services/LocationService';

// Fix Leaflet's default marker icons (required for Webpack/CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom user location marker
const userIcon = new L.DivIcon({
  html: '<div style="width: 16px; height: 16px; background: #3498db; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 20px #3498db;"></div>',
  className: 'user-location-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Custom provider marker
const providerIcon = (color = '#3498db', initial = 'P') => new L.DivIcon({
  html: `<div style="
    width: 40px; 
    height: 40px; 
    background: ${color}; 
    border: 3px solid white; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: white; 
    font-weight: bold; 
    font-size: 16px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  ">${initial}</div>`,
  className: 'provider-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const LeafletMap = ({ 
  onLocationSelect, 
  initialLocation = null,
  providers = [],
  onProviderSelect,
  showUserLocation = true,
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const providerMarkersRef = useRef([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    // Default to Lahore if no location
    const defaultLocation = initialLocation || { lat: 31.5204, lng: 74.3587 };
    
    // Create map instance
    mapInstance.current = L.map(mapRef.current).setView(
      [defaultLocation.lat, defaultLocation.lng], 
      12
    );

    // Add OpenStreetMap tiles (FREE, no API key!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Add click handler
    mapInstance.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          draggable: true,
          icon: new L.Icon.Default()
        }).addTo(mapInstance.current);
        
        markerRef.current.on('dragend', async () => {
          const pos = markerRef.current.getLatLng();
          handleLocationSelect(pos.lat, pos.lng);
        });
      }

      handleLocationSelect(lat, lng);
    });

    // Add initial marker if provided
    if (initialLocation) {
      markerRef.current = L.marker([initialLocation.lat, initialLocation.lng], {
        draggable: true,
        icon: new L.Icon.Default()
      }).addTo(mapInstance.current);
      
      markerRef.current.on('dragend', async () => {
        const pos = markerRef.current.getLatLng();
        handleLocationSelect(pos.lat, pos.lng);
      });
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Add/update user location marker
  useEffect(() => {
    if (!mapInstance.current || !showUserLocation || !initialLocation) return;
    
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([initialLocation.lat, initialLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([initialLocation.lat, initialLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(mapInstance.current);
    }
  }, [initialLocation, showUserLocation]);

  // ============ FIX: Add job markers to map ============
// Add this useEffect to show job locations on map
useEffect(() => {
    if (!mapInstance.current || !providers) return;
    
    // Clear existing job markers
    if (window.jobMarkers) {
      window.jobMarkers.forEach(marker => marker.remove());
    }
    window.jobMarkers = [];
  
    // Add job request markers
    providers.forEach(job => {
      if (job.locationCoords && job.locationCoords.lat && job.locationCoords.lng) {
        const jobMarker = L.marker(
          [job.locationCoords.lat, job.locationCoords.lng],
          {
            icon: new L.DivIcon({
              html: `<div style="
                width: 32px;
                height: 32px;
                background: ${job.urgent ? '#ef4444' : '#f59e0b'};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
              ">💰</div>`,
              className: 'job-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })
          }
        ).addTo(mapInstance.current);
        
        // Add popup with job details
        jobMarker.bindPopup(`
          <div style="padding: 16px; max-width: 250px;">
            <h3 style="margin: 0 0 8px; color: #0f172a; font-size: 16px;">${job.service}</h3>
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">${job.customer}</p>
            <p style="margin: 0 0 8px; color: #10b981; font-weight: bold;">${job.budget}</p>
            ${job.distance ? `<p style="margin: 0 0 8px; color: #3498db;">📍 ${job.distance.toFixed(1)} km away</p>` : ''}
            <button 
              onclick="window.acceptJobFromMap('${job.id}')"
              style="
                background: #10b981;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                width: 100%;
              "
            >
              Accept Job
            </button>
          </div>
        `);
        
        window.jobMarkers.push(jobMarker);
      }
    });
    
  }, [providers]);

  // Add provider markers
  useEffect(() => {
    if (!mapInstance.current || !providers.length) return;

    // Clear existing provider markers
    providerMarkersRef.current.forEach(marker => marker.remove());
    providerMarkersRef.current = [];

    providers.forEach(provider => {
      if (!provider.location) return;

      const marker = L.marker(
        [provider.location.lat, provider.location.lng],
        { icon: providerIcon(provider.color || '#3498db', provider.name?.charAt(0) || 'P') }
      ).addTo(mapInstance.current);

      // Add popup
      marker.bindPopup(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px; color: #0f172a;">${provider.name}</h3>
          <p style="margin: 0 0 4px; color: #3498db;">${provider.service}</p>
          <p style="margin: 0 0 8px; color: #64748b;">⭐ ${provider.rating || 4.5} (${provider.reviews || 0} reviews)</p>
          ${provider.distance ? `<p style="margin: 0 0 8px; color: #10b981;">📍 ${provider.distance} km away</p>` : ''}
          <button 
            onclick="window.selectProvider('${provider.id}')"
            style="
              background: #3498db;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              width: 100%;
            "
          >
            View Profile
          </button>
        </div>
      `);

      marker.on('click', () => {
        if (onProviderSelect) onProviderSelect(provider);
      });

      providerMarkersRef.current.push(marker);
    });

    // Expose provider selector to window for popup buttons
    window.selectProvider = (providerId) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider && onProviderSelect) onProviderSelect(provider);
    };

    return () => {
      delete window.selectProvider;
    };
  }, [providers, onProviderSelect]);

  // Handle location selection
  const handleLocationSelect = async (lat, lng) => {
    setSelectedLocation({ lat, lng });
    
    // Reverse geocode to get address
    try {
      const address = await reverseGeocode(lat, lng);
      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lng,
          address: address.formattedAddress,
          city: address.city,
          area: address.area
        });
      }
    } catch (error) {
      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          city: '',
          area: ''
        });
      }
    }
  };

  // Search for location
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await geocodeAddress(searchQuery);
      
      // Center map on result
      mapInstance.current.setView([result.lat, result.lng], 15);
      
      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng([result.lat, result.lng]);
      } else {
        markerRef.current = L.marker([result.lat, result.lng], {
          draggable: true,
          icon: new L.Icon.Default()
        }).addTo(mapInstance.current);
        
        markerRef.current.on('dragend', async () => {
          const pos = markerRef.current.getLatLng();
          handleLocationSelect(pos.lat, pos.lng);
        });
      }
      
      handleLocationSelect(result.lat, result.lng);
      setSearchResults([]);
      setSearchQuery(result.formattedAddress);
    } catch (error) {
      alert('Location not found. Please try a different search term.');
    } finally {
      setIsSearching(false);
    }
  };

  // Detect current location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Center map
        mapInstance.current.setView([latitude, longitude], 15);
        
        // Update marker
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], {
            draggable: true,
            icon: new L.Icon.Default()
          }).addTo(mapInstance.current);
          
          markerRef.current.on('dragend', async () => {
            const pos = markerRef.current.getLatLng();
            handleLocationSelect(pos.lat, pos.lng);
          });
        }
        
        handleLocationSelect(latitude, longitude);
      },
      (error) => {
        let message = 'Could not detect your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message += 'Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out.';
            break;
          default:
            message += 'Please try again.';
        }
        alert(message);
      }
    );
  };

  // Center map on selected location
  const handleRecenter = () => {
    if (selectedLocation) {
      mapInstance.current.setView([selectedLocation.lat, selectedLocation.lng], 15);
    }
  };

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search for your location (e.g., Lahore, Gulberg)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={styles.searchInput}
        />
        <button 
          onClick={handleSearch} 
          disabled={isSearching}
          style={styles.searchButton}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button 
          onClick={handleDetectLocation}
          style={styles.locationButton}
          title="Use my current location"
        >
          <FaCrosshairs />
        </button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ width: '100%', height, borderRadius: '12px' }}
      />

      {/* Map Controls */}
      <div style={styles.mapControls}>
        <button 
          onClick={handleRecenter}
          style={styles.controlButton}
          title="Recenter"
        >
          <FaMapMarkerAlt />
        </button>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div style={styles.locationInfo}>
          <FaMapMarkerAlt style={{ color: '#3498db', marginRight: '8px' }} />
          <span style={styles.locationText}>
            {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '16px',
    display: 'flex',
    gap: '8px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    padding: '14px 16px 14px 48px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    '&:focus': {
      borderColor: '#3498db',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(52,152,219,0.1)',
    },
  },
  searchButton: {
    padding: '0 24px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    '&:hover': {
      background: '#2980b9',
    },
  },
  locationButton: {
    width: '48px',
    background: 'white',
    color: '#3498db',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#3498db',
      background: '#f8fafc',
    },
  },
  mapControls: {
    position: 'absolute',
    top: '80px',
    right: '20px',
    zIndex: 10,
  },
  controlButton: {
    width: '44px',
    height: '44px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#475569',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#f8fafc',
      color: '#3498db',
    },
  },
  locationInfo: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    background: 'white',
    padding: '12px 20px',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    zIndex: 10,
    maxWidth: 'calc(100% - 40px)',
  },
  locationText: {
    fontSize: '14px',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default LeafletMap;