import numpy as np
import datetime
import random
from .models import AxeRoutier, TempsTrajet

class PredicteurTrafic:
    """
    Classe pour la prédiction du trafic et le calcul d'itinéraires optimaux
    """
    
    def __init__(self):
        self.initialized = False
        self.axes_cache = {}
        self.temps_cache = {}
        
    def initialize(self):
        """Initialise les caches pour les axes et les temps de trajet"""
        if self.initialized:
            return
            
        # Charger tous les axes routiers
        axes = AxeRoutier.objects.all()
        for axe in axes:
            self.axes_cache[axe.id] = axe
            
        # Charger tous les temps de trajet
        temps_trajets = TempsTrajet.objects.all()
        for temps in temps_trajets:
            key = (temps.axe.id, temps.heure_pointe)
            self.temps_cache[key] = temps.temps_moyen_min
            
        self.initialized = True
    
    def predict_temps_trajet(self, axe, heure=None, jour=None):
        """
        Prédit le temps de trajet pour un axe donné en fonction de l'heure et du jour
        
        Args:
            axe: Objet AxeRoutier
            heure: Heure de la journée (0-23)
            jour: Jour de la semaine (1-7, 1=lundi)
            
        Returns:
            tuple: (temps_trajet_minutes, fiabilite_prediction)
        """
        self.initialize()
        
        # Déterminer l'heure et le jour actuels si non spécifiés
        if heure is None:
            heure = datetime.datetime.now().hour
        if jour is None:
            jour = datetime.datetime.now().weekday() + 1  # 1-7, lundi=1
            
        # Déterminer si c'est une heure de pointe
        heure_pointe = 'matin' if 7 <= heure <= 9 else 'soir' if 16 <= heure <= 19 else 'normal'
        
        # Récupérer le temps moyen pour cet axe à cette heure de pointe
        temps_base = None
        try:
            temps = TempsTrajet.objects.filter(axe=axe, heure_pointe=heure_pointe).first()
            if temps:
                temps_base = temps.temps_moyen_min
        except Exception:
            pass
            
        if temps_base is None:
            # Fallback: calculer un temps approximatif basé sur la distance
            vitesse_moyenne = 30  # km/h
            temps_base = (axe.distance_km / vitesse_moyenne) * 60  # minutes
        
        # Facteurs d'ajustement selon le jour et l'heure
        facteur_jour = 1.2 if jour <= 5 else 0.8  # Semaine vs weekend
        facteur_heure = 1.0
        
        if jour <= 5:  # Jours de semaine
            if 7 <= heure <= 9:  # Heure de pointe du matin
                facteur_heure = 1.5
            elif 16 <= heure <= 19:  # Heure de pointe du soir
                facteur_heure = 1.4
            elif 22 <= heure or heure <= 5:  # Nuit
                facteur_heure = 0.7
        else:  # Weekend
            if 10 <= heure <= 18:  # Journée
                facteur_heure = 1.1
            elif 22 <= heure or heure <= 5:  # Nuit
                facteur_heure = 0.6
                
        # Calculer le temps prédit
        temps_predit = temps_base * facteur_jour * facteur_heure
        
        # Ajouter une légère variation aléatoire pour plus de réalisme
        variation = random.uniform(0.9, 1.1)
        temps_predit *= variation
        
        # Fiabilité de la prédiction (plus élevée pendant les heures normales)
        fiabilite = 90 - abs(heure - 12) * 2  # 90% à midi, diminue aux extrémités
        
        return round(temps_predit, 1), fiabilite
        
    def predict_trafic_level(self, axe, heure=None, jour=None):
        """
        Prédit le niveau de trafic pour un axe donné
        
        Args:
            axe: Objet AxeRoutier
            heure: Heure de la journée (0-23)
            jour: Jour de la semaine (1-7, 1=lundi)
            
        Returns:
            str: Niveau de trafic ('fluide', 'modéré', 'dense')
        """
        self.initialize()
        
        # Obtenir le temps prédit et le temps normal
        temps_predit, _ = self.predict_temps_trajet(axe, heure, jour)
        
        # Temps de référence (hors heures de pointe)
        temps_normal, _ = self.predict_temps_trajet(axe, 14, 3)  # Mercredi 14h
        
        # Calculer le ratio
        ratio = temps_predit / temps_normal if temps_normal > 0 else 1
        
        # Déterminer le niveau de trafic
        if ratio > 1.3:
            return 'dense'
        elif ratio > 1.1:
            return 'modéré'
        else:
            return 'fluide'
    
    def calculate_optimal_route(self, point_depart, point_arrivee, heure=None, jour=None):
        """
        Calcule l'itinéraire optimal entre deux points
        
        Args:
            point_depart: Nom du point de départ
            point_arrivee: Nom du point d'arrivée
            heure: Heure de départ (0-23)
            jour: Jour de la semaine (1-7, 1=lundi)
            
        Returns:
            tuple: (liste_axes, temps_total, fiabilite)
        """
        self.initialize()
        
        # Trouver tous les axes qui partent du point de départ
        axes_depart = AxeRoutier.objects.filter(point_depart=point_depart)
        
        # Si aucun axe ne part du point de départ, retourner vide
        if not axes_depart.exists():
            return [], 0, 0
            
        # Recherche d'un chemin direct
        axe_direct = AxeRoutier.objects.filter(
            point_depart=point_depart, 
            point_arrivee=point_arrivee
        ).first()
        
        if axe_direct:
            temps, fiabilite = self.predict_temps_trajet(axe_direct, heure, jour)
            return [axe_direct], temps, fiabilite
            
        # Recherche d'un chemin à deux segments
        axes_intermediaires = {}
        for axe1 in axes_depart:
            axes_suite = AxeRoutier.objects.filter(
                point_depart=axe1.point_arrivee,
                point_arrivee=point_arrivee
            )
            for axe2 in axes_suite:
                temps1, fiab1 = self.predict_temps_trajet(axe1, heure, jour)
                
                # Calculer l'heure d'arrivée au point intermédiaire
                heure_arrivee = heure
                if heure is not None:
                    heure_arrivee = (heure + int(temps1 / 60)) % 24
                
                temps2, fiab2 = self.predict_temps_trajet(axe2, heure_arrivee, jour)
                temps_total = temps1 + temps2
                fiabilite_moyenne = (fiab1 + fiab2) / 2
                
                axes_intermediaires[(axe1, axe2)] = (temps_total, fiabilite_moyenne)
        
        # Trouver le meilleur chemin à deux segments
        if axes_intermediaires:
            meilleur_chemin = min(axes_intermediaires.items(), key=lambda x: x[1][0])
            axes = list(meilleur_chemin[0])
            temps_total, fiabilite = meilleur_chemin[1]
            return axes, temps_total, fiabilite
            
        # Si aucun chemin n'est trouvé, essayer de trouver un chemin à trois segments
        # (Cette partie pourrait être optimisée avec un algorithme de plus court chemin comme Dijkstra)
        axes_trois_segments = {}
        for axe1 in axes_depart:
            axes_milieu = AxeRoutier.objects.filter(point_depart=axe1.point_arrivee)
            for axe2 in axes_milieu:
                axes_fin = AxeRoutier.objects.filter(
                    point_depart=axe2.point_arrivee,
                    point_arrivee=point_arrivee
                )
                for axe3 in axes_fin:
                    temps1, fiab1 = self.predict_temps_trajet(axe1, heure, jour)
                    
                    heure_arrivee1 = heure
                    if heure is not None:
                        heure_arrivee1 = (heure + int(temps1 / 60)) % 24
                    
                    temps2, fiab2 = self.predict_temps_trajet(axe2, heure_arrivee1, jour)
                    
                    heure_arrivee2 = heure_arrivee1
                    if heure_arrivee1 is not None:
                        heure_arrivee2 = (heure_arrivee1 + int(temps2 / 60)) % 24
                    
                    temps3, fiab3 = self.predict_temps_trajet(axe3, heure_arrivee2, jour)
                    
                    temps_total = temps1 + temps2 + temps3
                    fiabilite_moyenne = (fiab1 + fiab2 + fiab3) / 3
                    
                    axes_trois_segments[(axe1, axe2, axe3)] = (temps_total, fiabilite_moyenne)
        
        # Trouver le meilleur chemin à trois segments
        if axes_trois_segments:
            meilleur_chemin = min(axes_trois_segments.items(), key=lambda x: x[1][0])
            axes = list(meilleur_chemin[0])
            temps_total, fiabilite = meilleur_chemin[1]
            return axes, temps_total, fiabilite
            
        # Aucun chemin trouvé
        return [], 0, 0

# Créer une instance du prédicteur
predicteur = PredicteurTrafic()
