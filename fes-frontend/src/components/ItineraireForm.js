import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/components/ItineraireForm.css';

function ItineraireForm() {
  const [pointDepart, setPointDepart] = useState('');
  const [pointArrivee, setPointArrivee] = useState('');
  const [heureDepart, setHeureDepart] = useState('');
  const [jourSemaine, setJourSemaine] = useState('');
  const [pointsInteret, setPointsInteret] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itineraire, setItineraire] = useState(null);
  const [error, setError] = useState(null);

  // Charger les points d'intérêt au chargement du composant
  useEffect(() => {
    const fetchPointsInteret = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/api/axes/');
        // Extraire les points de départ et d'arrivée uniques
        const points = new Set();
        response.data.forEach(axe => {
          if (axe.point_depart) points.add(axe.point_depart);
          if (axe.point_arrivee) points.add(axe.point_arrivee);
        });
        setPointsInteret(Array.from(points).sort()); // Ajout du tri alphabétique
      } catch (err) {
        console.error("Erreur lors du chargement des points d'intérêt:", err);
        setError("Impossible de charger les points d'intérêt");
      }
    };

    fetchPointsInteret();
  }, []);

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pointDepart || !pointArrivee) {
      setError("Veuillez spécifier un point de départ et d'arrivée");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/api/itineraires/calculer/', {
        point_depart: pointDepart,
        point_arrivee: pointArrivee,
        heure_depart: heureDepart || null,
        jour_semaine: jourSemaine || null
      });
      
      setItineraire(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du calcul de l'itinéraire:", err);
      setError("Impossible de calculer l'itinéraire. Veuillez vérifier vos entrées et réessayer.");
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    setPointDepart('');
    setPointArrivee('');
    setHeureDepart('');
    setJourSemaine('');
    setItineraire(null);
    setError(null);
  };

  return (
    <div className="itineraire-form-container">
      <div className="itineraire-form-header">
        <h2>Calculer votre itinéraire</h2>
        <p>Trouvez le meilleur chemin avec prédiction de trafic en temps réel</p>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form className="itineraire-form" onSubmit={handleSubmit}>
        {/* Point de départ - Maintenant avec select */}
        <div className="form-group">
          <label htmlFor="pointDepart">Point de départ</label>
          <select
            id="pointDepart"
            className="form-control"
            value={pointDepart}
            onChange={(e) => setPointDepart(e.target.value)}
            required
          >
            <option value="">Sélectionnez un point de départ</option>
            {pointsInteret.map((point, index) => (
              <option key={`depart-${index}`} value={point}>
                {point}
              </option>
            ))}
          </select>
        </div>
        
        {/* Point d'arrivée - Maintenant avec select */}
        <div className="form-group">
          <label htmlFor="pointArrivee">Point d'arrivée</label>
          <select
            id="pointArrivee"
            className="form-control"
            value={pointArrivee}
            onChange={(e) => setPointArrivee(e.target.value)}
            required
          >
            <option value="">Sélectionnez un point d'arrivée</option>
            {pointsInteret.map((point, index) => (
              <option key={`arrivee-${index}`} value={point}>
                {point}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="heureDepart">Heure de départ (optionnel)</label>
          <input
            type="time"
            id="heureDepart"
            className="form-control"
            value={heureDepart}
            onChange={(e) => setHeureDepart(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="jourSemaine">Jour de la semaine (optionnel)</label>
          <select
            id="jourSemaine"
            className="form-control"
            value={jourSemaine}
            onChange={(e) => setJourSemaine(e.target.value)}
          >
            <option value="">Sélectionnez un jour</option>
            <option value="lundi">Lundi</option>
            <option value="mardi">Mardi</option>
            <option value="mercredi">Mercredi</option>
            <option value="jeudi">Jeudi</option>
            <option value="vendredi">Vendredi</option>
            <option value="samedi">Samedi</option>
            <option value="dimanche">Dimanche</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Réinitialiser
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Calcul en cours...' : 'Calculer l\'itinéraire'}
          </button>
        </div>
      </form>
      
      {/* Le reste du code pour afficher l'itinéraire reste inchangé */}
      {itineraire && (
        <div className="itineraire-result">
          {/* Contenu existant... */}
        </div>
      )}
    </div>
  );
}

export default ItineraireForm;