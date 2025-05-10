import csv
import ast
from django.core.management.base import BaseCommand
from recommandations.models import AxeRoutier, TempsTrajet

class Command(BaseCommand):
    help = 'Importe les données des fichiers CSV pour les axes routiers et les temps de trajet'

    def handle(self, *args, **kwargs):
        # Import des axes routiers
        with open('data/axes_routiers_fes.csv', 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                coords = ast.literal_eval(row['coords'])
                axe, created = AxeRoutier.objects.get_or_create(
                    id=row['id'],
                    nom=row['nom'],
                    point_depart=row['point_depart'],
                    point_arrivee=row['point_arrivee'],
                    distance_km=row['distance_km'],
                    coords=coords
                )
                if created:
                    print(f"Axe routier '{axe.nom}' importé avec succès.")

        # Import des temps de trajet
        with open('data/temps_trajet_fes.csv', 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                axe = AxeRoutier.objects.get(id=row['axe_id'])
                TempsTrajet.objects.create(
                    axe=axe,
                    heure_pointe=row['heure_pointe'],
                    temps_moyen_min=row['temps_moyen_min']
                )
                print(f"Temps de trajet pour l'axe '{axe.nom}' ({row['heure_pointe']}) importé avec succès.")

        self.stdout.write(self.style.SUCCESS('Les données ont été importées avec succès.'))
