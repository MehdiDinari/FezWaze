from rest_framework import viewsets
from django.http import JsonResponse, HttpResponse
from .models import AxeRoutier, TempsTrajet, Itineraire
from .serializers import AxeRoutierSerializer, TempsTrajetSerializer, ItineraireSerializer
import folium
import ast
from django.http import HttpResponse, JsonResponse
from .models import Itineraire, AxeRoutier
from django.conf import settings
import os

# 📍 Liste des Points de Départ et d'Arrivée
from django.http import JsonResponse
from .models import AxeRoutier

def liste_points(request):
    points_depart = list(AxeRoutier.objects.values_list('point_depart', flat=True).distinct())
    points_arrivee = list(AxeRoutier.objects.values_list('point_arrivee', flat=True).distinct())

    return JsonResponse({
        "points_depart": sorted(points_depart),
        "points_arrivee": sorted(points_arrivee)
    })



# 🚗 Vue pour la Création des Itinéraires Dynamiques
class ItineraireViewSet(viewsets.ModelViewSet):
    queryset = Itineraire.objects.all()
    serializer_class = ItineraireSerializer

    def create(self, request, *args, **kwargs):
        point_depart = request.data.get('point_depart')
        point_arrivee = request.data.get('point_arrivee')
        heure_pointe = request.data.get('heure_pointe', 'matin')
        axes_ids = request.data.get('axes', [])

        if not point_depart or not point_arrivee or not axes_ids:
            return JsonResponse({'error': 'Les points de départ, d\'arrivée et les axes sont obligatoires.'}, status=400)

        # Calcul du temps total
        temps_total_min = 0
        axes_utilises = []

        for axe_id in axes_ids:
            axe = AxeRoutier.objects.get(id=axe_id)
            temps = TempsTrajet.objects.filter(axe=axe, heure_pointe=heure_pointe).first()
            if temps:
                temps_total_min += temps.temps_moyen_min
                axes_utilises.append(axe)

        if not axes_utilises:
            return JsonResponse({'error': 'Aucun itinéraire direct trouvé pour ce trajet.'}, status=404)

        # Création de l'itinéraire
        itineraire = Itineraire.objects.create(
            point_depart=point_depart,
            point_arrivee=point_arrivee,
            temps_total_min=temps_total_min,
            heure_pointe=heure_pointe
        )
        itineraire.axes.set(axes_utilises)
        itineraire.save()

        serializer = self.get_serializer(itineraire)
        return JsonResponse(serializer.data)

def carte_itineraire_dynamique(request, itineraire_id):
    try:
        itineraire = Itineraire.objects.get(id=itineraire_id)
        m = folium.Map(location=[34.0331, -4.9998], zoom_start=13)

        # Ajouter les axes de l'itinéraire
        for axe in itineraire.axes.all():
            if axe.coords:
                coords_list = ast.literal_eval(axe.coords)
                folium.PolyLine(
                    coords_list,
                    color="green",
                    weight=5,
                    opacity=0.8,
                    popup=f"{axe.nom} ({axe.point_depart} - {axe.point_arrivee})"
                ).add_to(m)

        # Marqueurs pour le point de départ et d'arrivée
        if itineraire.axes.first().coords:
            start_coords = ast.literal_eval(itineraire.axes.first().coords)[0]
            folium.Marker(
                location=start_coords,
                popup="Départ",
                icon=folium.Icon(color="blue")
            ).add_to(m)

        if itineraire.axes.last().coords:
            end_coords = ast.literal_eval(itineraire.axes.last().coords)[-1]
            folium.Marker(
                location=end_coords,
                popup="Arrivée",
                icon=folium.Icon(color="red")
            ).add_to(m)

        # Sauvegarder la carte en HTML
        map_file = f'recommandations/maps/itineraire_{itineraire_id}.html'
        m.save(map_file)

        # Lire le contenu du fichier HTML et l'envoyer comme réponse
        with open(map_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')

    except Itineraire.DoesNotExist:
        return JsonResponse({'error': 'Itinéraire non trouvé'}, status=404)
# 🌍 Carte des Axes Routiers
def carte_axes(request):
    m = folium.Map(location=[34.0331, -4.9998], zoom_start=13)

    # Ajout des axes routiers sur la carte
    axes = AxeRoutier.objects.all()
    for axe in axes:
        if axe.coords:
            coords_list = ast.literal_eval(axe.coords)
            folium.PolyLine(
                coords_list,
                color="blue",
                weight=5,
                opacity=0.7,
                popup=f"{axe.nom} ({axe.point_depart} - {axe.point_arrivee})"
            ).add_to(m)

    # Sauvegarder la carte en HTML
    map_file = os.path.join(settings.BASE_DIR, 'recommandations', 'maps', 'carte_axes.html')
    m.save(map_file)

    # Lire le contenu du fichier HTML et l'envoyer comme réponse
    with open(map_file, 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content, content_type='text/html')


# 🛣️ Carte des Itinéraires
def carte_itineraire(request, itineraire_id):
    try:
        itineraire = Itineraire.objects.get(id=itineraire_id)
        m = folium.Map(location=[34.0331, -4.9998], zoom_start=13)

        # Ajouter les axes de l'itinéraire
        for axe in itineraire.axes.all():
            if axe.coords:
                coords_list = ast.literal_eval(axe.coords)
                folium.PolyLine(
                    coords_list,
                    color="green",
                    weight=5,
                    opacity=0.8,
                    popup=f"{axe.nom} ({axe.point_depart} - {axe.point_arrivee})"
                ).add_to(m)

        # Marqueurs pour le point de départ et d'arrivée
        if itineraire.axes.first().coords:
            start_coords = ast.literal_eval(itineraire.axes.first().coords)[0]
            folium.Marker(
                location=start_coords,
                popup="Départ",
                icon=folium.Icon(color="blue")
            ).add_to(m)

        if itineraire.axes.last().coords:
            end_coords = ast.literal_eval(itineraire.axes.last().coords)[-1]
            folium.Marker(
                location=end_coords,
                popup="Arrivée",
                icon=folium.Icon(color="red")
            ).add_to(m)

        # Sauvegarder la carte en HTML
        map_file = f'recommandations/maps/itineraire_{itineraire_id}.html'
        m.save(map_file)

        # Lire le contenu du fichier HTML et l'envoyer comme réponse
        with open(map_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')

    except Itineraire.DoesNotExist:
        return JsonResponse({'error': 'Itinéraire non trouvé'}, status=404)


# 📌 Vues pour les Modèles
class AxeRoutierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AxeRoutier.objects.all()
    serializer_class = AxeRoutierSerializer


class TempsTrajetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TempsTrajet.objects.all()
    serializer_class = TempsTrajetSerializer


class ItineraireViewSet(viewsets.ModelViewSet):
    queryset = Itineraire.objects.all()
    serializer_class = ItineraireSerializer
