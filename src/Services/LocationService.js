// Complete Google-free location service using OpenStreetMap

// Get current user location
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };
  
  // Geocode address to coordinates using OpenStreetMap Nominatim (FREE!)
  export const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=pk`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'DastakPK/1.0 (contact@dastak.pk)' // REQUIRED - identify your app
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name
        };
      }
      throw new Error('Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };
  
  // Reverse geocode coordinates to address using OpenStreetMap Nominatim (FREE!)
  export const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'DastakPK/1.0 (contact@dastak.pk)' // REQUIRED - identify your app
          }
        }
      );
      
      const data = await response.json();
      
      return {
        formattedAddress: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: data.address?.city || data.address?.town || data.address?.village || '',
        area: data.address?.suburb || data.address?.neighbourhood || '',
        road: data.address?.road || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        area: ''
      };
    }
  };
  
  export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.warn('Missing coordinates for distance calculation');
      return null;
    }
  
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // ✅ Return with 2 decimal places for km, or convert to meters for <1km
    return Math.round(distance * 100) / 100;
  };
