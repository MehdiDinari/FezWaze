# FezWaze - Système de Recommandation d'Itinéraires Dynamique

## Présentation du projet

FezWaze est un système interactif de recommandation d'itinéraires utilisant des prédictions de trafic avancées pour la ville de Fès. Cette application permet aux utilisateurs de trouver le meilleur chemin entre deux points en tenant compte des conditions de trafic en temps réel et des prédictions basées sur l'apprentissage automatique.

## Fonctionnalités principales

- Affichage dynamique des itinéraires recommandés en fonction des prédictions de trafic
- Interface interactive pour la sélection des points de départ et d'arrivée
- Visualisation cartographique enrichie avec Leaflet.js
- Système de prédiction du trafic intégré au backend (Machine Learning)
- Calcul d'itinéraires optimisés selon l'heure et le jour de la semaine
- Visualisation du niveau de trafic par code couleur (fluide, modéré, dense)
- Animation du parcours sur la carte

## Architecture technique

### Frontend

- React pour une interface utilisateur réactive et performante
- Leaflet.js pour la gestion des cartes interactives
- Communication avec le backend via API REST
- Design responsive adapté à tous les appareils

### Backend

- Django avec Django REST Framework pour l'API
- Modèle de prédiction de trafic basé sur Machine Learning (RandomForest)
- Base de données SQLite pour le stockage des données
- Traitement des données géographiques

## Installation et démarrage

### Prérequis

- Python 3.8+
- Node.js 14+
- npm ou yarn

### Installation du backend

1. Naviguer vers le dossier backend :
```bash
cd FezWaze/fes_recommandation
```

2. Créer et activer un environnement virtuel :
```bash
python -m venv env
source env/bin/activate  # Sur Windows : env\Scripts\activate
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Appliquer les migrations :
```bash
python manage.py migrate
```

5. Démarrer le serveur :
```bash
python manage.py runserver
```

Le backend sera accessible à l'adresse : http://localhost:8000

### Installation du frontend

1. Naviguer vers le dossier frontend :
```bash
cd FezWaze/fes-frontend
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Démarrer l'application :
```bash
npm start
# ou
yarn start
```

L'application frontend sera accessible à l'adresse : http://localhost:3000

## Guide d'utilisation

1. Sur la page d'accueil, cliquez sur "Calculer un itinéraire"
2. Sélectionnez votre point de départ et votre destination
3. Optionnellement, précisez l'heure et le jour de votre trajet
4. Cliquez sur "Calculer l'itinéraire"
5. Consultez les détails de l'itinéraire recommandé
6. Visualisez l'itinéraire sur la carte interactive

## Structure du projet

### Frontend (fes-frontend)

- `src/components/` : Composants React réutilisables
- `src/pages/` : Pages principales de l'application
- `src/styles/` : Fichiers CSS pour le style
- `src/services/` : Services pour la communication avec l'API

### Backend (fes_recommandation)

- `recommandations/` : Application Django principale
- `recommandations/models.py` : Modèles de données
- `recommandations/views.py` : Vues et endpoints API
- `recommandations/ml_prediction.py` : Module de prédiction de trafic
- `recommandations/maps/` : Fichiers de cartes générés

## Développement

### Ajout de nouvelles fonctionnalités

Pour ajouter de nouvelles fonctionnalités :

1. Frontend : Créez de nouveaux composants dans `src/components/` et intégrez-les dans les pages existantes
2. Backend : Ajoutez de nouveaux endpoints dans `views.py` et mettez à jour les URLs dans `urls.py`

### Amélioration du modèle de prédiction

Le modèle de prédiction de trafic peut être amélioré en :

1. Collectant plus de données réelles de trafic
2. Ajustant les hyperparamètres du modèle RandomForest
3. Expérimentant avec d'autres algorithmes (LSTM, GBM, etc.)

## Auteurs

- Équipe de développement FezWaze

## Licence

Ce projet est sous licence MIT.
