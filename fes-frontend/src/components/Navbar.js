<<<<<<< HEAD
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import '../styles/components/Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navbarRef = useRef(null);
  
  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Effet de scroll
  useEffect(() => {
    const navbar = navbarRef.current;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effet de ripple sur clic
  const addRippleEffect = (e) => {
    const target = e.currentTarget;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    target.appendChild(ripple);
    
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <>
      {/* Styles d'animation ajoutés ici */}
      <style>
        {`
          /* Animation du logo */
          .navbar-logo svg {
            animation: pulse 2s infinite alternate;
            transform-origin: center;
            transition: all 0.3s ease;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
          }
          
          .navbar-logo:hover svg {
            animation: logoSpin 1s ease;
            fill: rgba(255, 100, 100, 0.1);
          }
          
          @keyframes logoSpin {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
          
          /* Animation du point de localisation */
          .location-dot {
            position: relative;
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ff5252;
            margin-left: 5px;
            animation: rippleDot 1.5s infinite ease-out;
          }
          
          @keyframes rippleDot {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.6);
            }
            70% {
              box-shadow: 0 0 0 6px rgba(255, 82, 82, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
            }
          }
          
          /* Animation des liens au survol */
          .navbar-link {
            position: relative;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
          }
          
          .navbar-link:hover {
            transform: translateY(-2px);
          }
          
          .navbar-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #ff5252, #ff8a80);
            transition: width 0.3s ease;
          }
          
          .navbar-link:hover::after {
            width: 100%;
          }
          
          /* Animation des icônes */
          .navbar-link svg {
            transition: all 0.3s ease;
          }
          
          .navbar-link:hover svg {
            transform: translateY(-2px) scale(1.1);
            color: #ff5252;
          }
          
          /* Animation du menu mobile */
          .navbar-menu {
            transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease;
          }
          
          .navbar-menu.open {
            animation: slideIn 0.4s forwards;
          }
          
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Animation du bouton calculer */
          .calculate-btn {
            transition: all 0.3s ease;
            animation: glow 2s infinite alternate;
          }
          
          @keyframes glow {
            0% {
              box-shadow: 0 0 5px rgba(255, 82, 82, 0.5);
            }
            100% {
              box-shadow: 0 0 20px rgba(255, 82, 82, 0.8);
            }
          }
          
          /* Animation subtile quand la navbar est scrollée */
          .navbar.scrolled {
            animation: fadeIn 0.5s forwards;
          }
          
          @keyframes fadeIn {
            from {
              backdrop-filter: blur(0);
            }
            to {
              backdrop-filter: blur(10px);
            }
          }
          
          /* Ripple effect amélioré */
          .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleAnim 0.6s linear;
            pointer-events: none;
          }
          
          @keyframes rippleAnim {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}
      </style>
    
      <nav className="navbar" ref={navbarRef}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            {/* Logo de géolocalisation avec animation */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            FezWaze
            <span className="location-dot"></span>
          </Link>
          
          <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
          
          <ul className={`navbar-menu ${isOpen ? 'open' : ''}`}>
            <li className="navbar-item">
              <Link 
                to="/" 
                className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={addRippleEffect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Accueil
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/axes" 
                className={`navbar-link ${location.pathname === '/axes' ? 'active' : ''}`}
                onClick={addRippleEffect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                </svg>
                Axes Routiers
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/temps" 
                className={`navbar-link ${location.pathname === '/temps' ? 'active' : ''}`}
                onClick={addRippleEffect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Temps de Trajet
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/itineraires" 
                className={`navbar-link ${location.pathname === '/itineraires' ? 'active' : ''}`}
                onClick={addRippleEffect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Itinéraires
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/map" 
                className={`navbar-link ${location.pathname === '/map' ? 'active' : ''}`}
                onClick={addRippleEffect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                Carte
              </Link>
            </li>
            <li className="navbar-item">
              <Link 
                to="/itineraire_form" 
                className={`navbar-link calculate-btn ${location.pathname === '/itineraire_form' ? 'active' : ''}`}
                onClick={addRippleEffect}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Calculer
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
=======
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/axes">Axes Routiers</Link></li>
        <li><Link to="/temps">Temps de Trajet</Link></li>
        <li><Link to="/itineraires">Itinéraires</Link></li>
        <li><Link to="/map">Carte des Axes</Link></li>
        <li><Link to="/itineraire_map">Carte des Itinéraires</Link></li>
        <li><Link to="/itineraire_form">Calcul Itinéraire</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
>>>>>>> 1379eb69c40c8b8b40e0a8f90dbd037ea1900970
