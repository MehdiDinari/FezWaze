import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import '../styles/pages/Home.css';

// Composant Globe interactif
const GlobeComponent = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const mount = mountRef.current; // Copie de la référence pour le cleanup

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(300, 300);
    mount.appendChild(renderer.domElement);
    
    // Camera position
    camera.position.z = 2;
    
    // Create a group to hold all the elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Create Earth with a gradient material
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e88e5,
      transparent: true,
      opacity: 0.8
    });
    
    // Create the Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earth);
    
    // Add continents outlines - simplified for visualization
    const continentsGeometry = new THREE.SphereGeometry(1.001, 32, 32);
    const continentsMaterial = new THREE.MeshBasicMaterial({
      color: 0x2c5282,
      wireframe: false,
      transparent: true,
      opacity: 0.3
    });
    const continents = new THREE.Mesh(continentsGeometry, continentsMaterial);
    globeGroup.add(continents);
    
    // Create a wireframe globe
    const wireframeGeometry = new THREE.SphereGeometry(1.01, 24, 24);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);
    
    // Add a marker for Fès, Morocco (lat: ~34.0333° N, long: ~-5.0000°)
    // Convert to coordinates on a unit sphere
    const fesLat = 34.0333 * (Math.PI / 180); // Convert to radians
    const fesLon = -5.0000 * (Math.PI / 180); // Convert to radians
    
    // Calculate 3D position on sphere
    const fesX = Math.cos(fesLat) * Math.sin(fesLon) * 1.02; // Slightly above surface
    const fesY = Math.sin(fesLat) * 1.02;
    const fesZ = Math.cos(fesLat) * Math.cos(fesLon) * 1.02;
    
    // Create marker for Fès
    const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff3d00,
      emissive: 0xff9e80
    });
    const fesMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    fesMarker.position.set(fesX, fesY, fesZ);
    globeGroup.add(fesMarker);
    
    // Add a pulsing effect to the marker
    const pulseGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5722,
      transparent: true,
      opacity: 0.6
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.set(fesX, fesY, fesZ);
    globeGroup.add(pulse);
    
    // Add light beam from Fès
    const beamGeometry = new THREE.CylinderGeometry(0.005, 0.02, 0.2, 8);
    beamGeometry.rotateX(Math.PI / 2);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9800,
      transparent: true,
      opacity: 0.6
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    
    // Create a direction vector from center to Fès
    const direction = new THREE.Vector3(fesX, fesY, fesZ).normalize();
    
    // Position the beam slightly away from the surface
    beam.position.set(
      fesX + direction.x * 0.1,
      fesY + direction.y * 0.1,
      fesZ + direction.z * 0.1
    );
    
    // Orient the beam to point outward
    beam.lookAt(0, 0, 0);
    beam.rotateX(Math.PI / 2); // Adjust orientation
    
    globeGroup.add(beam);
    
    // Set initial rotation to show Fès
    globeGroup.rotation.x = fesLat - Math.PI/2;
    globeGroup.rotation.y = -fesLon;
    
    // Add a label for Fès
    const textDiv = document.createElement('div');
    textDiv.className = 'globe-label';
    textDiv.textContent = 'Fès';
    textDiv.style.position = 'absolute';
    textDiv.style.color = 'white';
    textDiv.style.backgroundColor = 'rgba(255, 61, 0, 0.7)';
    textDiv.style.padding = '2px 6px';
    textDiv.style.borderRadius = '4px';
    textDiv.style.fontSize = '10px';
    textDiv.style.fontWeight = 'bold';
    textDiv.style.pointerEvents = 'none';
    textDiv.style.display = 'none'; // Start hidden, will show when label is in front
    mount.appendChild(textDiv);
    
    // Variables for interactive rotation
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    
    // Mouse down event
    const onMouseDown = (event) => {
      event.preventDefault();
      isMouseDown = true;
      
      // Get mouse position
      const rect = renderer.domElement.getBoundingClientRect();
      previousMousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      // Stop auto-rotation when user starts interacting
      autoRotate = false;
      // Change cursor to indicate interaction
      renderer.domElement.style.cursor = 'grabbing';
    };
    
    // Mouse move event
    const onMouseMove = (event) => {
      if (!isMouseDown) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      const currentMousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      // Calculate how much the mouse has moved
      const deltaMove = {
        x: currentMousePosition.x - previousMousePosition.x,
        y: currentMousePosition.y - previousMousePosition.y
      };
      
      // Adjust the rotation of the globe based on mouse movement
      // Scale down the rotation to make it more controlled
      const rotationSensitivity = 0.005;
      globeGroup.rotation.y += deltaMove.x * rotationSensitivity;
      globeGroup.rotation.x += deltaMove.y * rotationSensitivity;
      
      // Limit vertical rotation to avoid flipping
      globeGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroup.rotation.x));
      
      // Update previous position
      previousMousePosition = currentMousePosition;
    };
    
    // Mouse up event
    const onMouseUp = () => {
      isMouseDown = false;
      // Change cursor back to default
      renderer.domElement.style.cursor = 'grab';
    };
    
    // Mouse out event
    const onMouseOut = () => {
      isMouseDown = false;
      // Change cursor back to default
      renderer.domElement.style.cursor = 'grab';
    };
    
    // Mouse hover to show interaction is possible
    const onMouseEnter = () => {
      renderer.domElement.style.cursor = 'grab';
    };
    
    // Add mouse event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseout', onMouseOut);
    renderer.domElement.addEventListener('mouseenter', onMouseEnter);
    
    // Double click to reset rotation
    renderer.domElement.addEventListener('dblclick', () => {
      // Reset to initial position showing Fès
      globeGroup.rotation.x = fesLat - Math.PI/2;
      globeGroup.rotation.y = -fesLon;
      autoRotate = true;
    });
    
    // Touch events for mobile
    renderer.domElement.addEventListener('touchstart', (event) => {
      event.preventDefault();
      if (event.touches.length === 1) {
        isMouseDown = true;
        autoRotate = false;
        
        const touch = event.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        previousMousePosition = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      }
    });
    
    renderer.domElement.addEventListener('touchmove', (event) => {
      event.preventDefault();
      if (isMouseDown && event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        const currentMousePosition = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
        
        const deltaMove = {
          x: currentMousePosition.x - previousMousePosition.x,
          y: currentMousePosition.y - previousMousePosition.y
        };
        
        const rotationSensitivity = 0.005;
        globeGroup.rotation.y += deltaMove.x * rotationSensitivity;
        globeGroup.rotation.x += deltaMove.y * rotationSensitivity;
        
        // Limit vertical rotation
        globeGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroup.rotation.x));
        
        previousMousePosition = currentMousePosition;
      }
    });
    
    renderer.domElement.addEventListener('touchend', () => {
      isMouseDown = false;
    });
    
    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.05;
      
      // Auto-rotate if not being controlled by user
      if (autoRotate) {
        globeGroup.rotation.y += 0.005;
      }
      
      // Update pulse effect
      pulse.scale.set(
        1 + 0.2 * Math.sin(time),
        1 + 0.2 * Math.sin(time),
        1 + 0.2 * Math.sin(time)
      );
      pulseMaterial.opacity = 0.6 + 0.4 * Math.sin(time);
      
      // Update beam opacity for pulsing effect
      beamMaterial.opacity = 0.4 + 0.3 * Math.sin(time);
      
      // Calculate position of Fès marker in screen space
      const vector = new THREE.Vector3(fesX, fesY, fesZ);
      const worldPos = vector.clone();
      worldPos.applyMatrix4(globeGroup.matrixWorld);
      
      // Check if Fès is on the visible side of the globe
      const normalizedPos = worldPos.clone().normalize();
      const camPos = new THREE.Vector3(0, 0, 1);
      const dotProduct = normalizedPos.dot(camPos);
      
      // If Fès is facing the camera (front half of the globe), show the label
      if (dotProduct > 0) {
        worldPos.project(camera);
        
        const x = (worldPos.x * 0.5 + 0.5) * renderer.domElement.width;
        const y = (-worldPos.y * 0.5 + 0.5) * renderer.domElement.height;
        
        textDiv.style.display = 'block';
        textDiv.style.left = `${x}px`;
        textDiv.style.top = `${y - 20}px`; // Position above the marker
      } else {
        // Hide label when Fès is on the back side of the globe
        textDiv.style.display = 'none';
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Clean up on component unmount
    return () => {
      if (mount) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('mouseout', onMouseOut);
        renderer.domElement.removeEventListener('mouseenter', onMouseEnter);
        
        if (textDiv.parentNode) {
          textDiv.parentNode.removeChild(textDiv);
        }
        
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  return (
    <div className="globe-container" ref={mountRef}>
      <div className="globe-instructions">Cliquez et faites glisser pour faire tourner</div>
    </div>
  );
};

function Home() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    steps: false,
    cta: false
  });
  
  useEffect(() => {
    // Set sections visible one by one with delays
    const timer1 = setTimeout(() => setIsVisible(prev => ({ ...prev, hero: true })), 100);
    const timer2 = setTimeout(() => setIsVisible(prev => ({ ...prev, features: true })), 600);
    const timer3 = setTimeout(() => setIsVisible(prev => ({ ...prev, steps: true })), 1100);
    const timer4 = setTimeout(() => setIsVisible(prev => ({ ...prev, cta: true })), 1600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  
  return (
    <div className="home-container">
      {/* Section Hero */}
      <section className={`hero-section ${isVisible.hero ? 'fade-in' : ''}`}>
        {/* Arrière-plan d'images de Fès */}
        <div className="hero-background">
          <div className="image-slider">
            <div className="image-slide" style={{backgroundImage: `url('/images/fes1.jpg')`}}></div>
            <div className="image-slide" style={{backgroundImage: `url('/images/fes2.jpg')`}}></div>
            <div className="image-slide" style={{backgroundImage: `url('/images/fes3.jpg')`}}></div>
            <div className="image-slide" style={{backgroundImage: `url('/images/fes4.jpg')`}}></div>
          </div>
          <div className="overlay-gradient"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
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
          </div>
          <div className="hero-globe">
            <div className="animate-float">
              <GlobeComponent />
            </div>
          </div>
        </div>
        
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className={`features-section ${isVisible.features ? 'fade-in' : ''}`}>
        <div className="features-background">
          <div className="bg-pattern"></div>
        </div>
        
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

      {/* Section Comment ça marche */}
      <section className={`how-it-works ${isVisible.steps ? 'fade-in' : ''}`}>
        <div className="steps-background">
          <div className="bg-image"></div>
        </div>
        
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

      {/* Section CTA */}
      <section className={`cta-section ${isVisible.cta ? 'fade-in' : ''}`}>
        <div className="cta-background">
          <div className="bg-image"></div>
          <div className="overlay-gradient"></div>
        </div>
        
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Prêt à optimiser vos déplacements ?</h2>
            <p className="cta-description">
              Commencez dès maintenant à utiliser notre système de recommandation d'itinéraires pour naviguer efficacement dans Fès.
            </p>
            <Link to="/itineraire_form" className="hero-btn hero-btn-primary">
              Calculer mon itinéraire
            </Link>
          </div>
          <div className="cta-decoration">
            <div className="pulse-circle">
              <div className="pulse-inner"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
