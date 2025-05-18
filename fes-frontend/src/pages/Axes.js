import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function AxesMap() {
  const [axes, setAxes] = useState([]);
  const [selectedAxe, setSelectedAxe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Position par défaut centrée sur Fès
  const [mapCenter, setMapCenter] = useState([34.0333, -5.0000]);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/api/axes/')
      .then(response => {
        // Si vous avez besoin d'ajouter des coordonnées fictives pour démonstration
        const axesWithCoords = response.data.map(axe => ({
          ...axe,
          // Note: Ceci est juste pour la démonstration
          // Dans un cas réel, ces données devraient venir du backend
          depart_coords: getRandomCoordinates(34.0333, -5.0000, 0.02),
          arrivee_coords: getRandomCoordinates(34.0333, -5.0000, 0.02)
        }));
        setAxes(axesWithCoords);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des axes routiers:', error);
        setError('Impossible de charger les axes routiers. Veuillez réessayer plus tard.');
        setLoading(false);
      });
  }, []);

  // Fonction pour générer des coordonnées aléatoires proches d'un point
  // Dans un cas réel, vous utiliseriez des coordonnées précises
  function getRandomCoordinates(baseLat, baseLng, maxOffset) {
    return [
      baseLat + (Math.random() - 0.5) * maxOffset,
      baseLng + (Math.random() - 0.5) * maxOffset
    ];
  }

  // Quand un axe est sélectionné, centrer la carte entre le point de départ et d'arrivée
  useEffect(() => {
    if (selectedAxe) {
      const startPoint = selectedAxe.depart_coords;
      const endPoint = selectedAxe.arrivee_coords;
      const centerLat = (startPoint[0] + endPoint[0]) / 2;
      const centerLng = (startPoint[1] + endPoint[1]) / 2;
      setMapCenter([centerLat, centerLng]);
      setZoom(14); // Zoom un peu plus pour mieux voir l'axe
    }
  }, [selectedAxe]);

  const handleAxeSelect = (e) => {
    const axeId = parseInt(e.target.value);
    if (axeId) {
      const axe = axes.find(a => a.id === axeId);
      setSelectedAxe(axe);
    } else {
      setSelectedAxe(null);
      setMapCenter([34.0333, -5.0000]); // Retour à la vue par défaut
      setZoom(13);
    }
  };

  // Déterminer la couleur de la ligne en fonction du trafic
  const getLineColor = (trafic) => {
    if (!trafic) return '#3388ff'; // Bleu par défaut
    
    const traficLower = trafic.toLowerCase();
    if (traficLower.includes('fluide')) return '#4CAF50'; // Vert
    if (traficLower.includes('modéré') || traficLower.includes('modere')) return '#FFC107'; // Jaune
    if (traficLower.includes('dense')) return '#F44336'; // Rouge
    return '#3388ff'; // Bleu par défaut
  };

  if (loading) {
    return (
      <div className="axes-loading">
        <div className="spinner"></div>
        <p>Chargement des axes routiers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="axes-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="axes-map-container">
      <div className="axes-selection">
        <h2>Axes Routiers de Fès</h2>
        <div className="select-container">
          <select 
            className="axes-select" 
            onChange={handleAxeSelect} 
            value={selectedAxe ? selectedAxe.id : ''}
          >
            <option value="">Sélectionnez un axe routier</option>
            {axes.map(axe => (
              <option key={axe.id} value={axe.id}>
                {axe.nom} ({axe.point_depart} → {axe.point_arrivee})
              </option>
            ))}
          </select>
          <div className="select-arrow"></div>
        </div>
        
        {selectedAxe && (
          <div className="selected-axe-info">
            <h3>{selectedAxe.nom}</h3>
            <div className="axe-detail">
              <span className="detail-label">De:</span> 
              <span className="detail-value">{selectedAxe.point_depart}</span>
            </div>
            <div className="axe-detail">
              <span className="detail-label">À:</span> 
              <span className="detail-value">{selectedAxe.point_arrivee}</span>
            </div>
            <div className="axe-detail">
              <span className="detail-label">Distance:</span> 
              <span className="detail-value">{selectedAxe.distance_km} km</span>
            </div>
            {selectedAxe.duree && (
              <div className="axe-detail">
                <span className="detail-label">Durée estimée:</span> 
                <span className="detail-value">{selectedAxe.duree} min</span>
              </div>
            )}
            {selectedAxe.trafic && (
              <div className="axe-detail">
                <span className="detail-label">Trafic actuel:</span> 
                <span className={`trafic-badge trafic-${selectedAxe.trafic.toLowerCase()}`}>
                  {selectedAxe.trafic}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="map-container">
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '500px', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}-${zoom}`} // Force re-render on center/zoom change
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {selectedAxe && (
            <>
              <Marker position={selectedAxe.depart_coords}>
                <Popup>
                  <strong>Départ:</strong> {selectedAxe.point_depart}
                </Popup>
              </Marker>
              <Marker position={selectedAxe.arrivee_coords}>
                <Popup>
                  <strong>Arrivée:</strong> {selectedAxe.point_arrivee}
                </Popup>
              </Marker>
              <Polyline 
                positions={[selectedAxe.depart_coords, selectedAxe.arrivee_coords]} 
                color={getLineColor(selectedAxe.trafic)}
                weight={5}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

// Ajout du CSS
const styles = `
<style>
  .axes-map-container {
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .axes-selection {
    margin-bottom: 20px;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .axes-selection h2 {
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: 600;
    font-size: 24px;
  }
  
  .select-container {
    position: relative;
    margin-bottom: 20px;
  }
  
  .axes-select {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .axes-select:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
  
  .select-arrow {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #555;
    pointer-events: none;
  }
  
  .selected-axe-info {
    background-color: #f5f8fa;
    border-radius: 8px;
    padding: 15px;
    margin-top: 10px;
    border-left: 5px solid #4a90e2;
  }
  
  .selected-axe-info h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 18px;
    font-weight: 600;
  }
  
  .axe-detail {
    display: flex;
    margin-bottom: 8px;
    font-size: 15px;
  }
  
  .detail-label {
    min-width: 120px;
    font-weight: 600;
    color: #555;
  }
  
  .detail-value {
    color: #2c3e50;
  }
  
  .trafic-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: white;
  }
  
  .trafic-fluide {
    background-color: #4CAF50;
  }
  
  .trafic-modéré, .trafic-modere {
    background-color: #FFC107;
    color: #333;
  }
  
  .trafic-dense {
    background-color: #F44336;
  }
  
  .map-container {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    height: 500px;
  }
  
  .axes-loading, .axes-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
  }
  
  .spinner {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-icon {
    font-size: 40px;
    margin-bottom: 15px;
  }
  
  .axes-error button {
    margin-top: 15px;
    padding: 8px 20px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
  }
  
  .axes-error button:hover {
    background-color: #3a7bc8;
  }
  
  @media (min-width: 768px) {
    .axes-map-container {
      flex-direction: row;
      gap: 20px;
    }
    
    .axes-selection {
      flex: 1;
      max-width: 35%;
    }
    
    .map-container {
      flex: 2;
    }
  }
</style>
`;

export default function AxesMapWithStyles() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: styles }} />
      <AxesMap />
    </>
  );
}