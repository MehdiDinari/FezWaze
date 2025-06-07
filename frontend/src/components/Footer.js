import React, { useState, useEffect } from 'react';

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

  const socialLinks = [
    { icon: '📘', name: 'Facebook', color: '#1877f2' },
    { icon: '🐦', name: 'Twitter', color: '#1da1f2' },
    { icon: '📷', name: 'Instagram', color: '#e4405f' },
    { icon: '💼', name: 'LinkedIn', color: '#0077b5' },
    { icon: '📺', name: 'YouTube', color: '#ff0000' }
  ];

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .social-icon {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }
        
        .social-icon:hover {
          transform: translateY(-5px) scale(1.2);
          filter: brightness(1.2);
        }
        
        .stat-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }
        
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shine-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shine 3s infinite;
        }
        
        .footer-wave {
          position: absolute;
          top: -50px;
          left: 0;
          width: 100%;
          height: 50px;
          background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3e%3cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23667eea'%3e%3c/path%3e%3c/svg%3e") no-repeat;
          background-size: cover;
        }
      `}</style>
      
      <footer style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%)',
        color: '#fff',
        margin: '1rem',
        borderRadius: '25px 25px 0 0',
        position: 'relative',
        overflow: 'hidden',
        animation: isVisible ? 'slideInUp 0.8s ease-out' : 'none'
      }}>
        {/* Effet de vague en haut */}
        <div className="footer-wave" />
        
        {/* Contenu principal */}
        <div style={{
          padding: '3rem 2rem 1rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Section des statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
            animation: 'fadeInUp 1s ease-out 0.3s both'
          }}>
            <div className="stat-card shine-effect" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                {stats.totalSearches.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Recherches effectuées</div>
            </div>
            
            <div className="stat-card shine-effect" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛣️</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                {stats.routesCalculated.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Itinéraires calculés</div>
            </div>
            
            <div className="stat-card shine-effect" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏰</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                {stats.usersSaved.toLocaleString()}h
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Heures économisées</div>
            </div>
            
            <div className="stat-card shine-effect" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌍</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                {stats.kmTraveled.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Kilomètres parcourus</div>
            </div>
          </div>
          
          {/* Section des informations et liens */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
            animation: 'fadeInUp 1s ease-out 0.6s both'
          }}>
            {/* À propos */}
            <div>
              <h3 style={{
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                🚀 À propos de MapExplorer Pro
              </h3>
              <p style={{
                lineHeight: '1.6',
                opacity: 0.9,
                margin: 0
              }}>
                Votre compagnon de navigation intelligent qui vous aide à explorer le monde avec style. 
                Découvrez de nouveaux lieux, planifiez vos itinéraires et vivez l'aventure !
              </p>
            </div>
            
            {/* Liens rapides */}
            <div>
              <h3 style={{
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                ⚡ Liens rapides
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['🏠 Accueil', '🗺️ Cartes', '📱 Mobile App', '🎯 API', '📞 Support'].map((link, index) => (
                  <div
                    key={index}
                    style={{
                      cursor: 'pointer',
                      padding: '0.5rem 0',
                      transition: 'all 0.3s ease',
                      borderRadius: '8px',
                      opacity: 0.9
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateX(10px)';
                      e.target.style.opacity = '1';
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.padding = '0.5rem 1rem';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.opacity = '0.9';
                      e.target.style.background = 'transparent';
                      e.target.style.padding = '0.5rem 0';
                    }}
                  >
                    {link}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact */}
            <div>
              <h3 style={{
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                📬 Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', opacity: 0.9 }}>
                <div>📧 contact@mapexplorer.pro</div>
                <div>📱 +212 6 XX XX XX XX</div>
                <div>📍 Casablanca, Maroc</div>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {socialLinks.map((social, index) => (
                    <div
                      key={index}
                      className="social-icon"
                      style={{
                        fontSize: '1.5rem',
                        padding: '0.5rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        animationDelay: `${index * 0.1}s`
                      }}
                      title={social.name}
                    >
                      {social.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Ligne de séparation */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            margin: '2rem 0',
            animation: 'fadeInUp 1s ease-out 0.9s both'
          }} />
          
          {/* Copyright et informations finales */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            opacity: 0.8,
            animation: 'fadeInUp 1s ease-out 1.2s both'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'pulse 2s infinite' }}>💖</span>
              <span>Fait avec amour au Maroc</span>
            </div>
            
            <div style={{ textAlign: 'center', flex: 1 }}>
              © 2025 MapExplorer Pro. Tous droits réservés.
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}>
                Confidentialité
              </span>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}>
                Conditions
              </span>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}>
                Cookies
              </span>
            </div>
          </div>
        </div>
        
        {/* Particules flottantes */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                animation: `bounce ${2 + Math.random() * 2}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </footer>
    </>
  );
};

export default Footer;