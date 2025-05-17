import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import '../styles/components/Map.css';

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour centrer la carte sur Fès
function SetViewOnLoad({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function Map() {
  const [axes, setAxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficLevel, setTrafficLevel] = useState('normal'); // 'light', 'normal', 'heavy'
  
  // Position centrale de Fès
  const fesPosition = [34.0331, -4.9998];
  const mapRef = useRef(null);

  useEffect(() => {
    // Charger les axes routiers depuis l'API
    const fetchAxes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/axes/');
        setAxes(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des axes:", err);
        setError("Impossible de charger les données des axes routiers");
        setLoading(false);
      }
    };

    fetchAxes();
  }, []);

  // Fonction pour déterminer la couleur d'un axe en fonction du trafic
  const getAxeColor = (axe) => {
    // Simulation de trafic basée sur le niveau global et les caractéristiques de l'axe
    if (trafficLevel === 'light') {
      return '#4CAF50'; // Vert - trafic fluide
    } else if (trafficLevel === 'normal') {
      // Mélange de vert et orange selon les axes
      return axe.id % 3 === 0 ? '#FF9800' : '#4CAF50';
    } else {
      // Trafic dense - plus d'axes en orange/rouge
      if (axe.id % 5 === 0) {
        return '#F44336'; // Rouge - trafic très dense
      } else if (axe.id % 2 === 0) {
        return '#FF9800'; // Orange - trafic modéré
      } else {
        return '#4CAF50'; // Vert - trafic fluide
      }
    }
  };

  return (
    <div className="map-container">
      {loading && (
        <div className="map-loading">
          <div>Chargement de la carte...</div>
        </div>
      )}
      
      {error && (
        <div className="map-error">
          <h3>Erreur</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      )}
      
      <MapContainer 
        center={fesPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <SetViewOnLoad center={fesPosition} zoom={13} />
        
        {axes.map((axe) => {
          if (axe.coords) {
            try {
              const coords = JSON.parse(axe.coords.replace(/'/g, '"'));
              return (
                <Polyline
                  key={axe.id}
                  positions={coords}
                  color={getAxeColor(axe)}
                  weight={5}
                  opacity={0.7}
                >
                  <Popup>
                    <div>
                      <h3>{axe.nom}</h3>
                      <p>De: {axe.point_depart}</p>
                      <p>À: {axe.point_arrivee}</p>
                    </div>
                  </Popup>
                </Polyline>
              );
            } catch (e) {
              console.error(`Erreur de parsing des coordonnées pour l'axe ${axe.id}:`, e);
              return null;
            }
          }
          return null;
        })}
      </MapContainer>
      
      <div className="map-controls">
        <h4>Niveau de trafic</h4>
        <div>
          <label>
            <input
              type="radio"
              name="traffic"
              value="light"
              checked={trafficLevel === 'light'}
              onChange={() => setTrafficLevel('light')}
            />
            Fluide
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="traffic"
              value="normal"
              checked={trafficLevel === 'normal'}
              onChange={() => setTrafficLevel('normal')}
            />
            Normal
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="traffic"
              value="heavy"
              checked={trafficLevel === 'heavy'}
              onChange={() => setTrafficLevel('heavy')}
            />
            Dense
          </label>
        </div>
      </div>
      
      <div className="map-legend">
        <h4>Légende</h4>
        <div className="map-legend-item">
          <div className="map-legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>Trafic fluide</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-color" style={{ backgroundColor: '#FF9800' }}></div>
          <span>Trafic modéré</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-color" style={{ backgroundColor: '#F44336' }}></div>
          <span>Trafic dense</span>
        </div>
      </div>
    </div>
  );
}

export default Map;
