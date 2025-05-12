import pandas as pd
import os

# 📁 Définir le chemin du fichier CSV
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, "data")
csv_file = os.path.join(data_dir, "axes_routiers_fes.csv")

# 📋 Vérifier si le fichier existe
if not os.path.exists(csv_file):
    print(f"❌ Le fichier '{csv_file}' n'existe pas. Vérifie que l'extraction a été faite correctement.")
else:
    # 📊 Charger les données
    df = pd.read_csv(csv_file)

    # 📝 Afficher un aperçu des données
    print("\n📝 Aperçu des données extraites :")
    print(df.head())

    # 🔢 Afficher le nombre total de lignes et colonnes
    print("\n🔢 Dimensions du fichier :")
    print(f"Total lignes : {df.shape[0]}")
    print(f"Total colonnes : {df.shape[1]}")

    # 🗺️ Vérifier les colonnes disponibles
    print("\n🗺️ Colonnes disponibles :")
    print(df.columns)

    # 🕵️ Vérifier les valeurs manquantes
    print("\n🕵️ Vérification des valeurs manquantes :")
    print(df.isna().sum())

    # 📏 Vérifier les distances
    print("\n📏 Statistiques des distances (en km) :")
    print(df["distance_km"].describe())
