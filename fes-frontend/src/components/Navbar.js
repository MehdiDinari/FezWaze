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
