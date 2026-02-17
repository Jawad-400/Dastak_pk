import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaCrosshairs, FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import { useLocation } from '../context/LocationContext';
import { getPlacePredictions, getPlaceDetails } from '../Services/LocationService';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const { maps, userLocation, detectLocation, loading, savedPlaces, savePlace, removeSavedPlace } = useLocation();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  
  const mapRef = useRef(null);
  const searchTimeout = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!maps || !mapRef.current || map) return;

    const defaultLocation = selectedLocation || userLocation || { lat: 31.5204, lng: 74.3587 }; // Lahore
    
    const newMap = new maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true
    });

    const newMarker = new maps.Marker({
      map: newMap,
      position: defaultLocation,
      draggable: true,
      animation: maps.Animation.DROP
    });

    newMarker.addListener('dragend', () => {
      const position = newMarker.getPosition();
      const latLng = {
        lat: position.lat(),
        lng: position.lng()
      };
      setSelectedLocation(latLng);
      
      // Reverse geocode
      const geocoder = new maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
          if (onLocationSelect) {
            onLocationSelect({
              ...latLng,
              address: results[0].formatted_address
            });
          }
        }
      });
    });

    setMap(newMap);
    setMarker(newMarker);
  }, [maps, mapRef]);

  // Update marker position when initialLocation changes
  useEffect(() => {
    if (marker && initialLocation) {
      marker.setPosition(initialLocation);
      map?.panTo(initialLocation);
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation, marker, map]);

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (value.length > 2 && maps) {
        try {
          const results = await getPlacePredictions(value, maps);
          setPredictions(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setPredictions([]);
      }
    }, 300);
  };

  // Handle place selection
  const handlePlaceSelect = async (placeId) => {
    try {
      const place = await getPlaceDetails(placeId, maps);
      setSelectedLocation(place);
      setAddress(place.address);
      setSearchInput(place.name);
      setPredictions([]);
      
      marker?.setPosition(place);
      map?.panTo(place);
      map?.setZoom(15);
      
      if (onLocationSelect) {
        onLocationSelect(place);
      }
    } catch (error) {
      console.error('Place selection error:', error);
    }
  };

  // Handle current location
  const handleCurrentLocation = async () => {
    try {
      const location = await detectLocation();
      setSelectedLocation(location);
      
      marker?.setPosition(location);
      map?.panTo(location);
      map?.setZoom(15);
      
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Current location error:', error);
    }
  };

  // Handle saved place selection
  const handleSavedPlaceSelect = (place) => {
    setSelectedLocation(place);
    setAddress(place.address);
    
    marker?.setPosition(place);
    map?.panTo(place);
    map?.setZoom(15);
    
    if (onLocationSelect) {
      onLocationSelect(place);
    }
    setShowSaved(false);
  };

  // Toggle save place
  const handleToggleSave = () => {
    if (!selectedLocation || !address) return;
    
    const place = {
      id: `${selectedLocation.lat}_${selectedLocation.lng}`,
      ...selectedLocation,
      address,
      name: searchInput || address.split(',')[0]
    };
    
    const isSaved = savedPlaces.some(p => p.id === place.id);
    if (isSaved) {
      removeSavedPlace(place.id);
    } else {
      savePlace(place);
    }
  };

  const isSaved = selectedLocation && savedPlaces.some(p => 
    p.id === `${selectedLocation.lat}_${selectedLocation.lng}`
  );

  return (
    <div className="location-picker">
      {/* Search Bar */}
      <div className="location-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for your location..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <button 
          className="current-location-btn"
          onClick={handleCurrentLocation}
          disabled={loading}
        >
          <FaCrosshairs /> {loading ? 'Detecting...' : 'Current'}
        </button>
      </div>

      {/* Search Predictions */}
      {predictions.length > 0 && (
        <div className="search-predictions">
          {predictions.map(prediction => (
            <div
              key={prediction.place_id}
              className="prediction-item"
              onClick={() => handlePlaceSelect(prediction.place_id)}
            >
              <FaMapMarkerAlt className="prediction-icon" />
              <div className="prediction-text">
                <strong>{prediction.structured_formatting.main_text}</strong>
                <small>{prediction.structured_formatting.secondary_text}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ width: '100%', height: '400px', borderRadius: '12px' }}
      />

      {/* Location Details */}
      {selectedLocation && address && (
        <div className="location-details">
          <div className="location-address">
            <FaMapMarkerAlt className="address-icon" />
            <div className="address-text">
              <strong>Selected Location</strong>
              <p>{address}</p>
            </div>
          </div>
          <button 
            className={`save-location-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleToggleSave}
          >
            {isSaved ? <FaStar /> : <FaRegStar />}
            {isSaved ? 'Saved' : 'Save Location'}
          </button>
        </div>
      )}

      {/* Saved Places */}
      {savedPlaces.length > 0 && (
        <div className="saved-places">
          <div 
            className="saved-places-header"
            onClick={() => setShowSaved(!showSaved)}
          >
            <FaStar className="saved-icon" />
            <span>Saved Locations ({savedPlaces.length})</span>
          </div>
          
          {showSaved && (
            <div className="saved-places-list">
              {savedPlaces.map(place => (
                <div
                  key={place.id}
                  className="saved-place-item"
                  onClick={() => handleSavedPlaceSelect(place)}
                >
                  <FaMapMarkerAlt className="place-icon" />
                  <div className="place-info">
                    <strong>{place.name}</strong>
                    <small>{place.address}</small>
                  </div>
                  <button 
                    className="remove-place-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedPlace(place.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx="true">{`
        .location-picker {
          position: relative;
          width: 100%;
        }

        .location-search {
          position: relative;
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          z-index: 1;
        }

        .location-search input {
          flex: 1;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          background: white;
        }

        .location-search input:focus {
          border-color: #3498db;
          outline: none;
          box-shadow: 0 0 0 3px rgba(52,152,219,0.1);
        }

        .current-location-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .current-location-btn:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }

        .search-predictions {
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          z-index: 10;
          max-height: 300px;
          overflow-y: auto;
        }

        .prediction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f1f5f9;
        }

        .prediction-item:hover {
          background: #f8fafc;
        }

        .prediction-icon {
          color: #3498db;
          font-size: 16px;
          flex-shrink: 0;
        }

        .prediction-text {
          display: flex;
          flex-direction: column;
        }

        .prediction-text strong {
          color: #0f172a;
          font-size: 14px;
        }

        .prediction-text small {
          color: #64748b;
          font-size: 12px;
          margin-top: 2px;
        }

        .location-details {
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }

        .location-address {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .address-icon {
          color: #3498db;
          font-size: 18px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .address-text strong {
          display: block;
          color: #0f172a;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .address-text p {
          margin: 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.5;
        }

        .save-location-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .save-location-btn:hover {
          background: #f8fafc;
          border-color: #3498db;
          color: #3498db;
        }

        .save-location-btn.saved {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
        }

        .saved-places {
          margin-top: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .saved-places-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .saved-places-header:hover {
          background: #f8fafc;
        }

        .saved-icon {
          color: #f59e0b;
        }

        .saved-places-list {
          border-top: 1px solid #e2e8f0;
          max-height: 250px;
          overflow-y: auto;
        }

        .saved-place-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f1f5f9;
        }

        .saved-place-item:hover {
          background: #f8fafc;
        }

        .place-icon {
          color: #3498db;
          font-size: 14px;
          flex-shrink: 0;
        }

        .place-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .place-info strong {
          color: #0f172a;
          font-size: 14px;
        }

        .place-info small {
          color: #64748b;
          font-size: 12px;
          margin-top: 2px;
        }

        .remove-place-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .remove-place-btn:hover {
          background: #f1f5f9;
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .location-search {
            flex-direction: column;
          }

          .current-location-btn {
            padding: 12px;
            justify-content: center;
          }

          .location-details {
            flex-direction: column;
            align-items: stretch;
          }

          .save-location-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationPicker;
