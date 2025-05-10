import { useEffect, useState } from 'react';
import axios from 'axios';
import MiniMap from './MiniMap';

function ItineraireForm() {
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [heurePointe, setHeurePointe] = useState('matin');
  const [itineraire, setItineraire] = useState(null);
  const [error, setError] = useState('');
  const [pointsDepart, setPointsDepart] = useState([]);
  const [pointsArrivee, setPointsArrivee] = useState([]);
  const [axes, setAxes] = useState([]);

  // Charger les points de départ et d'arrivée
  useEffect(() => {
    axios.get('http://localhost:8000/api/points/')
      .then(response => {
        setPointsDepart(response.data.points_depart);
        setPointsArrivee(response.data.points_arrivee);
      })
      .catch(error => console.error(error));
  }, []);

  // Charger les axes correspondant au point de départ et d'arrivée
  useEffect(() => {
    if (depart && arrivee) {
      axios.get(`http://localhost:8000/api/axes/?point_depart=${depart}&point_arrivee=${arrivee}`)
        .then(response => setAxes(response.data))
        .catch(error => console.error(error));
    }
  }, [depart, arrivee]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Récupérer les IDs des axes
    const axeIds = axes.map(axe => axe.id);

    axios.post('http://localhost:8000/api/itineraire/', {
      point_depart: depart,
      point_arrivee: arrivee,
      heure_pointe: heurePointe,
      axes: axeIds
    })
    .then(response => {
      setItineraire(response.data);
      setError('');
    })
    .catch(error => {
      setError("Aucun itinéraire trouvé pour ce trajet.");
      setItineraire(null);
    });
  };

  return (
    <div>
      <h2>Calcul d'Itinéraire Dynamique</h2>
      <form onSubmit={handleSubmit}>
        <select value={depart} onChange={(e) => setDepart(e.target.value)}>
          <option value="">Choisir un point de départ</option>
          {pointsDepart.map((point, index) => (
            <option key={index} value={point}>{point}</option>
          ))}
        </select>

        <select value={arrivee} onChange={(e) => setArrivee(e.target.value)}>
          <option value="">Choisir un point d'arrivée</option>
          {pointsArrivee.map((point, index) => (
            <option key={index} value={point}>{point}</option>
          ))}
        </select>

        <select value={heurePointe} onChange={(e) => setHeurePointe(e.target.value)}>
          <option value="matin">Matin</option>
          <option value="soir">Soir</option>
        </select>

        <button type="submit">Calculer</button>
      </form>

      {/* Mini-carte */}
      {depart && arrivee && <MiniMap depart={depart} arrivee={arrivee} />}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {itineraire && (
        <div>
          <h3>Itinéraire Calculé</h3>
          <p>De {itineraire.point_depart} à {itineraire.point_arrivee}</p>
          <p>Heure de pointe : {itineraire.heure_pointe}</p>
          <p>Temps total : {itineraire.temps_total_min} minutes</p>
          <a href={`/itineraire_map/${itineraire.id}`}>Voir sur la carte</a>
        </div>
      )}
    </div>
  );
}

export default ItineraireForm;
