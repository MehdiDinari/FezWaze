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
  const [mapType, setMapType] = useState('normal');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const mapRef = useRef(null);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width <= 1024 && width > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const coords = [location.coordinates[1], location.coordinates[0]];
    
    if (isStart) {
      setStartPoint({
        name: location.name,
        coords: coords,
        lngLat: location.coordinates
      });
    } else {
      setEndPoint({
        name: location.name,
        coords: coords,
        lngLat: location.coordinates
      });
    }
    
    setCenter(coords);
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
      const path = data.path.map(point => [point[1], point[0]]);
      
      setRoute({
        path: path,
        distance: data.distance,
        duration: data.duration,
        duration_text: data.duration_text
      });
      
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
    
    if (!startPoint) {
      setStartPoint({
        name: `Point de départ (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        coords: [lat, lng],
        lngLat: [lng, lat]
      });
    } else if (!endPoint) {
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
      position: 'relative',
      overflow: 'hidden'
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

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .mobile-stack {
            flex-direction: column !important;
          }
          
          .mobile-full-width {
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          .mobile-text-sm {
            font-size: 0.875rem !important;
          }
          
          .mobile-padding-sm {
            padding: 0.75rem !important;
          }
          
          .mobile-gap-sm {
            gap: 0.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-text-xs {
            font-size: 0.75rem !important;
          }
          
          .mobile-padding-xs {
            padding: 0.5rem !important;
          }
        }
      `}</style>
      
      {/* Barre de recherche */}
      <div style={{
        display: 'flex',
        padding: isMobile ? '0.75rem' : '1.5rem',
        margin: isMobile ? '0.5rem' : '1rem',
        borderRadius: isMobile ? '15px' : '20px',
        animation: 'slideInDown 0.6s ease-out',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '0.75rem' : '0'
      }} className="floating-card">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isMobile ? "🔍 Rechercher..." : "🔍 Rechercher un lieu (ex: Casablanca, Restaurant, Hôtel)..."}
          style={{
            flex: 1,
            padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
            border: '2px solid transparent',
            borderRadius: isMobile ? '12px' : '15px',
            fontSize: isMobile ? '0.9rem' : '1rem',
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
            marginLeft: isMobile ? '0' : '1rem',
            padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3498db, #2c3e50)',
            color: '#fff',
            fontWeight: '600',
            border: 'none',
            borderRadius: isMobile ? '12px' : '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: isMobile ? '0.9rem' : '1rem',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!loading && !isMobile) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {loading ? (isMobile ? '⏳' : '⏳ Recherche...') : (isMobile ? '🚀' : '🚀 Rechercher')}
        </button>
      </div>
      
      {/* Messages d'état */}
      {loading && (
        <div style={{
          textAlign: 'center',
          margin: isMobile ? '0.5rem' : '1rem',
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: isMobile ? '12px' : '15px',
          color: '#1e293b',
          fontSize: isMobile ? '0.9rem' : '1rem',
          fontWeight: '500',
          animation: 'fadeIn 0.4s ease'
        }} className="floating-card loading-shimmer">
          ✨ Recherche en cours...
        </div>
      )}
      
      {error && (
        <div style={{
          textAlign: 'center',
          margin: isMobile ? '0.5rem' : '1rem',
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: isMobile ? '12px' : '15px',
          color: '#dc2626',
          fontSize: isMobile ? '0.9rem' : '1rem',
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
          top: isMobile ? '6rem' : '7rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '90vw' : isTablet ? '35rem' : '25rem',
          maxWidth: '90vw',
          borderRadius: isMobile ? '15px' : '20px',
          maxHeight: isMobile ? '15rem' : '20rem',
          overflowY: 'auto',
          animation: 'fadeInUp 0.4s ease',
          zIndex: 1000
        }} className="floating-card">
          <h3 style={{
            margin: '1rem 1rem 0.5rem',
            color: '#1e293b',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '600'
          }}>🎯 Résultats de recherche</h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {searchResults.map((result, index) => (
              <li key={index} style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                padding: isMobile ? '0.75rem' : '1rem',
                borderBottom: index < searchResults.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'background 0.2s ease',
                gap: isMobile ? '0.5rem' : '1rem'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(52, 152, 219, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                <span style={{ 
                  fontWeight: '500', 
                  color: '#1e293b', 
                  flex: 1, 
                  marginRight: isMobile ? '0' : '1rem',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  marginBottom: isMobile ? '0.5rem' : '0'
                }}>
                  {result.name}
                </span>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <button 
                    onClick={() => selectLocation(result, true)}
                    style={{
                      padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      flex: isMobile ? 1 : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {isMobile ? '🚀' : '🚀 Départ'}
                  </button>
                  <button 
                    onClick={() => selectLocation(result, false)}
                    style={{
                      padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      flex: isMobile ? 1 : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {isMobile ? '🎯' : '🎯 Arrivée'}
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
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        margin: isMobile ? '0 0.5rem 0.5rem' : '0 2rem 1rem',
        fontSize: isMobile ? '0.9rem' : '1rem',
        animation: 'fadeInUp 0.6s ease',
        gap: isMobile ? '0.5rem' : '0'
      }}>
        <div style={{
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: isMobile ? '12px' : '15px',
          color: '#1e293b',
          fontWeight: '500',
          flex: 1,
          marginRight: isMobile ? '0' : '0.5rem'
        }} className="floating-card">
          <span style={{ color: '#10b981' }}>🚀 Départ:</span> {startPoint ? (isMobile && startPoint.name.length > 30 ? startPoint.name.substring(0, 30) + '...' : startPoint.name) : (isMobile ? 'Cliquez sur la carte' : 'Cliquez sur la carte ou recherchez')}
        </div>
        <div style={{
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: isMobile ? '12px' : '15px',
          color: '#1e293b',
          fontWeight: '500',
          flex: 1,
          marginLeft: isMobile ? '0' : '0.5rem'
        }} className="floating-card">
          <span style={{ color: '#ef4444' }}>🎯 Arrivée:</span> {endPoint ? (isMobile && endPoint.name.length > 30 ? endPoint.name.substring(0, 30) + '...' : endPoint.name) : (isMobile ? 'Cliquez sur la carte' : 'Cliquez sur la carte ou recherchez')}
        </div>
      </div>
      
      {/* Actions */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        gap: isMobile ? '0.5rem' : '1rem',
        margin: isMobile ? '0 0.5rem 0.5rem' : '0 1rem 1rem',
        animation: 'fadeInUp 0.8s ease'
      }}>
        <button 
          onClick={calculateRoute}
          disabled={!startPoint || !endPoint || loading}
          style={{
            padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: isMobile ? '12px' : '15px',
            cursor: (!startPoint || !endPoint || loading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: isMobile ? '0.9rem' : '1rem',
            background: (!startPoint || !endPoint || loading) ? '#94a3b8' : 'linear-gradient(135deg, #3498db, #2c3e50)',
            color: '#fff'
          }}
          onMouseEnter={(e) => {
            if (startPoint && endPoint && !loading && !isMobile) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 30px rgba(52, 152, 219, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ⚡ {isMobile ? 'Calculer' : 'Calculer l\'itinéraire'}
        </button>
        <button 
          onClick={swapPoints}
          disabled={!startPoint || !endPoint}
          style={{
            padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: isMobile ? '12px' : '15px',
            cursor: (!startPoint || !endPoint) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: isMobile ? '0.9rem' : '1rem',
            background: (!startPoint || !endPoint) ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff'
          }}
          onMouseEnter={(e) => {
            if (startPoint && endPoint && !isMobile) {
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
            padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: isMobile ? '12px' : '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: isMobile ? '0.9rem' : '1rem',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff'
          }}
          onMouseEnter={(e) => {
            if (!isMobile) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 30px rgba(239, 68, 68, 0.4)';
            }
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
          margin: isMobile ? '0 0.5rem 0.5rem' : '0 1rem 1rem',
          padding: isMobile ? '1rem' : '1.5rem',
          borderRadius: isMobile ? '15px' : '20px',
          animation: 'fadeInUp 0.6s ease'
        }} className="floating-card">
          <h3 style={{
            marginBottom: '1rem',
            color: '#1e293b',
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            fontWeight: '600'
          }}>📊 Informations sur l'itinéraire</h3>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '1rem' : '2rem', 
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <p style={{
              margin: '0.5rem 0',
              color: '#475569',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '500'
            }}>
              📏 <strong>Distance:</strong> {(route.distance / 1000).toFixed(2)} km
            </p>
            <p style={{
              margin: '0.5rem 0',
              color: '#475569',
              fontSize: isMobile ? '0.9rem' : '1rem',
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
        margin: isMobile ? '0 0.5rem 0.5rem' : '0 1rem 1rem',
        borderRadius: isMobile ? '15px' : '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(52, 99, 235, 0.08)',
        animation: 'fadeInUp 1s ease',
        position: 'relative',
        minHeight: isMobile ? '300px' : '400px'
      }}>
        {/* Contrôles de type de carte */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '0.5rem' : '1rem',
          right: isMobile ? '0.5rem' : '1rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: isMobile ? '12px' : '15px',
          animation: 'fadeIn 1s ease'
        }} className="floating-card">
          <button
            onClick={() => setMapType('normal')}
            style={{
              padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1.25rem',
              background: mapType === 'normal' ? 'linear-gradient(135deg, #3498db, #2c3e50)' : 'rgba(255, 255, 255, 0.85)',
              color: mapType === 'normal' ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.75rem' : '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (mapType !== 'normal' && !isMobile) {
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
            🗺️ {isMobile ? '' : 'Normal'}
          </button>
          <button
            onClick={() => setMapType('satellite')}
            style={{
              padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1.25rem',
              background: mapType === 'satellite' ? 'linear-gradient(135deg, #3498db, #2c3e50)' : 'rgba(255, 255, 255, 0.85)',
              color: mapType === 'satellite' ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.75rem' : '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (mapType !== 'satellite' && !isMobile) {
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
            🛰️ {isMobile ? '' : 'Satellite'}
          </button>
          <button
            onClick={() => setMapType('terrain')}
            style={{
              padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1.25rem',
              background: mapType === 'terrain' ? 'linear-gradient(135deg, #3498db, #2c3e50)' : 'rgba(255, 255, 255, 0.85)',
              color: mapType === 'terrain' ? '#fff' : '#2c3e50',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.75rem' : '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (mapType !== 'terrain' && !isMobile) {
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
            ⛰️ {isMobile ? '' : 'Terrain'}
          </button>
        </div>
        
        <MapContainer
          center={center}
          zoom={isMobile ? 12 : 13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
          touchZoom={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
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
                  <h4 style={{ margin: '0 0 0.5rem', color: '#10b981', fontSize: isMobile ? '0.9rem' : '1rem' }}>🚀 Point de départ</h4>
                  <p style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{startPoint.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {endPoint && (
            <Marker position={endPoint.coords} icon={endIcon}>
              <Popup>
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#ef4444', fontSize: isMobile ? '0.9rem' : '1rem' }}>🎯 Point d'arrivée</h4>
                  <p style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{endPoint.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {route && (
            <Polyline
              positions={route.path}
              color="#3498db"
              weight={isMobile ? 4 : 6}
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