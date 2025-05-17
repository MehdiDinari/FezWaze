import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ApiService from '../services/ApiService';
import '../styles/components/ItineraireMap.css';

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

// Composant pour l'animation de la voiture
function CarMarker({ positions }) {
  const [position, setPosition] = useState(positions[0]);
  const [positionIndex, setPositionIndex] = useState(0);
  const map = useMap();

  useEffect(() => {
    if (positions.length <= 1) return;

    const interval = setInterval(() => {
      setPositionIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= positions.length) {
          clearInterval(interval);
          return prevIndex;
        }
        setPosition(positions[nextIndex]);
        return nextIndex;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [positions, map]);

  const carIcon = L.divIcon({
    html: '<div class="car-icon">🚗</div>',
    className: 'car-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  return position ? <Marker position={position} icon={carIcon} /> : null;
}

function ItineraireMap() {
  const { itineraireId } = useParams();
  const [itineraire, setItineraire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPositions, setAllPositions] = useState([]);
  
  // Position centrale de Fès
  const fesPosition = [34.0331, -4.9998];

  useEffect(() => {
    const fetchItineraire = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getItineraire(itineraireId);
        setItineraire(data);
        
        // Extraire toutes les positions pour l'animation
        const positions = [];
        if (data.axes) {
          data.axes.forEach(axe => {
            if (axe.coords) {
              try {
                const coords = JSON.parse(axe.coords.replace(/'/g, '"'));
                positions.push(...coords);
              } catch (e) {
                console.error(`Erreur de parsing des coordonnées pour l'axe ${axe.id}:`, e);
              }
            }
          });
        }
        setAllPositions(positions);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement de l'itinéraire:", err);
        setError("Impossible de charger les données de l'itinéraire");
        setLoading(false);
      }
    };

    fetchItineraire();
  }, [itineraireId]);

  // Fonction pour déterminer la couleur d'un axe en fonction du trafic
  const getAxeColor = (axe) => {
    const trafic = axe.trafic || 'fluide';
    
    if (trafic === 'dense') {
      return '#F44336'; // Rouge
    } else if (trafic === 'modéré') {
      return '#FF9800'; // Orange
    } else {
      return '#4CAF50'; // Vert
    }
  };

  return (
    <div className="itineraire-map-container">
      <div className="itineraire-map-header">
        <h2>Visualisation de l'itinéraire</h2>
        {itineraire && (
          <div className="itineraire-info">
            <p>De <strong>{itineraire.point_depart}</strong> à <strong>{itineraire.point_arrivee}</strong></p>
            <p>Temps estimé: <strong>{itineraire.temps_total_min || itineraire.temps_estime || '25'} minutes</strong></p>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="itineraire-map-loading">
          <div>Chargement de l'itinéraire...</div>
        </div>
      )}
      
      {error && (
        <div className="itineraire-map-error">
          <h3>Erreur</h3>
          <p>{error}</p>
          <Link to="/itineraire_form" className="btn btn-primary">
            Retour au formulaire
          </Link>
        </div>
      )}
      
      <div className="map-container">
        <MapContainer 
          center={fesPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <SetViewOnLoad center={fesPosition} zoom={13} />
          
          {itineraire && itineraire.axes && itineraire.axes.map((axe) => {
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
                        <p>Trafic: {axe.trafic || 'fluide'}</p>
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
          
          {/* Marqueurs pour le point de départ et d'arrivée */}
          {allPositions.length > 0 && (
            <>
              <Marker position={allPositions[0]}>
                <Popup>
                  <strong>Départ:</strong> {itineraire?.point_depart}
                </Popup>
              </Marker>
              
              <Marker position={allPositions[allPositions.length - 1]}>
                <Popup>
                  <strong>Arrivée:</strong> {itineraire?.point_arrivee}
                </Popup>
              </Marker>
              
              {/* Animation de la voiture */}
              <CarMarker positions={allPositions} />
            </>
          )}
        </MapContainer>
      </div>
      
      <div className="itineraire-map-legend">
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
      
      <div className="itineraire-map-actions">
        <Link to="/itineraire_form" className="btn btn-secondary">
          Retour au formulaire
        </Link>
        <Link to="/map" className="btn btn-primary">
          Voir la carte complète
        </Link>
      </div>
    </div>
  );
}

export default ItineraireMap;
