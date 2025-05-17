import { useEffect, useState } from 'react';
import axios from 'axios';

function Axes() {
  const [axes, setAxes] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/axes/')
      .then(response => {
        setAxes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des axes routiers:', error);
        setError('Impossible de charger les axes routiers. Veuillez réessayer plus tard.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des axes routiers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Erreur</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="axes-container">
      <h2>Axes Routiers de Fès</h2>
      <div className="axes-grid">
        {axes.map(axe => (
          <div key={axe.id} className="axe-card">
            <h3>{axe.nom}</h3>
            <div className="axe-details">
              <p>
                <strong>De:</strong> {axe.point_depart} <strong>À:</strong> {axe.point_arrivee}
              </p>
              <p>
                <strong>Distance:</strong> {axe.distance_km} km
                {axe.duree && <span> | <strong>Durée:</strong> {axe.duree} min</span>}
              </p>
              {axe.etat && axe.trafic && (
                <div className="axe-status">
                  <span className={`etat-badge etat-${axe.etat.toLowerCase()}`}>
                    État: {axe.etat}
                  </span>
                  <span className={`trafic-badge trafic-${axe.trafic.toLowerCase()}`}>
                    Trafic: {axe.trafic}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
=======

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
>>>>>>> 1379eb69c40c8b8b40e0a8f90dbd037ea1900970
    </div>
  );
}

<<<<<<< HEAD
export default Axes;
=======
export default Axes;
>>>>>>> 1379eb69c40c8b8b40e0a8f90dbd037ea1900970
