from rest_framework import serializers
from .models import AxeRoutier, TempsTrajet, Itineraire


class AxeRoutierSerializer(serializers.ModelSerializer):
    class Meta:
        model = AxeRoutier
        fields = ['id', 'nom', 'point_depart', 'point_arrivee', 'distance_km', 'coords']


class TempsTrajetSerializer(serializers.ModelSerializer):
    axe_nom = serializers.ReadOnlyField(source='axe.nom')

    class Meta:
        model = TempsTrajet
        fields = ['id', 'axe', 'axe_nom', 'heure_pointe', 'temps_moyen_min']


class ItineraireSerializer(serializers.ModelSerializer):
    # Utilisation de PrimaryKeyRelatedField pour les relations ManyToMany
    axes = serializers.PrimaryKeyRelatedField(many=True, queryset=AxeRoutier.objects.all())

    class Meta:
        model = Itineraire
        fields = ['id', 'point_depart', 'point_arrivee', 'axes', 'temps_total_min', 'heure_pointe']
