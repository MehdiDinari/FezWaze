import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Intercepteur pour journaliser les requêtes
axios.interceptors.request.use(
  config => {
    console.log(`Envoi de la requête à: ${config.url}`);
    return config;
  },
  error => {
    console.error('Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour améliorer la gestion des erreurs
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.warn(`Erreur ${error.response.status}: ${error.response.statusText}`);
      
      switch (error.response.status) {
        case 404:
          console.warn('Ressource non trouvée. Vérifiez que le serveur est en cours d\'exécution et que l\'endpoint existe.');
          break;
        case 401:
        case 403:
          console.warn('Problème d\'authentification ou d\'autorisation.');
          break;
        case 500:
          console.warn('Erreur serveur interne. Vérifiez les logs du serveur.');
          break;
        default:
          console.warn(`Erreur HTTP: ${error.response.status}`);
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse reçue du serveur. Vérifiez que le serveur Django est en cours d\'exécution.');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

class ApiService {
  // Récupérer tous les axes routiers
  static async getAxes() {
    try {
      const response = await axios.get(`${API_URL}/api/axes/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des axes:', error);
      throw error;
    }
  }

  // Récupérer tous les temps de trajet
  static async getTempsTrajet() {
    try {
      const response = await axios.get(`${API_URL}/api/temps/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des temps de trajet:', error);
      throw error;
    }
  }

  // Récupérer tous les itinéraires
  static async getItineraires() {
    try {
      const response = await axios.get(`${API_URL}/api/itineraires/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des itinéraires:', error);
      throw error;
    }
  }

  // Récupérer un itinéraire spécifique
  static async getItineraire(id) {
    try {
      const response = await axios.get(`${API_URL}/api/itineraires/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'itinéraire ${id}:`, error);
      throw error;
    }
  }

  // Récupérer la liste des points de départ et d'arrivée
  static async getPoints() {
    try {
      const response = await axios.get(`${API_URL}/api/points/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des points:', error);
      throw error;
    }
  }

  // Calculer un itinéraire
  static async calculerItineraire(data) {
    try {
      const response = await axios.post(`${API_URL}/api/itineraires/calculer/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      throw error;
    }
  }

  // Obtenir une prédiction de trafic pour un axe
  static async getPredictionTrafic(data) {
    try {
      const response = await axios.post(`${API_URL}/api/trafic/prediction/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la prédiction du trafic:', error);
      throw error;
    }
  }
}

export default ApiService;