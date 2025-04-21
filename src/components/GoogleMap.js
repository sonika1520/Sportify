import React, { useState, useEffect, useRef } from 'react';

const GoogleMap = ({ latitude, longitude, apiKey, locationName }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const scriptRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Function to initialize the map
    const initMap = () => {
      if (!mapRef.current) return;

      try {
        const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

        // Create the map instance with default styling
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: location,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        // Add a standard marker for the event location
        new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: locationName || 'Event Location',
          animation: window.google.maps.Animation.DROP
        });

        // Reset error state if map loads successfully
        setMapError(false);
      } catch (error) {
        console.error('Error initializing Google Map:', error);
        setMapError(true);
      }
    };

    // Define the callback function for the Google Maps script
    window.initMap = function() {
      try {
        initMap();
      } catch (error) {
        console.error('Error in initMap callback:', error);
        setMapError(true);
      }
    };

    // Check if the script is already loaded
    if (!document.getElementById('google-maps-script') && !window.google?.maps) {
      try {
        // Create and load the script
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          console.error('Failed to load Google Maps API script');
          setMapError(true);
        };

        document.head.appendChild(script);
        scriptRef.current = script;
      } catch (error) {
        console.error('Error loading Google Maps script:', error);
        setMapError(true);
      }
    } else if (window.google?.maps) {
      // If the API is already loaded, just initialize the map
      try {
        initMap();
      } catch (error) {
        console.error('Error initializing map with existing API:', error);
        setMapError(true);
      }
    }

    // Cleanup function
    return () => {
      try {
        // Remove the global initMap function
        if (window.initMap) {
          delete window.initMap;
        }

        // Remove the script if we added it
        if (scriptRef.current && document.head.contains(scriptRef.current)) {
          document.head.removeChild(scriptRef.current);
        }
      } catch (error) {
        console.error('Error in cleanup function:', error);
      }
    };
  }, [latitude, longitude, apiKey, locationName]);

  // Fallback UI when map fails to load
  if (mapError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <span role="img" aria-label="map" style={{ fontSize: '32px' }}>🗺️</span>
        </div>
        <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>Map could not be loaded</h3>
        <p style={{ margin: '0 0 15px 0', color: '#777' }}>
          View this location on external map services:
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            Google Maps
          </a>
          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              backgroundColor: '#2196F3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative', backgroundColor: '#fff' }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        data-testid="google-map"
      />
    </div>
  );
};

export default GoogleMap;
