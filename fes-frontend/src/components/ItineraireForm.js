<<<<<<< HEAD
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
  const [suggestions, setSuggestions] = useState({
    depart: [],
    arrivee: []
  });

  // Charger les points d'intérêt au chargement du composant
  useEffect(() => {
    const fetchPointsInteret = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/axes/');
        // Extraire les points de départ et d'arrivée uniques
        const points = new Set();
        response.data.forEach(axe => {
          if (axe.point_depart) points.add(axe.point_depart);
          if (axe.point_arrivee) points.add(axe.point_arrivee);
        });
        setPointsInteret(Array.from(points));
      } catch (err) {
        console.error("Erreur lors du chargement des points d'intérêt:", err);
        setError("Impossible de charger les points d'intérêt");
      }
    };

    fetchPointsInteret();
  }, []);

  // Gérer les suggestions pour les points de départ et d'arrivée
  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === 'depart') {
      setPointDepart(value);
      if (value.length > 1) {
        const filtered = pointsInteret.filter(point => 
          point.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, depart: filtered }));
      } else {
        setSuggestions(prev => ({ ...prev, depart: [] }));
      }
    } else {
      setPointArrivee(value);
      if (value.length > 1) {
        const filtered = pointsInteret.filter(point => 
          point.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, arrivee: filtered }));
      } else {
        setSuggestions(prev => ({ ...prev, arrivee: [] }));
      }
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion, type) => {
    if (type === 'depart') {
      setPointDepart(suggestion);
      setSuggestions(prev => ({ ...prev, depart: [] }));
    } else {
      setPointArrivee(suggestion);
      setSuggestions(prev => ({ ...prev, arrivee: [] }));
    }
  };

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
      const response = await axios.post('http://localhost:8000/api/itineraires/calculer/', {
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
        <div className="form-group">
          <label htmlFor="pointDepart">Point de départ</label>
          <input
            type="text"
            id="pointDepart"
            className="form-control"
            value={pointDepart}
            onChange={(e) => handleInputChange(e, 'depart')}
            placeholder="Saisissez un point de départ"
            autoComplete="off"
          />
          {suggestions.depart.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.depart.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => selectSuggestion(suggestion, 'depart')}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="pointArrivee">Point d'arrivée</label>
          <input
            type="text"
            id="pointArrivee"
            className="form-control"
            value={pointArrivee}
            onChange={(e) => handleInputChange(e, 'arrivee')}
            placeholder="Saisissez un point d'arrivée"
            autoComplete="off"
          />
          {suggestions.arrivee.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.arrivee.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => selectSuggestion(suggestion, 'arrivee')}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
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
      
      {itineraire && (
        <div className="itineraire-result">
          <h3>Itinéraire recommandé</h3>
          
          <div className="itineraire-details">
            <div className="itineraire-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Temps estimé: {itineraire.temps_estime || '25'} minutes</span>
            </div>
            
            <div className="itineraire-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <span>Distance: {itineraire.distance || '5.2'} km</span>
            </div>
            
            <div className="itineraire-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Trafic actuel: {itineraire.trafic || 'Modéré'}</span>
            </div>
            
            <div className="itineraire-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Fiabilité de la prédiction: {itineraire.fiabilite || '85%'}</span>
            </div>
          </div>
          
          <div className="itineraire-axes">
            <h4>Axes empruntés</h4>
            <ul className="axe-list">
              {itineraire.axes ? (
                itineraire.axes.map((axe, index) => (
                  <li key={index} className="axe-item">
                    <span className="axe-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                    <span>{axe.nom || `Axe ${index + 1}`}: {axe.point_depart || ''} → {axe.point_arrivee || ''}</span>
                    <span 
                      className={`traffic-indicator ${
                        axe.trafic === 'dense' ? 'traffic-heavy' : 
                        axe.trafic === 'modéré' ? 'traffic-medium' : 
                        'traffic-light'
                      }`}
                      title={axe.trafic || 'Trafic normal'}
                    ></span>
                  </li>
                ))
              ) : (
                // Données de démonstration si aucun axe n'est fourni
                [
                  { nom: "Avenue Hassan II", point_depart: "Place Florence", point_arrivee: "Rond-point Atlas", trafic: "fluide" },
                  { nom: "Boulevard Mohammed V", point_depart: "Rond-point Atlas", point_arrivee: "Place de la Résistance", trafic: "modéré" },
                  { nom: "Rue Allal Ben Abdellah", point_depart: "Place de la Résistance", point_arrivee: "Quartier Administratif", trafic: "fluide" }
                ].map((axe, index) => (
                  <li key={index} className="axe-item">
                    <span className="axe-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                    <span>{axe.nom}: {axe.point_depart} → {axe.point_arrivee}</span>
                    <span 
                      className={`traffic-indicator ${
                        axe.trafic === 'dense' ? 'traffic-heavy' : 
                        axe.trafic === 'modéré' ? 'traffic-medium' : 
                        'traffic-light'
                      }`}
                      title={axe.trafic}
                    ></span>
                  </li>
                ))
              )}
            </ul>
          </div>
          
          <Link to={`/itineraire_map/${itineraire.id || 1}`} className="view-map-link">
            Voir sur la carte
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', verticalAlign: 'middle' }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
=======
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
>>>>>>> 1379eb69c40c8b8b40e0a8f90dbd037ea1900970
        </div>
      )}
    </div>
  );
}

export default ItineraireForm;
