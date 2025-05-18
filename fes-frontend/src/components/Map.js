import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
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

// Icônes personnalisées
const startIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const locationIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour centrer la carte
function CenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

function Map() {
  const [axes, setAxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficLevel, setTrafficLevel] = useState('normal'); // 'light', 'normal', 'heavy'
  
  // États pour les points sélectionnés
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [selectingPoint, setSelectingPoint] = useState('none'); // 'none', 'start', 'end'
  const [routePath, setRoutePath] = useState(null);
  const [timeEstimate, setTimeEstimate] = useState(null);
  const [distance, setDistance] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeSegments, setRouteSegments] = useState([]);
  
  // Position centrale de Fès et réf de carte
  const fesPosition = [34.0331, -4.9998];
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(fesPosition);
  const [mapZoom, setMapZoom] = useState(13);
  
  // État pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Préparer un graphe de réseau routier
  const [roadNetwork, setRoadNetwork] = useState({
    nodes: {}, // Points d'intersections et extrémités
    edges: {}  // Segments de routes
  });

  // Fonction pour parser les coordonnées quel que soit leur format
  const parseCoordinates = (coordsString) => {
    if (!coordsString) return null;
    
    // Essayons d'abord un JSON parse standard
    try {
      return JSON.parse(coordsString);
    } catch (e) {
      // Ce n'est pas un JSON valide, essayons de parser manuellement
      try {
        // Enlever les caractères inutiles et extraire les nombres
        const cleanString = coordsString
          .replace(/\[/g, '')
          .replace(/\]/g, '')
          .replace(/\(/g, '')
          .replace(/\)/g, '')
          .replace(/'/g, '')
          .replace(/"/g, '');
        
        // Diviser en paires de coordonnées
        const pairs = cleanString.split(',');
        const result = [];
        
        // Traiter par paire (longitude, latitude)
        for (let i = 0; i < pairs.length; i += 2) {
          if (pairs[i] && pairs[i+1]) {
            const lng = parseFloat(pairs[i].trim());
            const lat = parseFloat(pairs[i+1].trim());
            if (!isNaN(lng) && !isNaN(lat)) {
              // Leaflet utilise [lat, lng], donc inversons l'ordre
              result.push([lat, lng]);
            }
          }
        }
        
        // Si on a au moins deux points, on peut tracer une ligne
        if (result.length >= 2) {
          return result;
        }
      } catch (error) {
        console.error("Erreur lors du parsing manuel des coordonnées:", error);
      }
    }
    
    // Si tout échoue, générer un chemin aléatoire pour la démonstration
    return generateRandomPath(fesPosition[0], fesPosition[1], 0.02, 5);
  };

  useEffect(() => {
    // Charger les axes routiers depuis l'API
    const fetchAxes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/api/axes/');
        
        // Traiter chaque axe pour s'assurer que les coordonnées sont exploitables
        const processedAxes = response.data.map(axe => {
          // Si l'axe a des coordonnées, essayer de les parser
          if (axe.coords) {
            try {
              const parsedCoords = parseCoordinates(axe.coords);
              return {
                ...axe,
                parsedCoords: parsedCoords
              };
            } catch (e) {
              console.error(`Erreur lors du parsing des coordonnées pour l'axe ${axe.id}:`, e);
              // En cas d'erreur, générer des coordonnées fictives
              return {
                ...axe,
                parsedCoords: generateRandomPath(fesPosition[0], fesPosition[1], 0.02, 5)
              };
            }
          } else {
            // Si pas de coordonnées, en générer
            return {
              ...axe,
              parsedCoords: generateRandomPath(fesPosition[0], fesPosition[1], 0.02, 5)
            };
          }
        });
        
        setAxes(processedAxes);
        
        // Construire le réseau routier pour le calcul d'itinéraire
        buildRoadNetwork(processedAxes);
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des axes:", err);
        setError("Impossible de charger les données des axes routiers");
        setLoading(false);
      }
    };

    fetchAxes();
  }, []);

  // Fonction pour obtenir la géolocalisation de l'utilisateur
  const getCurrentLocation = () => {
    // Vérifier si la géolocalisation est disponible dans le navigateur
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas prise en charge par votre navigateur");
      return;
    }
    
    setLocating(true);
    setLocationError(null);
    
    // Demander la position actuelle
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(15); // Zoomer sur la position de l'utilisateur
        setLocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        setLocationError("Impossible d'obtenir votre position actuelle");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Fonction pour utiliser la position actuelle comme point de départ
  const useLocationAsStart = () => {
    if (userLocation) {
      setStartPoint(userLocation);
    } else {
      getCurrentLocation();
      // On définira le point de départ une fois que la position sera obtenue
    }
  };

  // Utiliser la position comme point de départ quand elle est obtenue
  useEffect(() => {
    if (userLocation && locating === false) {
      if (selectingPoint === 'start') {
        setStartPoint(userLocation);
        setSelectingPoint('none');
      }
    }
  }, [userLocation, locating, selectingPoint]);

  // Fonction pour construire un graphe de réseau routier à partir des axes
  const buildRoadNetwork = (axesArray) => {
    const nodes = {};
    const edges = {};
    let nodeCounter = 0;
    
    axesArray.forEach(axe => {
      if (!axe.parsedCoords || axe.parsedCoords.length < 2) return;
      
      const coords = axe.parsedCoords;
      
      // Ajouter chaque point comme un nœud, avec une vérification pour les doublons
      coords.forEach((coord, i) => {
        // Créer une clé unique pour ce point
        const coordKey = `${coord[0].toFixed(6)}_${coord[1].toFixed(6)}`;
        
        // Si ce nœud n'existe pas encore, l'ajouter
        if (!nodes[coordKey]) {
          nodes[coordKey] = {
            id: nodeCounter++,
            coords: coord,
            connections: []
          };
        }
        
        // Ajouter les connexions pour les segments d'axe
        if (i < coords.length - 1) {
          const nextCoord = coords[i + 1];
          const nextCoordKey = `${nextCoord[0].toFixed(6)}_${nextCoord[1].toFixed(6)}`;
          
          // Créer le nœud suivant s'il n'existe pas
          if (!nodes[nextCoordKey]) {
            nodes[nextCoordKey] = {
              id: nodeCounter++,
              coords: nextCoord,
              connections: []
            };
          }
          
          // Créer un identifiant pour ce segment d'axe
          const edgeId1 = `${coordKey}_${nextCoordKey}`;
          
          // Calculer la distance pour ce segment
          const segmentDistance = calculateDistance(
            coord[0], coord[1], nextCoord[0], nextCoord[1]
          );
          
          // Ajouter ce segment comme une arête dans le graphe
          edges[edgeId1] = {
            from: coordKey,
            to: nextCoordKey,
            distance: segmentDistance,
            axeId: axe.id,
            axeName: axe.nom || `Axe ${axe.id}`,
            trafficLevel: axe.trafic || 'normal'
          };
          
          // Ajouter les connexions bidirectionnelles
          nodes[coordKey].connections.push(nextCoordKey);
          nodes[nextCoordKey].connections.push(coordKey);
        }
      });
    });
    
    setRoadNetwork({ nodes, edges });
  };

  // Fonction pour générer un chemin aléatoire (pour la démonstration)
  const generateRandomPath = (baseLat, baseLng, maxOffset, numPoints) => {
    const path = [];
    let currentLat = baseLat + (Math.random() - 0.5) * maxOffset * 0.5;
    let currentLng = baseLng + (Math.random() - 0.5) * maxOffset * 0.5;
    
    path.push([currentLat, currentLng]);
    
    for (let i = 1; i < numPoints; i++) {
      // Léger décalage par rapport au point précédent pour créer un chemin réaliste
      currentLat += (Math.random() - 0.5) * maxOffset * 0.3;
      currentLng += (Math.random() - 0.5) * maxOffset * 0.3;
      path.push([currentLat, currentLng]);
    }
    
    return path;
  };

  // Fonction pour gérer les clics sur la carte
  const handleMapClick = (latlng) => {
    if (selectingPoint === 'start') {
      setStartPoint(latlng);
      setSelectingPoint('none');
    } else if (selectingPoint === 'end') {
      setEndPoint(latlng);
      setSelectingPoint('none');
    }
  };

  // Fonctions pour commencer à sélectionner le départ ou la destination
  const startSelectingStart = () => {
    setSelectingPoint('start');
  };

  const startSelectingEnd = () => {
    setSelectingPoint('end');
  };

  // Fonction pour trouver le point le plus proche sur un axe routier
  const findClosestPointOnRoad = (point) => {
    let closestNodeKey = null;
    let minDistance = Infinity;
    
    // Parcourir tous les nœuds du réseau routier
    Object.keys(roadNetwork.nodes).forEach(nodeKey => {
      const node = roadNetwork.nodes[nodeKey];
      
      // Calculer la distance entre le point cliqué et ce nœud
      const dist = calculateDistance(
        point.lat, point.lng,
        node.coords[0], node.coords[1]
      );
      
      // Mettre à jour si c'est le point le plus proche trouvé jusqu'à présent
      if (dist < minDistance) {
        minDistance = dist;
        closestNodeKey = nodeKey;
      }
    });
    
    // Vérifier si on a trouvé un nœud assez proche
    if (closestNodeKey && minDistance < 1) { // Distance de 1km max
      return {
        nodeKey: closestNodeKey,
        node: roadNetwork.nodes[closestNodeKey],
        distance: minDistance
      };
    }
    
    return null;
  };

  // Algorithme de Dijkstra pour trouver le chemin le plus court
  const findShortestPath = (startNodeKey, endNodeKey) => {
    // Si les nœuds de départ ou d'arrivée n'existent pas, retourner null
    if (!roadNetwork.nodes[startNodeKey] || !roadNetwork.nodes[endNodeKey]) {
      return null;
    }
    
    // Liste des nœuds à visiter avec leur distance actuelle
    const toVisit = {};
    // Liste des nœuds déjà visités
    const visited = {};
    // Chemin pour atteindre chaque nœud
    const paths = {};
    // Coût pour atteindre chaque nœud
    const costs = {};
    
    // Initialiser le nœud de départ
    toVisit[startNodeKey] = true;
    costs[startNodeKey] = 0;
    paths[startNodeKey] = [startNodeKey];
    
    // Tant qu'il reste des nœuds à visiter
    while (Object.keys(toVisit).length > 0) {
      // Trouver le nœud avec le coût le plus faible parmi ceux à visiter
      let currentNodeKey = null;
      let minCost = Infinity;
      
      Object.keys(toVisit).forEach(nodeKey => {
        if (costs[nodeKey] < minCost) {
          minCost = costs[nodeKey];
          currentNodeKey = nodeKey;
        }
      });
      
      // Si aucun nœud trouvé ou si on a atteint le nœud d'arrivée, sortir de la boucle
      if (currentNodeKey === null || currentNodeKey === endNodeKey) {
        break;
      }
      
      // Marquer ce nœud comme visité et le retirer de la liste à visiter
      delete toVisit[currentNodeKey];
      visited[currentNodeKey] = true;
      
      // Obtenir le nœud actuel
      const currentNode = roadNetwork.nodes[currentNodeKey];
      
      // Vérifier chaque connexion de ce nœud
      currentNode.connections.forEach(neighborKey => {
        // Si ce voisin a déjà été visité, passer au suivant
        if (visited[neighborKey]) return;
        
        // Trouver l'arête entre ces deux nœuds
        const edgeId1 = `${currentNodeKey}_${neighborKey}`;
        const edgeId2 = `${neighborKey}_${currentNodeKey}`;
        const edge = roadNetwork.edges[edgeId1] || roadNetwork.edges[edgeId2];
        
        if (!edge) return;
        
        // Calculer le facteur de trafic pour cette arête
        const trafficFactor = getTrafficFactor(edge.trafficLevel || 'normal', trafficLevel);
        
        // Calculer le coût avec le facteur de trafic
        const cost = costs[currentNodeKey] + (edge.distance * trafficFactor);
        
        // Si c'est un nouveau nœud ou si le coût est inférieur au coût précédent
        if (costs[neighborKey] === undefined || cost < costs[neighborKey]) {
          costs[neighborKey] = cost;
          
          // Mettre à jour le chemin pour atteindre ce nœud
          paths[neighborKey] = [...paths[currentNodeKey], neighborKey];
          
          // Ajouter ce nœud à la liste des nœuds à visiter
          toVisit[neighborKey] = true;
        }
      });
    }
    
    // Récupérer le chemin final si on a pu atteindre le nœud d'arrivée
    if (paths[endNodeKey]) {
      // Convertir les clés de nœuds en coordonnées
      const pathCoords = paths[endNodeKey].map(nodeKey => 
        roadNetwork.nodes[nodeKey].coords
      );
      
      // Calculer le coût total du chemin
      const totalCost = costs[endNodeKey];
      
      // Récupérer les segments de route utilisés pour le chemin
      const segments = [];
      for (let i = 0; i < paths[endNodeKey].length - 1; i++) {
        const fromKey = paths[endNodeKey][i];
        const toKey = paths[endNodeKey][i + 1];
        
        const edgeId1 = `${fromKey}_${toKey}`;
        const edgeId2 = `${toKey}_${fromKey}`;
        const edge = roadNetwork.edges[edgeId1] || roadNetwork.edges[edgeId2];
        
        if (edge) {
          segments.push(edge);
        }
      }
      
      return {
        path: pathCoords,
        cost: totalCost,
        segments: segments
      };
    }
    
    return null;
  };

  // Fonction pour obtenir le facteur de trafic basé sur le niveau de trafic
  const getTrafficFactor = (edgeTraffic, globalTraffic) => {
    // Pour un calcul plus précis, on pourrait combiner le trafic de l'arête et le niveau global
    
    // Si on a des données spécifiques pour cette arête, les utiliser
    if (edgeTraffic && edgeTraffic !== 'normal') {
      if (edgeTraffic === 'fluide' || edgeTraffic === 'light') return 0.8;
      if (edgeTraffic === 'dense' || edgeTraffic === 'heavy') return 1.5;
      return 1.0;
    }
    
    // Sinon, utiliser le niveau global de trafic
    if (globalTraffic === 'light') return 0.8;  // Trafic fluide, plus rapide
    if (globalTraffic === 'heavy') return 1.5;  // Trafic dense, plus lent
    return 1.0; // Trafic normal
  };

  // Fonction pour calculer l'itinéraire
  const calculateRoute = async () => {
    if (!startPoint || !endPoint) {
      alert('Veuillez sélectionner un point de départ et d\'arrivée');
      return;
    }

    setCalculatingRoute(true);
    setRoutePath(null);
    setTimeEstimate(null);
    setDistance(null);
    setRouteSegments([]);

    try {
      // Trouver les points les plus proches sur le réseau routier
      const startRoad = findClosestPointOnRoad(startPoint);
      const endRoad = findClosestPointOnRoad(endPoint);
      
      if (!startRoad || !endRoad) {
        throw new Error('Impossible de trouver de routes à proximité des points sélectionnés');
      }
      
      // Simulation d'un temps d'attente pour le calcul
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculer l'itinéraire en utilisant l'algorithme de Dijkstra
      const result = findShortestPath(startRoad.nodeKey, endRoad.nodeKey);
      
      if (!result) {
        throw new Error('Impossible de trouver un itinéraire entre ces deux points');
      }
      
      // Construire le chemin complet en incluant les points de départ et d'arrivée exacts
      const completePath = [
        [startPoint.lat, startPoint.lng],
        ...result.path,
        [endPoint.lat, endPoint.lng]
      ];
      
      // Calculer la distance totale
      let totalDistance = calculateDistance(
        startPoint.lat, startPoint.lng,
        result.path[0][0], result.path[0][1]
      );
      
      for (let i = 0; i < result.path.length - 1; i++) {
        totalDistance += calculateDistance(
          result.path[i][0], result.path[i][1],
          result.path[i+1][0], result.path[i+1][1]
        );
      }
      
      totalDistance += calculateDistance(
        result.path[result.path.length - 1][0], result.path[result.path.length - 1][1],
        endPoint.lat, endPoint.lng
      );
      
      // Estimation du temps basée sur la distance et le niveau de trafic
      // Pour une voiture, on considère une vitesse moyenne de 50 km/h en ville
      const speedFactor = trafficLevel === 'light' ? 1.2 : trafficLevel === 'heavy' ? 0.7 : 1;
      const estimatedTime = Math.round((totalDistance / 50) * 60 / speedFactor);
      
      setRoutePath(completePath);
      setDistance(totalDistance.toFixed(2));
      setTimeEstimate(estimatedTime);
      setRouteSegments(result.segments);
      
    } catch (err) {
      console.error("Erreur lors du calcul de l'itinéraire:", err);
      alert("Erreur: " + err.message);
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Fonction pour calculer la distance approximative entre deux points (formule de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en km
    return distance;
  };

  // Fonction pour réinitialiser l'itinéraire
  const resetRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoutePath(null);
    setTimeEstimate(null);
    setDistance(null);
    setRouteSegments([]);
    setSelectingPoint('none');
  };

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
      
      <div className="route-selection-panel">
        <h3>Planifier un trajet en voiture</h3>
        
        {/* Bouton de géolocalisation */}
        <div className="geolocation-section">
          <button 
            className={`geolocation-button ${userLocation ? 'located' : ''}`} 
            onClick={getCurrentLocation}
            disabled={locating}
          >
            {locating ? 'Localisation...' : userLocation ? 'Position trouvée' : 'Me localiser'}
            <span className="location-icon">📍</span>
          </button>
          
          {locationError && (
            <div className="location-error">
              {locationError}
            </div>
          )}
          
          {userLocation && (
            <button 
              className="use-location-button" 
              onClick={useLocationAsStart}
            >
              Utiliser comme point de départ
            </button>
          )}
        </div>
        
        <div className="selection-buttons">
          <button 
            className={`select-button ${selectingPoint === 'start' ? 'active' : ''} ${startPoint ? 'selected' : ''}`} 
            onClick={startSelectingStart}
          >
            {startPoint ? 'Modifier le départ' : 'Choisir le départ'}
          </button>
          <button 
            className={`select-button ${selectingPoint === 'end' ? 'active' : ''} ${endPoint ? 'selected' : ''}`} 
            onClick={startSelectingEnd}
          >
            {endPoint ? 'Modifier l\'arrivée' : 'Choisir l\'arrivée'}
          </button>
        </div>
        
        {selectingPoint !== 'none' && (
          <div className="selection-instructions">
            Cliquez sur la carte pour sélectionner le point {selectingPoint === 'start' ? 'de départ' : 'd\'arrivée'}
          </div>
        )}
        
        {startPoint && endPoint && (
          <div className="route-actions">
            <button 
              className="calculate-button" 
              onClick={calculateRoute}
              disabled={calculatingRoute}
            >
              {calculatingRoute ? 'Calcul en cours...' : 'Calculer l\'itinéraire'}
            </button>
            <button className="reset-button" onClick={resetRoute}>
              Réinitialiser
            </button>
          </div>
        )}
        
        {timeEstimate && (
          <div className="route-result">
            <h4>Résultat</h4>
            <div className="car-icon-container">
              <div className="car-icon">🚗</div>
            </div>
            <div className="result-item">
              <strong>Distance:</strong> {distance} km
            </div>
            <div className="result-item">
              <strong>Temps estimé:</strong> {timeEstimate} min
            </div>
            <div className="result-item">
              <strong>Trafic:</strong> {
                trafficLevel === 'light' ? 'Fluide' : 
                trafficLevel === 'normal' ? 'Normal' : 'Dense'
              }
            </div>
            {routeSegments.length > 0 && (
              <div className="route-segments">
                <details>
                  <summary>Axes empruntés</summary>
                  <ul className="segment-list">
                    {routeSegments.map((segment, index) => (
                      <li key={index} className="segment-item">
                        <span>{segment.axeName || `Segment ${index + 1}`}</span>
                        <span className={`traffic-indicator traffic-${segment.trafficLevel || 'normal'}`}></span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
      
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <CenterMap center={mapCenter} zoom={mapZoom} />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Affichage des axes de la ville */}
        {axes.map((axe) => {
          if (axe.parsedCoords && axe.parsedCoords.length >= 2) {
            return (
              <Polyline
                key={axe.id}
                positions={axe.parsedCoords}
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
          }
          return null;
        })}
        
        {/* Affichage de la position de l'utilisateur */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={locationIcon}>
            <Popup>
              <div>
                <h3>Votre position</h3>
                <p>Latitude: {userLocation.lat.toFixed(6)}</p>
                <p>Longitude: {userLocation.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Affichage des marqueurs de départ et d'arrivée */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
            <Popup>Point de départ</Popup>
          </Marker>
        )}
        
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon}>
            <Popup>Point d'arrivée</Popup>
          </Marker>
        )}
        
        {/* Affichage de l'itinéraire calculé */}
        {routePath && (
          <>
            {/* Ligne principale de l'itinéraire */}
            <Polyline 
              positions={routePath} 
              color="#0066CC" 
              weight={6} 
              opacity={0.8}
              dashArray="1, 0"
            />
            
            {/* Effet de bordure pour rendre l'itinéraire plus visible */}
            <Polyline
              positions={routePath}
              color="#FFFFFF"
              weight={10}
              opacity={0.4}
              dashArray="0, 0"
            />
            
            {/* Symbole de voiture au milieu de l'itinéraire */}
            {routePath.length > 0 && (
              <Marker 
                position={routePath[Math.floor(routePath.length / 2)]} 
                icon={carIcon}
              >
                <Popup>Trajet en voiture</Popup>
              </Marker>
            )}
          </>
        )}
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
        <div className="map-legend-item">
          <div className="map-legend-color" style={{ backgroundColor: '#0066CC' }}></div>
          <span>Itinéraire voiture</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-color" style={{ backgroundColor: '#9C27B0' }}></div>
          <span>Votre position</span>
        </div>
      </div>
      
      <style jsx>{`
        .route-selection-panel {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          max-width: 300px;
        }
        
        .route-selection-panel h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 18px;
          color: #333;
        }
        
        /* Style pour la section de géolocalisation */
        .geolocation-section {
          margin-bottom: 15px;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid #9C27B0;
        }
        
        .geolocation-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 5px;
          background-color: #9C27B0;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .geolocation-button:hover {
          background-color: #7B1FA2;
        }
        
        .geolocation-button:disabled {
          background-color: #E1BEE7;
          cursor: not-allowed;
        }
        
        .geolocation-button.located {
          background-color: #4CAF50;
        }
        
        .location-icon {
          margin-left: 8px;
          font-size: 16px;
        }
        
        .location-error {
          margin-top: 5px;
          color: #f44336;
          font-size: 12px;
        }
        
        .use-location-button {
          margin-top: 8px;
          width: 100%;
          padding: 8px;
          border: none;
          border-radius: 4px;
          background-color: #4CAF50;
          color: white;
          cursor: pointer;
          font-size: 13px;
        }
        
        .use-location-button:hover {
          background-color: #388E3C;
        }
        
        .selection-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .select-button {
          padding: 10px;
          border: none;
          border-radius: 5px;
          background-color: #f0f0f0;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .select-button:hover {
          background-color: #e0e0e0;
        }
        
        .select-button.active {
          background-color: #4CAF50;
          color: white;
        }
        
        .select-button.selected {
          border-left: 4px solid #2196F3;
        }
        
        .selection-instructions {
          margin: 10px 0;
          padding: 8px;
          background-color: #f9f9f9;
          border-left: 3px solid #2196F3;
          font-size: 14px;
        }
        
        .route-actions {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .calculate-button {
          padding: 10px;
          background-color: #2196F3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .calculate-button:hover {
          background-color: #0b7dda;
        }
        
        .calculate-button:disabled {
          background-color: #b0b0b0;
          cursor: not-allowed;
        }
        
        .reset-button {
          padding: 8px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover {
          background-color: #d32f2f;
        }
        
        .route-result {
          margin-top: 15px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        
        .route-result h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
          text-align: center;
        }
        
        .car-icon-container {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .car-icon {
          font-size: 24px;
          background-color: #e6f2ff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .result-item {
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        .route-segments {
          margin-top: 15px;
          font-size: 13px;
        }
        
        .route-segments summary {
          cursor: pointer;
          color: #555;
          font-weight: 500;
          padding: 5px 0;
        }
        
        .segment-list {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }
        
        .segment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
          font-size: 12px;
        }
        
        .traffic-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        
        .traffic-light, .traffic-fluide {
          background-color: #4CAF50;
        }
        
        .traffic-normal, .traffic-modéré, .traffic-modere {
          background-color: #FF9800;
        }
        
        .traffic-heavy, .traffic-dense {
          background-color: #F44336;
        }
        
        /* Style pour la ligne d'itinéraire optimale */
        :global(.route-node-marker) {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default Map;