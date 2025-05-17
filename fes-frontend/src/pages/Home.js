<<<<<<< HEAD
import { Link } from 'react-router-dom';
import '../styles/pages/Home.css';

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">Naviguez intelligemment dans Fès</h1>
        <p className="hero-subtitle">
          Découvrez le meilleur itinéraire avec prédiction de trafic en temps réel
        </p>
        <div className="hero-buttons">
          <Link to="/itineraire_form" className="hero-btn hero-btn-primary">
            Calculer un itinéraire
          </Link>
          <Link to="/map" className="hero-btn hero-btn-secondary">
            Voir la carte
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
            </div>
            <h3 className="feature-title">Cartographie interactive</h3>
            <p className="feature-description">
              Visualisez les axes routiers de Fès avec une interface intuitive et réactive.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 className="feature-title">Prédiction de trafic</h3>
            <p className="feature-description">
              Bénéficiez de prédictions avancées basées sur l'analyse des données historiques et en temps réel.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="feature-title">Optimisation du temps</h3>
            <p className="feature-description">
              Gagnez du temps grâce à des recommandations d'itinéraires optimisées selon l'heure et le jour.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">Comment ça marche</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Sélectionnez vos points de départ et d'arrivée</h3>
              <p className="step-description">
                Choisissez simplement votre point de départ et votre destination dans la ville de Fès.
              </p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Précisez l'heure et le jour (optionnel)</h3>
              <p className="step-description">
                Pour des prédictions plus précises, vous pouvez spécifier l'heure et le jour de votre trajet.
              </p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Obtenez votre itinéraire optimisé</h3>
              <p className="step-description">
                Notre système analyse les données de trafic et vous propose le meilleur itinéraire en fonction des conditions actuelles et prévues.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Prêt à optimiser vos déplacements ?</h2>
        <p className="cta-description">
          Commencez dès maintenant à utiliser notre système de recommandation d'itinéraires pour naviguer efficacement dans Fès.
        </p>
        <Link to="/itineraire_form" className="hero-btn hero-btn-primary">
          Calculer mon itinéraire
        </Link>
      </section>
=======
function Home() {
  return (
    <div>
      <h1>Bienvenue à Fès</h1>
      <p>Explorez les itinéraires optimaux pour naviguer à travers la ville.</p>
>>>>>>> 1379eb69c40c8b8b40e0a8f90dbd037ea1900970
    </div>
  );
}

export default Home;
