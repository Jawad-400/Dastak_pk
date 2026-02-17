import React, { useState, useEffect, useRef } from 'react';
import { 
  FaMapMarkerAlt, FaStar, FaWrench, FaPhone, 
  FaEnvelope, FaCheckCircle, FaTimesCircle,
  FaBriefcase, FaClock, FaRupeeSign, FaUser
} from 'react-icons/fa';
import { useLocation } from '../context/LocationContext';
import { calculateDistance } from '../Services/LocationService';

const NearbyProvidersMap = ({ providers, onSelectProvider }) => {
  const { maps, userLocation, mapsLoaded } = useLocation();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);

  // Map styles - custom design
  const mapStyles = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e2e8f0' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f8fafc' }]
    }
  ];

  // Initialize map
  useEffect(() => {
    if (!maps || !mapRef.current) {
      setMapError('Google Maps not loaded');
      return;
    }

    if (!userLocation) {
      setMapError('Please enable location to see nearby providers');
      return;
    }

    try {
      // Initialize map
      const newMap = new maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 13,
        styles: mapStyles,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: maps.ControlPosition.RIGHT_CENTER
        }
      });

      const newInfoWindow = new maps.InfoWindow({
        maxWidth: 300,
        pixelOffset: new maps.Size(0, -30)
      });

      setInfoWindow(newInfoWindow);
      setMap(newMap);
      setMapError(null);

      // Add user location marker
      const userMarker = new maps.Marker({
        map: newMap,
        position: userLocation,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#3498db',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3
        },
        title: 'Your Location',
        zIndex: 999
      });

      // Add user location circle
      new maps.Circle({
        map: newMap,
        center: userLocation,
        radius: 500,
        fillColor: '#3498db',
        fillOpacity: 0.1,
        strokeColor: '#2980b9',
        strokeOpacity: 0.3,
        strokeWeight: 1
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [maps, userLocation, mapRef]);

  // Add provider markers
  useEffect(() => {
    if (!map || !maps || !providers.length || !userLocation) {
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    try {
      const newMarkers = providers.map(provider => {
        if (!provider.location || !provider.location.lat || !provider.location.lng) {
          return null;
        }

        // Create custom marker icon
        const markerIcon = {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" fill="${provider.color || '#3498db'}" stroke="white" stroke-width="3"/>
              <text x="24" y="32" font-size="18" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">
                ${provider.name?.charAt(0) || 'P'}
              </text>
            </svg>
          `)}`,
          scaledSize: new maps.Size(48, 48),
          anchor: new maps.Point(24, 24)
        };

        const marker = new maps.Marker({
          map,
          position: provider.location,
          icon: markerIcon,
          animation: maps.Animation.DROP,
          title: provider.name,
          optimized: false,
          zIndex: 100
        });

        // Calculate distance
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          provider.location.lat,
          provider.location.lng
        );

        // Add click listener
        marker.addListener('click', () => {
          // Close any open info window
          if (infoWindow) {
            infoWindow.close();
          }

          // Set selected provider
          setSelectedProvider({ ...provider, distance });

          // Create info window content
          const contentString = `
            <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 260px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="
                  width: 48px;
                  height: 48px;
                  background: ${provider.color || '#3498db'};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 20px;
                  font-weight: 600;
                ">
                  ${provider.name?.charAt(0) || 'P'}
                </div>
                <div style="flex: 1;">
                  <h3 style="margin: 0 0 4px; color: #0f172a; font-size: 16px; font-weight: 700;">
                    ${provider.name}
                  </h3>
                  <p style="margin: 0; color: #3498db; font-size: 13px; font-weight: 500;">
                    ${provider.service}
                  </p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="display: flex; align-items: center; gap: 2px; color: #f59e0b;">
                  ${'★'.repeat(Math.floor(provider.rating || 4.5))}
                  ${'☆'.repeat(5 - Math.floor(provider.rating || 4.5))}
                </span>
                <span style="color: #64748b; font-size: 12px;">
                  (${provider.reviews || 0} reviews)
                </span>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                  <p style="margin: 0 0 2px; color: #64748b; font-size: 11px;">EXPERIENCE</p>
                  <p style="margin: 0; color: #0f172a; font-size: 13px; font-weight: 600;">
                    ${provider.experience || '2+'} years
                  </p>
                </div>
                <div>
                  <p style="margin: 0 0 2px; color: #64748b; font-size: 11px;">JOBS DONE</p>
                  <p style="margin: 0; color: #0f172a; font-size: 13px; font-weight: 600;">
                    ${provider.completedJobs || 0}+
                  </p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <span style="display: flex; align-items: center; gap: 4px; color: #10b981; font-size: 13px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  ${distance ? `${distance.toFixed(1)} km away` : 'Distance unknown'}
                </span>
              </div>
              
              <div style="display: flex; gap: 8px;">
                <button 
                  onclick="window.viewProviderProfile('${provider.id}')"
                  style="
                    flex: 1;
                    padding: 10px;
                    background: #f8fafc;
                    color: #3498db;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                >
                  View Profile
                </button>
                <button 
                  onclick="window.selectProviderForJob('${provider.id}')"
                  style="
                    flex: 1;
                    padding: 10px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                >
                  Select Provider
                </button>
              </div>
            </div>
          `;

          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        return marker;
      }).filter(Boolean);

      setMarkers(newMarkers);

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        const bounds = new maps.LatLngBounds();
        bounds.extend(userLocation);
        newMarkers.forEach(marker => {
          if (marker && marker.getPosition()) {
            bounds.extend(marker.getPosition());
          }
        });
        map.fitBounds(bounds);
        
        // Don't zoom in too far
        const listener = maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 15) {
            map.setZoom(15);
          }
          maps.event.removeListener(listener);
        });
      }
    } catch (error) {
      console.error('Error adding provider markers:', error);
    }
  }, [map, maps, providers, userLocation, infoWindow]);

  // Expose functions to window for info window buttons
  useEffect(() => {
    window.viewProviderProfile = (providerId) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider) {
        // You can navigate to provider profile page
        console.log('View profile:', provider);
        // navigate(`/provider/${providerId}`);
      }
    };

    window.selectProviderForJob = (providerId) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider && onSelectProvider) {
        onSelectProvider(provider);
        // Close info window after selection
        if (infoWindow) {
          infoWindow.close();
        }
      }
    };
    
    return () => {
      delete window.viewProviderProfile;
      delete window.selectProviderForJob;
    };
  }, [providers, onSelectProvider, infoWindow]);

  // Re-center map on user location
  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(13);
    }
  };

  // Zoom in
  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };

  // Zoom out
  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

  // Loading state
  if (!mapsLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading Google Maps...</p>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div style={styles.errorContainer}>
        <FaMapMarkerAlt style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Location Required</h3>
        <p style={styles.errorText}>{mapError}</p>
        <button 
          style={styles.errorButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No providers state
  if (!providers || providers.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <FaWrench style={styles.emptyIcon} />
        <h3 style={styles.emptyTitle}>No Providers Found</h3>
        <p style={styles.emptyText}>
          There are no service providers in your area yet.
          Try expanding your search radius or check back later.
        </p>
      </div>
    );
  }

  // No user location state
  if (!userLocation) {
    return (
      <div style={styles.locationContainer}>
        <FaMapMarkerAlt style={styles.locationIcon} />
        <h3 style={styles.locationTitle}>Enable Location</h3>
        <p style={styles.locationText}>
          Please enable location services to see nearby providers on the map.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={styles.mapContainer}
      />

      {/* Map Controls */}
      <div style={styles.mapControls}>
        <button 
          style={styles.controlButton}
          onClick={handleRecenter}
          title="Recenter"
        >
          <FaMapMarkerAlt />
        </button>
        <button 
          style={styles.controlButton}
          onClick={handleZoomIn}
          title="Zoom in"
        >
          +
        </button>
        <button 
          style={styles.controlButton}
          onClick={handleZoomOut}
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* Provider Count Badge */}
      <div style={styles.providerCountBadge}>
        <FaBriefcase style={styles.providerCountIcon} />
        <span>
          <strong>{providers.length}</strong> provider{providers.length !== 1 ? 's' : ''} nearby
        </span>
      </div>

      {/* Selected Provider Info */}
      {selectedProvider && (
        <div style={styles.selectedProviderCard}>
          <div style={styles.selectedProviderHeader}>
            <div style={styles.selectedProviderAvatar}>
              {selectedProvider.name?.charAt(0) || 'P'}
            </div>
            <div style={styles.selectedProviderInfo}>
              <h4 style={styles.selectedProviderName}>{selectedProvider.name}</h4>
              <p style={styles.selectedProviderService}>{selectedProvider.service}</p>
            </div>
            <button 
              style={styles.closeButton}
              onClick={() => setSelectedProvider(null)}
            >
              <FaTimesCircle />
            </button>
          </div>
          <div style={styles.selectedProviderDetails}>
            <div style={styles.detailItem}>
              <FaStar style={styles.detailIcon} />
              <span>{selectedProvider.rating || 4.5} ({selectedProvider.reviews || 0} reviews)</span>
            </div>
            <div style={styles.detailItem}>
              <FaClock style={styles.detailIcon} />
              <span>{selectedProvider.experience || '2+'} years experience</span>
            </div>
            <div style={styles.detailItem}>
              <FaBriefcase style={styles.detailIcon} />
              <span>{selectedProvider.completedJobs || 0} jobs completed</span>
            </div>
            {selectedProvider.distance && (
              <div style={styles.detailItem}>
                <FaMapMarkerAlt style={styles.detailIcon} />
                <span>{selectedProvider.distance.toFixed(1)} km away</span>
              </div>
            )}
          </div>
          <button 
            style={styles.selectProviderButton}
            onClick={() => onSelectProvider && onSelectProvider(selectedProvider)}
          >
            Select This Provider
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '500px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    fontSize: '20px',
    color: '#475569',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f8fafc',
      color: '#3498db',
      transform: 'scale(1.05)',
    },
  },
  providerCountBadge: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'white',
    padding: '10px 18px',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    zIndex: 10,
    fontSize: '14px',
    color: '#0f172a',
  },
  providerCountIcon: {
    color: '#3498db',
    fontSize: '16px',
  },
  selectedProviderCard: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    border: '1px solid #e2e8f0',
    zIndex: 20,
    maxWidth: '400px',
    margin: '0 auto',
  },
  selectedProviderHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  selectedProviderAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(145deg, #3498db, #2980b9)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
  },
  selectedProviderInfo: {
    flex: 1,
  },
  selectedProviderName: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  selectedProviderService: {
    margin: 0,
    fontSize: '14px',
    color: '#3498db',
    fontWeight: '500',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    ':hover': {
      color: '#ef4444',
      background: '#f1f5f9',
    },
  },
  selectedProviderDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#475569',
  },
  detailIcon: {
    color: '#3498db',
    fontSize: '14px',
  },
  selectProviderButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(145deg, #3498db, #2980b9)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(52,152,219,0.3)',
    },
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '15px',
    margin: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    background: '#fef2f2',
    borderRadius: '16px',
    border: '1px solid #fee2e2',
    padding: '30px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#ef4444',
    marginBottom: '16px',
  },
  errorTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#991b1b',
  },
  errorText: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#b91c1c',
    maxWidth: '300px',
  },
  errorButton: {
    padding: '10px 24px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: '#dc2626',
    },
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '30px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#94a3b8',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '300px',
    lineHeight: '1.6',
  },
  locationContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    background: '#f0f9ff',
    borderRadius: '16px',
    border: '1px solid #b8e1ff',
    padding: '30px',
    textAlign: 'center',
  },
  locationIcon: {
    fontSize: '48px',
    color: '#3498db',
    marginBottom: '16px',
  },
  locationTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0369a1',
  },
  locationText: {
    margin: 0,
    fontSize: '14px',
    color: '#0284c7',
    maxWidth: '300px',
    lineHeight: '1.6',
  },
};

// Add global animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default NearbyProvidersMap;
