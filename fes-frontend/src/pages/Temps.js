import { useEffect, useState } from 'react';
import axios from 'axios';

function Temps() {
  const [temps, setTemps] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/temps/')
      .then(response => setTemps(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Temps de Trajet</h2>
      <ul>
        {temps.map(t => (
          <li key={t.id}>
            {t.axe_nom} ({t.heure_pointe}) - {t.temps_moyen_min} min
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Temps;
