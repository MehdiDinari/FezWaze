
import { useEffect, useState } from 'react';
import axios from 'axios';

function Itineraires() {
  const [itineraires, setItineraires] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/api/itineraires/')
      .then(response => setItineraires(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Itinéraires</h2>
      <ul>
        {itineraires.map(i => (
          <li key={i.id}>
            De {i.point_depart} à {i.point_arrivee} ({i.heure_pointe}) - {i.temps_total_min} min
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Itineraires;
