import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentLocation, reverseGeocode } from '../Services/LocationService';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detect user location
  const detectLocation = async () => {
    setLoading(true);
    setLocationError(null);
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Reverse geocode to get address
      try {
        const address = await reverseGeocode(location.lat, location.lng);
        setUserAddress(address.formattedAddress);
        localStorage.setItem('userLocation', JSON.stringify({
          ...location,
          address: address.formattedAddress
        }));
      } catch (geocodeError) {
        // Still save location even if geocoding fails
        setUserAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        localStorage.setItem('userLocation', JSON.stringify({
          ...location,
          address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
        }));
      }
      
      setLoading(false);
      return location;
    } catch (error) {
      console.error('Location detection failed:', error);
      
      let errorMessage = 'Could not detect your location. ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out.';
          break;
        default:
          errorMessage += 'Please try again.';
      }
      
      setLocationError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const loc = JSON.parse(savedLocation);
        setUserLocation({ lat: loc.lat, lng: loc.lng });
        setUserAddress(loc.address || `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }
  }, []);

  return (
    <LocationContext.Provider value={{
      userLocation,
      userAddress,
      locationError,
      loading,
      detectLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};