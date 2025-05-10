import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Création des icônes personnalisées
const startIcon = new L.DivIcon({
  html: `<div style="
    background-color: #4caf50;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    text-align: center;
    line-height: 20px;
    font-weight: bold;
    border: 2px solid white;
    font-size: 12px;
  ">D</div>`
});

const endIcon = new L.DivIcon({
  html: `<div style="
    background-color: #f44336;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    text-align: center;
    line-height: 20px;
    font-weight: bold;
    border: 2px solid white;
    font-size: 12px;
  ">A</div>`
});

// 🛠️ Composant pour l'animation du marqueur
function AnimatedMarker({ positions }) {
  const map = useMap();
  const markerRef = useRef();

  useEffect(() => {
    if (positions.length > 0) {
      const marker = L.marker(positions[0], {
        icon: new L.DivIcon({
          html: `<div style="
            background-color: #2196f3;
            color: white;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            border: 2px solid white;
          "></div>`
        })
      }).addTo(map);

      let index = 0;
      const interval = setInterval(() => {
        if (index < positions.length) {
          marker.setLatLng(positions[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        map.removeLayer(marker);
      };
    }
  }, [positions, map]);

  return null;
}

function MiniMap({ depart, arrivee }) {
  const [axesCoords, setAxesCoords] = useState([]);
  const [animationPath, setAnimationPath] = useState([]);

  useEffect(() => {
    if (depart && arrivee) {
      axios.get(`http://localhost:8000/api/axes/`)
        .then(response => {
          const axes = response.data.filter(
            axe => axe.point_depart === depart && axe.point_arrivee === arrivee
          );
          const coords = axes.map(axe => JSON.parse(axe.coords));

          // Création d'un chemin continu pour l'animation
          const fullPath = coords.reduce((acc, curr) => acc.concat(curr), []);
          setAxesCoords(coords);
          setAnimationPath(fullPath);
        })
        .catch(error => console.error(error));
    }
  }, [depart, arrivee]);

  return (
    <MapContainer center={[34.0331, -4.9998]} zoom={13} className="leaflet-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {axesCoords.map((coords, index) => (
        <Polyline key={index} positions={coords} color="green" weight={5} opacity={0.8} />
      ))}

      {animationPath.length > 0 && <AnimatedMarker positions={animationPath} />}

      {axesCoords.length > 0 && (
        <>
          <Marker position={axesCoords[0][0]} icon={startIcon}>
            <Popup>Départ : {depart}</Popup>
          </Marker>
          <Marker position={axesCoords[axesCoords.length - 1].slice(-1)[0]} icon={endIcon}>
            <Popup>Arrivée : {arrivee}</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}

export default MiniMap;
