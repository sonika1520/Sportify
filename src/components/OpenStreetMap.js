import React from 'react';

const OpenStreetMap = ({ latitude, longitude, locationName }) => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Standard OpenStreetMap */}
        <iframe
          title="Event Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`}
          style={{ border: 0 }}
        ></iframe>

        {/* Attribution required by OpenStreetMap */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: '2px 5px',
          fontSize: '10px'
        }}>
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
        </div>
      </div>
    </div>
  );
};

export default OpenStreetMap;
