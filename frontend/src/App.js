import React from 'react';
import './App.css';
import Map from './components/Map';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
      margin: 0,
      padding: 0
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
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
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a67d8, #6b46c1);
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