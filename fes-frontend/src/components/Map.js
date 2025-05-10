import { useEffect, useState } from 'react';

function Map() {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    setMapUrl('http://localhost:8000/api/carte_axes/');
  }, []);

  return (
    <div>
      <h2>Carte des Axes Routiers de Fès</h2>
      {mapUrl && (
        <iframe
          src={mapUrl}
          title="Carte des Axes"
          style={{ width: '100%', height: '600px', border: 'none', marginTop: '20px' }}
        />
      )}
    </div>
  );
}

export default Map;
