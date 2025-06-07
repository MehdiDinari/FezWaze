import React, { useState, useEffect } from 'react';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <style>{`
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
          50% { text-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(102, 126, 234, 0.5); }
        }
        
        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: sparkle 3s infinite ease-in-out;
        }
        
        .nav-item {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }
        
        .nav-item:hover {
          transform: translateY(-3px) scale(1.05);
          text-shadow: 0 5px 15px rgba(255, 255, 255, 0.5);
        }
      `}</style>
      
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%)',
        padding: isScrolled ? '0.8rem 2rem' : '1.2rem 2rem',
        borderRadius: '0 0 25px 25px',
        margin: '0 1rem 1rem',
        boxShadow: isScrolled 
          ? '0 5px 20px rgba(102, 126, 234, 0.4)' 
          : '0 10px 30px rgba(102, 126, 234, 0.3)',
        animation: 'slideInDown 0.8s ease-out',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Particules flottantes */}
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Contenu principal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Logo et titre principal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              fontSize: '2.5rem',
              animation: 'float 3s ease-in-out infinite'
            }}>
              🗺️
            </div>
            <div>
              <h1 style={{
                margin: 0,
                color: '#fff',
                fontSize: isScrolled ? '1.8rem' : '2.2rem',
                fontWeight: '700',
                background: 'linear-gradient(45deg, #fff, #f1f5f9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'glow 2s ease-in-out infinite alternate',
                transition: 'font-size 0.3s ease'
              }}>
                MapExplorer Pro
              </h1>
              <p style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.95rem',
                fontWeight: '400'
              }}>
                ✨ Votre compagnon de navigation intelligent
              </p>
            </div>
          </div>
          
          {/* Navigation centrale */}
          <nav style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <div className="nav-item" style={{
              color: '#fff',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              🧭 Navigation
            </div>
            <div className="nav-item" style={{
              color: '#fff',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              📍 Lieux
            </div>
            <div className="nav-item" style={{
              color: '#fff',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              ⭐ Favoris
            </div>
          </nav>
          
          {/* Informations temps et météo */}
          <div style={{
            textAlign: 'right',
            color: '#fff'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.2rem',
              fontFamily: 'monospace',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              fontSize: '0.85rem',
              opacity: 0.9,
              fontWeight: '400'
            }}>
              {formatDate(currentTime)}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '0.3rem',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              <span>🌤️</span>
              <span>22°C</span>
              <span style={{
                animation: 'wave 2s ease-in-out infinite',
                transformOrigin: '70% 70%',
                display: 'inline-block'
              }}>
                👋
              </span>
            </div>
          </div>
        </div>
        
        {/* Barre de progression décorative */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
          animation: 'slideInDown 1s ease-out 0.5s both'
        }} />
      </header>
    </>
  );
};

export default Header;