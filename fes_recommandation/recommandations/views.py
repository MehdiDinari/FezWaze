from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from .models import AxeRoutier, TempsTrajet, Itineraire
from .serializers import AxeRoutierSerializer, TempsTrajetSerializer, ItineraireSerializer
import folium
import ast
import os
import json
import datetime
from django.conf import settings
from .ml_prediction import predicteur

# 📍 Liste des Points de Départ et d'Arrivée
@api_view(['GET'])
def liste_points(request):
    points_depart = list(AxeRoutier.objects.values_list('point_depart', flat=True).distinct())
    points_arrivee = list(AxeRoutier.objects.values_list('point_arrivee', flat=True).distinct())

    return Response({
        "points_depart": sorted(points_depart),
        "points_arrivee": sorted(points_arrivee)
    })

# 🚗 Calcul d'itinéraire avec prédiction de trafic
@api_view(['POST'])
def calculer_itineraire(request):
    point_depart = request.data.get('point_depart')
    point_arrivee = request.data.get('point_arrivee')
    heure_depart = request.data.get('heure_depart')
    jour_semaine = request.data.get('jour_semaine')
    
    if not point_depart or not point_arrivee:
        return Response({'error': 'Les points de départ et d\'arrivée sont obligatoires.'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Convertir le jour de la semaine en format numérique si fourni
    jour = None
    if jour_semaine:
        jours_map = {
            'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
            'vendredi': 5, 'samedi': 6, 'dimanche': 7
        }
        jour = jours_map.get(jour_semaine.lower())
    
    # Convertir l'heure en format numérique si fournie
    heure = None
    if heure_depart:
        if ':' in heure_depart:
            heure = int(heure_depart.split(':')[0])
        else:
            try:
                heure = int(heure_depart)
            except ValueError:
                pass
    
    # Utiliser le prédicteur pour calculer l'itinéraire optimal
    axes, temps_total, fiabilite = predicteur.calculate_optimal_route(
        point_depart, point_arrivee, heure, jour
    )
    
    if not axes:
        return Response({'error': 'Aucun itinéraire trouvé pour ce trajet.'}, 
                        status=status.HTTP_404_NOT_FOUND)
    
    # Calculer la distance totale
    distance_totale = sum(axe.distance_km for axe in axes)
    
    # Déterminer le niveau de trafic global
    niveaux_trafic = [predicteur.predict_trafic_level(axe, heure, jour) for axe in axes]
    if 'dense' in niveaux_trafic:
        trafic_global = 'dense'
    elif 'modéré' in niveaux_trafic:
        trafic_global = 'modéré'
    else:
        trafic_global = 'fluide'
    
    # Créer l'itinéraire en base de données
    itineraire = Itineraire.objects.create(
        point_depart=point_depart,
        point_arrivee=point_arrivee,
        temps_total_min=temps_total,
        heure_pointe='matin' if heure and 5 <= heure <= 10 else 'soir'
    )
    itineraire.axes.set(axes)
    
    # Préparer les données des axes avec leurs niveaux de trafic
    axes_data = []
    for i, axe in enumerate(axes):
        axe_data = AxeRoutierSerializer(axe).data
        axe_data['trafic'] = niveaux_trafic[i]
        axes_data.append(axe_data)
    
    # Préparer la réponse
    response_data = {
        'id': itineraire.id,
        'point_depart': point_depart,
        'point_arrivee': point_arrivee,
        'temps_estime': temps_total,
        'distance': round(distance_totale, 1),
        'trafic': trafic_global,
        'fiabilite': round(fiabilite),
        'axes': axes_data
    }
    
    return Response(response_data)

# 🔮 Prédiction de trafic pour un axe spécifique
@api_view(['POST'])
def prediction_trafic(request):
    axe_id = request.data.get('axe_id')
    heure_depart = request.data.get('heure_depart')
    jour_semaine = request.data.get('jour_semaine')
    
    if not axe_id:
        return Response({'error': 'L\'identifiant de l\'axe est obligatoire.'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    try:
        axe = AxeRoutier.objects.get(id=axe_id)
    except AxeRoutier.DoesNotExist:
        return Response({'error': 'Axe routier non trouvé.'}, 
                        status=status.HTTP_404_NOT_FOUND)
    
    # Convertir le jour de la semaine en format numérique si fourni
    jour = None
    if jour_semaine:
        jours_map = {
            'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
            'vendredi': 5, 'samedi': 6, 'dimanche': 7
        }
        jour = jours_map.get(jour_semaine.lower())
    
    # Convertir l'heure en format numérique si fournie
    heure = None
    if heure_depart:
        if ':' in heure_depart:
            heure = int(heure_depart.split(':')[0])
        else:
            try:
                heure = int(heure_depart)
            except ValueError:
                pass
    
    # Prédire le temps de trajet et le niveau de trafic
    temps_min, fiabilite = predicteur.predict_temps_trajet(axe, heure, jour)
    niveau_trafic = predicteur.predict_trafic_level(axe, heure, jour)
    
    # Préparer la réponse
    response_data = {
        'axe_id': axe.id,
        'nom': axe.nom,
        'point_depart': axe.point_depart,
        'point_arrivee': axe.point_arrivee,
        'distance_km': axe.distance_km,
        'temps_estime': temps_min,
        'niveau_trafic': niveau_trafic,
        'fiabilite': fiabilite
    }
    
    return Response(response_data)

# 🌍 Carte des Axes Routiers
def carte_axes(request):
    m = folium.Map(location=[34.0331, -4.9998], zoom_start=13)

    # Ajout des axes routiers sur la carte
    axes = AxeRoutier.objects.all()
    for axe in axes:
        if axe.coords:
            coords_list = ast.literal_eval(axe.coords)
            
            # Prédire le niveau de trafic actuel
            niveau_trafic = predicteur.predict_trafic_level(axe)
            
            # Couleur selon le niveau de trafic
            if niveau_trafic == 'dense':
                color = "red"
            elif niveau_trafic == 'modéré':
                color = "orange"
            else:
                color = "green"
            
            folium.PolyLine(
                coords_list,
                color=color,
                weight=5,
                opacity=0.7,
                popup=f"{axe.nom} ({axe.point_depart} - {axe.point_arrivee})<br>Trafic: {niveau_trafic}"
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
                
                # Prédire le niveau de trafic actuel
                niveau_trafic = predicteur.predict_trafic_level(axe)
                
                # Couleur selon le niveau de trafic
                if niveau_trafic == 'dense':
                    color = "red"
                elif niveau_trafic == 'modéré':
                    color = "orange"
                else:
                    color = "green"
                
                folium.PolyLine(
                    coords_list,
                    color=color,
                    weight=5,
                    opacity=0.8,
                    popup=f"{axe.nom} ({axe.point_depart} - {axe.point_arrivee})<br>Trafic: {niveau_trafic}"
                ).add_to(m)

        # Marqueurs pour le point de départ et d'arrivée
        if itineraire.axes.first() and itineraire.axes.first().coords:
            start_coords = ast.literal_eval(itineraire.axes.first().coords)[0]
            folium.Marker(
                location=start_coords,
                popup="Départ: " + itineraire.point_depart,
                icon=folium.Icon(color="blue")
            ).add_to(m)

        if itineraire.axes.last() and itineraire.axes.last().coords:
            end_coords = ast.literal_eval(itineraire.axes.last().coords)[-1]
            folium.Marker(
                location=end_coords,
                popup="Arrivée: " + itineraire.point_arrivee,
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

# Carte des Itinéraires Dynamique (avec animation)
def carte_itineraire_dynamique(request, itineraire_id):
    try:
        itineraire = Itineraire.objects.get(id=itineraire_id)
        m = folium.Map(location=[34.0331, -4.9998], zoom_start=13)

        # Ajouter les axes de l'itinéraire avec animation
        for axe in itineraire.axes.all():
            if axe.coords:
                coords_list = ast.literal_eval(axe.coords)
                
                # Prédire le niveau de trafic actuel
                niveau_trafic = predicteur.predict_trafic_level(axe)
                
                # Couleur selon le niveau de trafic
                if niveau_trafic == 'dense':
                    color = "red"
                elif niveau_trafic == 'modéré':
                    color = "orange"
                else:
                    color = "green"
                
                folium.PolyLine(
                    coords_list,
                    color=color,
                    weight=5,
                    opacity=0.8,
                    popup=f"{axe.nom} ({axe.point_depart} - {axe.point_arrivee})<br>Trafic: {niveau_trafic}"
                ).add_to(m)

        # Marqueurs pour le point de départ et d'arrivée
        if itineraire.axes.first() and itineraire.axes.first().coords:
            start_coords = ast.literal_eval(itineraire.axes.first().coords)[0]
            folium.Marker(
                location=start_coords,
                popup="Départ: " + itineraire.point_depart,
                icon=folium.Icon(color="blue")
            ).add_to(m)

        if itineraire.axes.last() and itineraire.axes.last().coords:
            end_coords = ast.literal_eval(itineraire.axes.last().coords)[-1]
            folium.Marker(
                location=end_coords,
                popup="Arrivée: " + itineraire.point_arrivee,
                icon=folium.Icon(color="red")
            ).add_to(m)

        # Ajouter un script pour l'animation
        animation_js = """
        <script>
            // Animation de la voiture le long de l'itinéraire
            var car = L.marker([0, 0], {
                icon: L.divIcon({
                    html: '<div style="font-size: 24px;">🚗</div>',
                    iconSize: [24, 24],
                    className: 'car-icon'
                })
            }).addTo(map);
            
            // Récupérer tous les points de l'itinéraire
            var allPoints = [];
            """
        
        # Ajouter tous les points de l'itinéraire pour l'animation
        for axe in itineraire.axes.all():
            if axe.coords:
                coords_list = ast.literal_eval(axe.coords)
                animation_js += f"allPoints = allPoints.concat({json.dumps(coords_list)});\n"
        
        animation_js += """
            var currentPoint = 0;
            
            function animateCar() {
                if (currentPoint < allPoints.length) {
                    car.setLatLng(allPoints[currentPoint]);
                    currentPoint++;
                    setTimeout(animateCar, 500);
                }
            }
            
            // Démarrer l'animation après 1 seconde
            setTimeout(animateCar, 1000);
        </script>
        """
        
        # Sauvegarder la carte en HTML
        map_file = f'recommandations/maps/itineraire_dynamique_{itineraire_id}.html'
        m.save(map_file)
        
        # Ajouter le script d'animation à la fin du fichier HTML
        with open(map_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Insérer le script juste avant la fermeture du body
        content = content.replace('</body>', animation_js + '</body>')
        
        # Réécrire le fichier avec l'animation
        with open(map_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
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
