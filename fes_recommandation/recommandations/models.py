from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
import json

class AxeRoutier(models.Model):
    nom = models.CharField(max_length=200)
    point_depart = models.CharField(max_length=200)
    point_arrivee = models.CharField(max_length=200)
    distance_km = models.FloatField()
    coords = models.JSONField(default=list)  # Stockage des coordonnées en JSON
    vitesse_limite = models.IntegerField(default=50)
    nombre_voies = models.IntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['point_depart', 'point_arrivee']),
        ]

    def __str__(self):
        return f"{self.nom} ({self.point_depart} -> {self.point_arrivee})"


class TempsTrajet(models.Model):
    HEURE_POINTE_CHOICES = [
        ('matin', 'Heure de pointe du matin'),
        ('soir', 'Heure de pointe du soir'),
        ('normal', 'Heure normale'),
        ('nuit', 'Nuit'),
    ]
    
    axe = models.ForeignKey(AxeRoutier, on_delete=models.CASCADE, related_name='temps_trajets')
    heure_pointe = models.CharField(max_length=10, choices=HEURE_POINTE_CHOICES)
    temps_moyen_min = models.IntegerField()
    variance = models.FloatField(default=0.1)  # Pour la prédiction ML
    derniere_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['axe', 'heure_pointe']

    def __str__(self):
        return f"{self.axe.nom} - {self.heure_pointe}: {self.temps_moyen_min} min"


class Itineraire(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    point_depart = models.CharField(max_length=200)
    point_arrivee = models.CharField(max_length=200)
    axes = models.ManyToManyField(AxeRoutier, through='ItineraireAxe')
    temps_total_min = models.IntegerField(default=0)
    distance_totale_km = models.FloatField(default=0)
    heure_depart = models.DateTimeField(null=True, blank=True)
    est_favori = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Itinéraire : {self.point_depart} -> {self.point_arrivee}"


class ItineraireAxe(models.Model):
    itineraire = models.ForeignKey(Itineraire, on_delete=models.CASCADE)
    axe = models.ForeignKey(AxeRoutier, on_delete=models.CASCADE)
    ordre = models.IntegerField()
    temps_predit_min = models.IntegerField()
    niveau_trafic = models.CharField(max_length=20)
    
    class Meta:
        ordering = ['ordre']
        unique_together = ['itineraire', 'ordre']


class IncidentTrafic(models.Model):
    TYPE_CHOICES = [
        ('accident', 'Accident'),
        ('travaux', 'Travaux'),
        ('embouteillage', 'Embouteillage'),
        ('evenement', 'Événement'),
    ]
    
    axe = models.ForeignKey(AxeRoutier, on_delete=models.CASCADE, related_name='incidents')
    type_incident = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    impact_trafic = models.IntegerField(default=3)  # 1-5, 5 étant le plus grave
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.type_incident} sur {self.axe.nom}"


class DonneesTraficTempsReel(models.Model):
    axe = models.ForeignKey(AxeRoutier, on_delete=models.CASCADE, related_name='donnees_temps_reel')
    timestamp = models.DateTimeField(auto_now_add=True)
    vitesse_moyenne_kmh = models.FloatField()
    densite_vehicules = models.IntegerField()  # Nombre de véhicules par km
    temps_trajet_actuel_min = models.IntegerField()
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['axe', '-timestamp']),
        ]