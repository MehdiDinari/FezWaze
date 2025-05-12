import os
import django
import pandas as pd

# ✅ Définir le module de configuration Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fes_recommandation.settings")
django.setup()

from recommandations.models import AxeRoutier

# 📂 Définir le chemin du fichier CSV
csv_file = os.path.join(os.path.dirname(__file__), "data", "axes_routiers_fes.csv")

# 📊 Charger les données du fichier CSV
try:
    df = pd.read_csv(csv_file)
except FileNotFoundError:
    print(f"❌ Le fichier '{csv_file}' est introuvable. Assure-toi de l'avoir extrait.")
    exit()

# ✅ Importer les données dans la base de données
for _, row in df.iterrows():
    try:
        # Conversion de la chaîne de coordonnées en liste
        coords = eval(row["coords"])
        AxeRoutier.objects.create(
            nom=row["nom"],
            point_depart=row["point_depart"],
            point_arrivee=row["point_arrivee"],
            distance_km=row["distance_km"],
            coords=coords
        )
    except Exception as e:
        print(f"❌ Erreur lors de l'importation de l'axe {row['nom']} : {e}")

print("✅ Données importées avec succès !")
