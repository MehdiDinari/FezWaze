import React from 'react';
import './App.css';
import Map from './components/Map';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
      fontFamily: "'Inter', 'Roboto', Arial, sans-serif",
      margin: 0,
      padding: 0
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        .App {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Animations globales */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        /* Styles pour la barre de défilement */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3498db, #2c3e50);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2980b9, #34495e);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .App {
            padding: 0;
          }
        }
      `}</style>
      
      {/* Header Component */}
      <Header />
      
      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 1s ease-in-out'
      }}>
        <Map />
      </main>
      
      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default App;