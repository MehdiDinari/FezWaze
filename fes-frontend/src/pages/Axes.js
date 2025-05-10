import { useEffect, useState } from 'react';
import axios from 'axios';

function Axes() {
  const [axes, setAxes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/axes/')
      .then(response => setAxes(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Axes Routiers</h2>
      <ul>
        {axes.map(axe => (
          <li key={axe.id}>
            {axe.nom} ({axe.point_depart} - {axe.point_arrivee}) - {axe.distance_km} km
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Axes;
