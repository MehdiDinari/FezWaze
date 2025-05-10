from django.db import models

class AxeRoutier(models.Model):
    nom = models.CharField(max_length=100)
    point_depart = models.CharField(max_length=100)
    point_arrivee = models.CharField(max_length=100)
    distance_km = models.FloatField()
    coords = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} ({self.point_depart} -> {self.point_arrivee})"


class TempsTrajet(models.Model):
    axe = models.ForeignKey(AxeRoutier, on_delete=models.CASCADE)
    heure_pointe = models.CharField(max_length=10)  # matin ou soir
    temps_moyen_min = models.IntegerField()

    def __str__(self):
        return f"{self.axe.nom} - {self.heure_pointe}"


class Itineraire(models.Model):
    point_depart = models.CharField(max_length=100)
    point_arrivee = models.CharField(max_length=100)
    axes = models.ManyToManyField(AxeRoutier)
    temps_total_min = models.IntegerField(default=0)
    heure_pointe = models.CharField(max_length=10, default="matin")

    def __str__(self):
        return f"Itinéraire : {self.point_depart} -> {self.point_arrivee} ({self.heure_pointe})"
