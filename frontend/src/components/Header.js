import React, { useState, useEffect } from 'react';
import '../styles/components.css';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Récupération de la météo de Fès
    const fetchWeather = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/weather/fes');
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Erreur lors de la récupération de la météo:', error);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 1800000); // Mise à jour toutes les 30 minutes

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
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

  const getWeatherIcon = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'thunderstorm': return '⛈️';
      default: return '🌤️';
    }
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
          {weather && (
            <div className="weather-info">
              <span className="weather-icon">{getWeatherIcon(weather.condition)}</span>
              <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
              <span className="weather-city">Fès</span>
            </div>
          )}
          
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