import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ItineraireMap() {
  const { itineraireId } = useParams();
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    if (itineraireId) {
      setMapUrl(`http://localhost:8000/api/itineraire_carte/${itineraireId}/`);
    }
  }, [itineraireId]);

  return (
    <div>
      <h2>Carte de l'Itinéraire</h2>
      {mapUrl && (
        <iframe
          src={mapUrl}
          title="Carte Itinéraire"
          style={{ width: '100%', height: '600px', border: 'none', marginTop: '20px' }}
        />
      )}
    </div>
  );
}

export default ItineraireMap;
