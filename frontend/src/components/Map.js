import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/components.css';

// Création d'icônes personnalisées pour les points de départ et d'arrivée
const startIcon = L.divIcon({
  html: `
    <div style="
      width: 30px;
      height: 30px;
      background: linear-gradient(45deg, #10b981, #059669);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const endIcon = L.divIcon({
  html: `
    <div style="
      width: 30px;
      height: 30px;
      background: linear-gradient(45deg, #ef4444, #dc2626);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounce 1s infinite;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    }
  });
  return null;
}

const Map = () => {
  // Position initiale centrée sur Fès, Maroc
  const [center, setCenter] = useState([34.0333, -5.0000]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('normal'); // État pour le type de carte
  const mapRef = useRef(null);

  // Configuration des différents types de tuiles
  const tileLayers = {
    normal: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
  };

  // Fonction pour rechercher un lieu avec l'API backend
  const searchLocation = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Appel à l'API backend locale
      const response = await fetch('http://127.0.0.1:8000/api/locations/search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche. Vérifiez que le serveur backend est démarré.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sélectionner un lieu comme point de départ ou d'arrivée
  const selectLocation = (location, isStart) => {
    const coords = [location.coordinates[1], location.coordinates[0]]; // [lat, lng]
    
    if (isStart) {
      setStartPoint({
        name: location.name,
        coords: coords,
        lngLat: location.coordinates // [lng, lat] pour l'API
      });
    } else {
      setEndPoint({
        name: location.name,
        coords: coords,
        lngLat: location.coordinates // [lng, lat] pour l'API
      });
    }
    
    // Centrer la carte sur le point sélectionné
    setCenter(coords);
    
    // Effacer les résultats de recherche
    setSearchResults([]);
    setSearchQuery('');
  };

  // Fonction pour calculer l'itinéraire avec l'API backend
  const calculateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError('Veuillez sélectionner un point de départ et un point d\'arrivée.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Appel à l'API backend locale pour le calcul d'itinéraire optimisé
      const response = await fetch('http://127.0.0.1:8000/api/routes/optimize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_point: startPoint.lngLat,
          end_point: endPoint.lngLat
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transformation des coordonnées pour Leaflet (qui attend [lat, lng])
      const path = data.path.map(point => [point[1], point[0]]);
      
      setRoute({
        path: path,
        distance: data.distance,
        duration: data.duration,
        duration_text: data.duration_text
      });
      
      // Ajuster la vue de la carte pour montrer tout l'itinéraire
      if (mapRef.current) {
        const bounds = L.latLngBounds(path);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (err) {
      console.error('Erreur lors du calcul de l\'itinéraire:', err);
      setError('Erreur lors du calcul de l\'itinéraire. Vérifiez que le serveur backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour effacer les points et l'itinéraire
  const clearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
    setError(null);
  };

  // Fonction pour inverser les points de départ et d'arrivée
  const swapPoints = () => {
    if (startPoint && endPoint) {
      const temp = startPoint;
      setStartPoint(endPoint);
      setEndPoint(temp);
    }
  };

  // Fonction pour gérer le clic sur la carte
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    
    // Si le point de départ n'est pas défini, le définir
    if (!startPoint) {
      setStartPoint({
        name: `Point de départ (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        coords: [lat, lng],
        lngLat: [lng, lat]
      });
    }
    // Sinon, si le point d'arrivée n'est pas défini, le définir
    else if (!endPoint) {
      setEndPoint({
        name: `Point d'arrivée (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        coords: [lat, lng],
        lngLat: [lng, lat]
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a5b4fc 100%)',
      fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
      position: 'relative'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
          100% { transform: scale(1); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .floating-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 24px rgba(52, 99, 235, 0.08);
        }
        
        .glass-button {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      
      {/* Barre de recherche */}
      <div style={{
        display: 'flex',
        padding: '1.5rem',
        margin: '1rem',
        borderRadius: '20px',
        animation: 'slideInDown 0.6s ease-out'
      }} className="floating-card">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Rechercher un lieu (ex: Casablanca, Restaurant, Hôtel)..."
          style={{
            flex: 1,
            padding: '1rem 1.5rem',
            border: '2px solid transparent',
            borderRadius: '15px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #f8faff, #f1f5f9)',
            transition: 'all 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3498db';
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(52, 152, 219, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'transparent';
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchLocation(searchQuery);
            }
          }}
        />
        <button 
          onClick={() => searchLocation(searchQuery)}
          disabled={loading}
          style={{
            marginLeft: '1rem',
            padding: '1rem 2rem',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3498db, #2c3e50)',
            color: '#fff',
            fontWeight: '600',
            border: 'none',
            borderRadius: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {loading ? '⏳ Recherche...' : '🚀 Rechercher'}
        </button>
      </div>
      
      {/* Messages d'état */}
      {loading && (
        <div style={{
          textAlign: 'center',
          margin: '1rem',
          padding: '1rem',
          borderRadius: '15px',
          color: '#1e293b',
          fontSize: '1rem',
          fontWeight: '500',
          animation: 'fadeIn 0.4s ease'
        }} className="floating-card loading-shimmer">
          ✨ Recherche en cours...
        </div>
      )}
      
      {error && (
        <div style={{
          textAlign: 'center',
          margin: '1rem',
          padding: '1rem',
          borderRadius: '15px',
          color: '#dc2626',
          fontSize: '1rem',
          fontWeight: '500',
          animation: 'fadeIn 0.4s ease'
        }} className="floating-card">
          ❌ {error}
        </div>
      )}
      
      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '7rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '25rem',
          maxWidth: '90vw',
          borderRadius: '20px',
          maxHeight: '20rem',
          overflowY: 'auto',
          animation: 'fadeInUp 0.4s ease',
          zIndex: 1000
        }} className="floating-card">
          <h3 style={{
            margin: '1rem 1rem 0.5rem',
            color: '#1e293b',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>🎯 Résultats de recherche</h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {searchResults.map((result, index) => (
              <li key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: index < searchResults.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(52, 152, 219, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                <span style={{ fontWeight: '500', color: '#1e293b', flex: 1, marginRight: '1rem' }}>
                  {result.name}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => selectLocation(result, true)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    🚀 Départ
                  </button>
                  <button 
                    onClick={() => selectLocation(result, false)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    🎯 Arrivée
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Info points */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0 2rem 1rem',
        fontSize: '1rem',
        animation: 'fadeInUp 0.6s ease'
      }}>
        <div style={{
          padding: '1rem',
          borderRadius: '15px',
          color: '#1e293b',
          fontWeight: '500',
          flex: 1,
          marginRight: '0.5rem'
        }} className="floating-card">
          <span style={{ color: '#10b981' }}>🚀 Départ:</span> {startPoint ? startPoint.name : 'Cliquez sur la carte ou recherchez'}
        </div>
        <div style={{
          padding: '1rem',
          borderRadius: '15px',
          color: '#1e293b',
          fontWeight: '500',
          flex: 1,
          marginLeft: '0.5rem'
        }} className="floating-card">
          <span style={{ color: '#ef4444' }}>🎯 Arrivée:</span> {endPoint ? endPoint.name : 'Cliquez sur la carte ou recherchez'}
        </div>
      </div>
      
      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        margin: '0 1rem 1rem',
        animation: 'fadeInUp 0.8s ease'
      }}>
        <button 
          onClick={calculateRoute}
          disabled={!startPoint || !endPoint || loading}
          style={{
            padding: '1rem 2rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '15px',
            cursor: (!startPoint || !endPoint || loading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1rem',
            background: (!startPoint || !endPoint || loading) ? '#94a3b8' : 'linear-gradient(135deg, #3498db, #2c3e50)',
            color: '#fff'
          }}
          onMouseEnter={(e) => {
            if (startPoint && endPoint && !loading) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 30px rgba(52, 152, 219, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ⚡ Calculer l'itinéraire
        </button>
        <button 
          onClick={swapPoints}
          disabled={!startPoint || !endPoint}
          style={{
            padding: '1rem 2rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '15px',
            cursor: (!startPoint || !endPoint) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1rem',
            background: (!startPoint || !endPoint) ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff'
          }}
          onMouseEnter={(e) => {
            if (startPoint && endPoint) {
              e.target.style.transform = 'translateY(-3px) rotate(180deg)';
              e.target.style.boxShadow = '0 15px 30px rgba(245, 158, 11, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) rotate(0deg)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🔄 Inverser
        </button>
        <button 
          onClick={clearRoute}
          style={{
            padding: '1rem 2rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 30px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🗑️ Effacer
        </button>
      </div>
      
      {/* Informations sur l'itinéraire */}
      {route && (
        <div style={{
          margin: '0 1rem 1rem',
          padding: '1.5rem',
          borderRadius: '20px',
          animation: 'fadeInUp 0.6s ease'
        }} className="floating-card">
          <h3 style={{
            marginBottom: '1rem',
            color: '#1e293b',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>📊 Informations sur l'itinéraire</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <p style={{
              margin: '0.5rem 0',
              color: '#475569',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              📏 <strong>Distance:</strong> {(route.distance / 1000).toFixed(2)} km
            </p>
            <p style={{
              margin: '0.5rem 0',
              color: '#475569',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              ⏱️ <strong>Durée estimée:</strong> {route.duration_text || `${Math.floor(route.duration / 60)}m ${Math.floor(route.duration % 60)}s`}
            </p>
          </div>
        </div>
      )}
      
      {/* Carte */}
      <div style={{
        flex: 1,
        margin: '0 1rem 1rem',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(52, 99, 235, 0.08)',
        animation: 'fadeInUp 1s ease',
        position: 'relative'
      }}>
        {/* Contrôles de type de carte */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '15px',
          animation: 'fadeIn 1s ease'
        }} className="floating-card">
          <button
            onClick={() => setMapType('normal')}
            style={{
              padding: '0.75rem 1.25rem',
              background: mapType === 'normal' ? 'linear-gradient(135deg, #3498db, #2c3e50)' : 'rgba(255, 255, 255, 0.85)',
              color: mapType === 'normal' ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (mapType !== 'normal') {
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (mapType !== 'normal') {
                e.target.style.background = 'rgba(255, 255, 255, 0.85)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            🗺️ Normal
          </button>
          <button
            onClick={() => setMapType('satellite')}
            style={{
              padding: '0.75rem 1.25rem',
              background: mapType === 'satellite' ? 'linear-gradient(135deg, #3498db, #2c3e50)' : 'rgba(255, 255, 255, 0.85)',
              color: mapType === 'satellite' ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (mapType !== 'satellite') {
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (mapType !== 'satellite') {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setMapType('terrain')}
            style={{
              padding: '0.75rem 1.25rem',
              background: mapType === 'terrain' ? 'linear-gradient(135deg, #3498db, #2c3e50)' : 'rgba(255, 255, 255, 0.85)',
              color: mapType === 'terrain' ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (mapType !== 'terrain') {
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (mapType !== 'terrain') {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            ⛰️ Terrain
          </button>
        </div>
        
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            key={mapType}
            attribution={tileLayers[mapType].attribution}
            url={tileLayers[mapType].url}
          />
          
          <MapClickHandler onMapClick={handleMapClick} />
          
          {startPoint && (
            <Marker position={startPoint.coords} icon={startIcon}>
              <Popup>
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>🚀 Point de départ</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{startPoint.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {endPoint && (
            <Marker position={endPoint.coords} icon={endIcon}>
              <Popup>
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#ef4444' }}>🎯 Point d'arrivée</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{endPoint.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {route && (
            <Polyline
              positions={route.path}
              color="#3498db"
              weight={6}
              opacity={0.8}
              dashArray="10, 5"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;