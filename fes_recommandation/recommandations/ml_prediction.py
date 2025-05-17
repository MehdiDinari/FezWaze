"""
Module de prédiction de trafic basé sur Machine Learning
pour le système de recommandation d'itinéraires FezWaze
"""

import numpy as np
import pandas as pd
import pickle
import os
import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from django.conf import settings

class PredicteurTrafic:
    """
    Classe pour la prédiction du trafic routier basée sur un modèle de Machine Learning
    """
    
    def __init__(self):
        """Initialisation du prédicteur de trafic"""
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(settings.BASE_DIR, 'recommandations', 'ml_models')
        self.is_trained = False
        self.load_or_train_model()
    
    def load_or_train_model(self):
        """Charge un modèle existant ou en entraîne un nouveau si nécessaire"""
        model_file = os.path.join(self.model_path, 'traffic_model.pkl')
        scaler_file = os.path.join(self.model_path, 'traffic_scaler.pkl')
        
        # Vérifier si le dossier des modèles existe, sinon le créer
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
        
        # Essayer de charger un modèle existant
        try:
            with open(model_file, 'rb') as f:
                self.model = pickle.load(f)
            with open(scaler_file, 'rb') as f:
                self.scaler = pickle.load(f)
            self.is_trained = True
            print("Modèle de prédiction de trafic chargé avec succès")
        except (FileNotFoundError, EOFError):
            print("Aucun modèle existant trouvé, entraînement d'un nouveau modèle...")
            self.train_model()
    
    def train_model(self):
        """Entraîne un nouveau modèle de prédiction de trafic"""
        from django.db import connection
        
        # Récupérer les données d'entraînement depuis la base de données
        query = """
        SELECT 
            a.id as axe_id, 
            a.distance_km,
            t.heure_pointe, 
            t.temps_moyen_min
        FROM 
            recommandations_axeroutier a
        JOIN 
            recommandations_tempstrajet t ON a.id = t.axe_id
        """
        
        try:
            # Charger les données dans un DataFrame pandas
            df = pd.read_sql_query(query, connection)
            
            if df.empty:
                print("Aucune donnée disponible pour l'entraînement, création d'un modèle simulé")
                self._create_simulated_model()
                return
            
            # Préparation des features
            X = self._prepare_features(df)
            y = df['temps_moyen_min'].values
            
            # Normalisation des features
            X_scaled = self.scaler.fit_transform(X)
            
            # Entraînement du modèle
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.model.fit(X_scaled, y)
            
            # Sauvegarde du modèle et du scaler
            with open(os.path.join(self.model_path, 'traffic_model.pkl'), 'wb') as f:
                pickle.dump(self.model, f)
            with open(os.path.join(self.model_path, 'traffic_scaler.pkl'), 'wb') as f:
                pickle.dump(self.scaler, f)
            
            self.is_trained = True
            print("Modèle de prédiction de trafic entraîné et sauvegardé avec succès")
            
        except Exception as e:
            print(f"Erreur lors de l'entraînement du modèle: {e}")
            self._create_simulated_model()
    
    def _create_simulated_model(self):
        """Crée un modèle simulé pour la démonstration"""
        # Modèle simple basé sur des règles pour la démonstration
        self.model = RandomForestRegressor(n_estimators=10, random_state=42)
        
        # Données simulées pour l'entraînement
        X_sim = np.array([
            # [distance_km, heure_jour, jour_semaine]
            [1.0, 8, 1],  # Lundi matin, 1km
            [1.0, 18, 1], # Lundi soir, 1km
            [2.0, 8, 1],  # Lundi matin, 2km
            [2.0, 18, 1], # Lundi soir, 2km
            [1.0, 8, 5],  # Vendredi matin, 1km
            [1.0, 18, 5], # Vendredi soir, 1km
            [1.0, 12, 6], # Samedi midi, 1km
            [1.0, 12, 7]  # Dimanche midi, 1km
        ])
        
        # Temps de trajet simulés (en minutes)
        y_sim = np.array([5, 8, 10, 15, 6, 10, 4, 3])
        
        # Entraînement du modèle simulé
        self.scaler.fit(X_sim)
        X_sim_scaled = self.scaler.transform(X_sim)
        self.model.fit(X_sim_scaled, y_sim)
        
        # Sauvegarde du modèle et du scaler
        with open(os.path.join(self.model_path, 'traffic_model.pkl'), 'wb') as f:
            pickle.dump(self.model, f)
        with open(os.path.join(self.model_path, 'traffic_scaler.pkl'), 'wb') as f:
            pickle.dump(self.scaler, f)
        
        self.is_trained = True
        print("Modèle de prédiction simulé créé et sauvegardé avec succès")
    
    def _prepare_features(self, df):
        """Prépare les features pour l'entraînement ou la prédiction"""
        # Conversion de heure_pointe en valeur numérique
        df['heure_jour'] = df['heure_pointe'].apply(lambda x: 8 if x == 'matin' else 18)
        
        # Par défaut, on considère un jour de semaine (lundi = 1)
        df['jour_semaine'] = 1
        
        # Sélection des features
        X = df[['distance_km', 'heure_jour', 'jour_semaine']].values
        return X
    
    def predict_temps_trajet(self, axe, heure=None, jour=None):
        """
        Prédit le temps de trajet pour un axe routier donné
        
        Args:
            axe: Objet AxeRoutier
            heure: Heure de départ (format 24h, optionnel)
            jour: Jour de la semaine (1-7 pour lundi-dimanche, optionnel)
            
        Returns:
            temps_min: Temps de trajet prédit en minutes
            fiabilite: Fiabilité de la prédiction (0-100%)
        """
        if not self.is_trained:
            self.load_or_train_model()
            if not self.is_trained:
                # Retourner une estimation basique si le modèle n'est pas disponible
                return axe.distance_km * 5, 50  # 5 min/km, fiabilité 50%
        
        # Déterminer l'heure (par défaut: heure actuelle)
        if heure is None:
            now = datetime.datetime.now()
            heure = now.hour
        
        # Déterminer le jour (par défaut: jour actuel)
        if jour is None:
            now = datetime.datetime.now()
            jour = now.weekday() + 1  # 1-7 pour lundi-dimanche
        
        # Préparation des features
        X = np.array([[axe.distance_km, heure, jour]])
        X_scaled = self.scaler.transform(X)
        
        # Prédiction
        temps_min = self.model.predict(X_scaled)[0]
        
        # Calcul de la fiabilité (simulé)
        # Plus élevée en semaine aux heures de pointe, plus faible le weekend
        if 7 <= heure <= 9 or 17 <= heure <= 19:  # Heures de pointe
            fiabilite_base = 85
        else:
            fiabilite_base = 75
        
        if jour >= 6:  # Weekend
            fiabilite_base -= 10
        
        # Ajout d'une légère variation aléatoire
        fiabilite = min(95, max(60, fiabilite_base + np.random.randint(-5, 5)))
        
        return max(1, round(temps_min)), fiabilite
    
    def predict_trafic_level(self, axe, heure=None, jour=None):
        """
        Prédit le niveau de trafic pour un axe routier donné
        
        Args:
            axe: Objet AxeRoutier
            heure: Heure de départ (format 24h, optionnel)
            jour: Jour de la semaine (1-7 pour lundi-dimanche, optionnel)
            
        Returns:
            niveau: Niveau de trafic ('fluide', 'modéré', 'dense')
        """
        # Prédire le temps de trajet
        temps_min, _ = self.predict_temps_trajet(axe, heure, jour)
        
        # Calculer la vitesse moyenne (km/min)
        vitesse = axe.distance_km / max(0.1, temps_min)
        
        # Déterminer le niveau de trafic en fonction de la vitesse
        if vitesse > 0.5:  # > 30 km/h
            return 'fluide'
        elif vitesse > 0.25:  # > 15 km/h
            return 'modéré'
        else:  # <= 15 km/h
            return 'dense'
    
    def calculate_optimal_route(self, point_depart, point_arrivee, heure=None, jour=None):
        """
        Calcule l'itinéraire optimal entre deux points
        
        Args:
            point_depart: Point de départ
            point_arrivee: Point d'arrivée
            heure: Heure de départ (format 24h, optionnel)
            jour: Jour de la semaine (1-7 pour lundi-dimanche, optionnel)
            
        Returns:
            axes: Liste des axes routiers constituant l'itinéraire optimal
            temps_total: Temps total estimé en minutes
            fiabilite: Fiabilité globale de la prédiction
        """
        from .models import AxeRoutier
        
        # Convertir le jour de la semaine en format numérique si fourni sous forme de texte
        if jour and isinstance(jour, str):
            jours_map = {
                'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
                'vendredi': 5, 'samedi': 6, 'dimanche': 7
            }
            jour = jours_map.get(jour.lower(), None)
        
        # Convertir l'heure en format numérique si fournie sous forme de texte (HH:MM)
        if heure and isinstance(heure, str) and ':' in heure:
            heure = int(heure.split(':')[0])
        
        # Recherche des axes directs
        axes_directs = AxeRoutier.objects.filter(
            point_depart=point_depart,
            point_arrivee=point_arrivee
        )
        
        if axes_directs.exists():
            # Cas simple: il existe un axe direct
            axe = axes_directs.first()
            temps_min, fiabilite = self.predict_temps_trajet(axe, heure, jour)
            return [axe], temps_min, fiabilite
        
        # Cas complexe: recherche d'un itinéraire avec correspondances
        # Implémentation simplifiée pour la démonstration
        
        # 1. Trouver tous les axes partant du point de départ
        axes_depart = AxeRoutier.objects.filter(point_depart=point_depart)
        
        # 2. Trouver tous les axes arrivant au point d'arrivée
        axes_arrivee = AxeRoutier.objects.filter(point_arrivee=point_arrivee)
        
        # 3. Recherche d'une correspondance directe
        for axe_dep in axes_depart:
            for axe_arr in axes_arrivee:
                if axe_dep.point_arrivee == axe_arr.point_depart:
                    # Correspondance trouvée
                    temps_dep, fiab_dep = self.predict_temps_trajet(axe_dep, heure, jour)
                    
                    # Calculer l'heure d'arrivée au point intermédiaire
                    heure_intermediaire = heure
                    if heure is not None:
                        heure_intermediaire = (heure + (temps_dep // 60)) % 24
                    
                    temps_arr, fiab_arr = self.predict_temps_trajet(axe_arr, heure_intermediaire, jour)
                    
                    # Temps total et fiabilité moyenne
                    temps_total = temps_dep + temps_arr
                    fiabilite_moyenne = (fiab_dep + fiab_arr) / 2
                    
                    return [axe_dep, axe_arr], temps_total, fiabilite_moyenne
        
        # Si aucun itinéraire n'est trouvé, retourner une liste vide
        return [], 0, 0

# Instance globale du prédicteur
predicteur = PredicteurTrafic()
