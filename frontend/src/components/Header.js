import React, { useState, useEffect } from 'react';
import '../styles/components.css';

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
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo-container">
          <div className="logo-emoji">🗺️</div>
          <div>
            <h1 className={`header-title ${isScrolled ? 'scrolled' : ''}`}>
              MapExplorer Pro
            </h1>
            <p className="header-subtitle">
              ✨ Votre compagnon de navigation intelligent
            </p>
          </div>
        </div>
        
        <div className="header-info">
          <div className="time-info">
            <div className="time-display">
              {formatTime(currentTime)}
            </div>
            <div className="date-display">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;