import React, { useState, useEffect } from 'react';
import '../styles/components.css';

const Footer = () => {
  const [stats, setStats] = useState({
    totalSearches: 0,
    routesCalculated: 0,
    usersSaved: 0,
    kmTraveled: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Animation des statistiques
    const animateStats = () => {
      const targetStats = {
        totalSearches: 15742,
        routesCalculated: 8931,
        usersSaved: 2847,
        kmTraveled: 125678
      };

      const duration = 2000;
      const stepTime = 50;
      const steps = duration / stepTime;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setStats({
          totalSearches: Math.floor(targetStats.totalSearches * progress),
          routesCalculated: Math.floor(targetStats.routesCalculated * progress),
          usersSaved: Math.floor(targetStats.usersSaved * progress),
          kmTraveled: Math.floor(targetStats.kmTraveled * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setStats(targetStats);
        }
      }, stepTime);

      return () => clearInterval(timer);
    };

    const timeout = setTimeout(animateStats, 500);
    return () => clearTimeout(timeout);
  }, []);



  return (
    <footer className="footer">
      <style>{`
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blink {
          50% { border-color: transparent; }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        
        .copyright-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          animation: slideInFromBottom 1s ease-out 0.5s both;
        }
        
        .copyright-text {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .heart-icon {
          color: #e74c3c;
          font-size: 1.2rem;
          display: inline-block;
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        .creators-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        
        .creator-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1rem 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .creator-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -200px;
          width: 200px;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        
        .creator-card:hover {
          transform: translateY(-5px) scale(1.05);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .creator-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }
        
        .creator-role {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.3rem;
        }
        
        .creator-icon {
          font-size: 1.5rem;
        }
        
        .creator-links {
          display: flex;
          gap: 1rem;
          margin-top: 0.8rem;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        
        .creator-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .creator-link:hover {
          transform: scale(1.2) rotate(5deg);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .creator-link svg {
          width: 20px;
          height: 20px;
          fill: white;
          transition: all 0.3s ease;
        }
        
        .creator-link:hover svg {
          transform: scale(1.1);
        }
        
        /* Couleurs spécifiques pour les liens */
        .github-link {
          background: linear-gradient(135deg, #333, #666);
          border: 2px solid #444;
        }
        
        .github-link:hover {
          background: linear-gradient(135deg, #444, #777);
          border-color: #888;
        }
        
        .linkedin-pink {
          background: linear-gradient(135deg, #ff6b9d, #ff8fab);
          border: 2px solid #ff6b9d;
        }
        
        .linkedin-pink:hover {
          background: linear-gradient(135deg, #ff8fab, #ffadc2);
          border-color: #ffadc2;
        }
        
        .linkedin-blue {
          background: linear-gradient(135deg, #0077b5, #00a0dc);
          border: 2px solid #0077b5;
        }
        
        .linkedin-blue:hover {
          background: linear-gradient(135deg, #00a0dc, #00c3f7);
          border-color: #00c3f7;
        }
        
        .year {
          color: #3498db;
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
          .creators-container {
            gap: 1rem;
          }
          
          .creator-card {
            padding: 0.8rem 1.5rem;
          }
          
          .creator-name {
            font-size: 1rem;
          }
          
          .creator-links {
            gap: 0.8rem;
          }
          
          .creator-link {
            width: 32px;
            height: 32px;
          }
          
          .creator-link svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
      
      <div className="footer-wave" />
      
      <div className="footer-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-value">
              {stats.totalSearches.toLocaleString()}
            </div>
            <div className="stat-label">Recherches effectuées</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🛣️</div>
            <div className="stat-value">
              {stats.routesCalculated.toLocaleString()}
            </div>
            <div className="stat-label">Itinéraires calculés</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">
              {stats.usersSaved.toLocaleString()}
            </div>
            <div className="stat-label">Utilisateurs satisfaits</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-value">
              {stats.kmTraveled.toLocaleString()}
            </div>
            <div className="stat-label">Kilomètres parcourus</div>
          </div>
        </div>
        

        
        {/* Section des droits d'auteur */}
        <div className="copyright-section">
          <p className="copyright-text">
            © <span className="year">{new Date().getFullYear()}</span> 
            MapExplorer Pro
            <span className="heart-icon">❤️</span> 
            Créé avec passion par
          </p>
          
          <div className="creators-container">
            <div className="creator-card">
              <h3 className="creator-name">
                <span className="creator-icon">👩‍💻</span>
                Chayma Chliyah
              </h3>
              <p className="creator-role">Développeuse Full Stack</p>
              <div className="creator-links">
                <a 
                  href="https://github.com/Chayma68" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="creator-link github-link"
                  title="GitHub de Chayma"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://ma.linkedin.com/in/chayma-chliyah-0365b5283" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="creator-link linkedin-pink"
                  title="LinkedIn de Chayma"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="creator-card">
              <h3 className="creator-name">
                <span className="creator-icon">👨‍💻</span>
                Mehdi Dinari
              </h3>
              <p className="creator-role">Développeur Full Stack</p>
              <div className="creator-links">
                <a 
                  href="https://github.com/MehdiDinari" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="creator-link github-link"
                  title="GitHub de Mehdi"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/mehdi-dinari-b0487a2a9/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="creator-link linkedin-blue"
                  title="LinkedIn de Mehdi"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;