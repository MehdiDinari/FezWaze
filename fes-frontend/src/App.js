import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Axes from './pages/Axes';
import Temps from './pages/Temps';
import Itineraires from './pages/Itineraires';
import Map from './components/Map';
import ItineraireMap from './components/ItineraireMap';
import ItineraireForm from './components/ItineraireForm';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/axes" element={<Axes />} />
        <Route path="/temps" element={<Temps />} />
        <Route path="/itineraires" element={<Itineraires />} />
        <Route path="/map" element={<Map />} />
        <Route path="/itineraire_map/:itineraireId" element={<ItineraireMap />} />
        <Route path="/itineraire_form" element={<ItineraireForm />} />
      </Routes>
    </Router>
  );
}

export default App;
