import osmnx as ox
import pandas as pd
import os

# 📍 Définir la zone d'étude (Fès)
place_name = "Fès, Morocco"
print("📦 Téléchargement du graphe routier pour Fès...")
graph = ox.graph_from_place(place_name, network_type="drive")
print("✅ Graphe routier téléchargé avec succès.")

# 📊 Extraire les données des routes
edges = ox.graph_to_gdfs(graph, nodes=False, edges=True)

# 🚧 Définir les axes principaux
axes_principaux = {
    "Avenue Hassan II شارع الحسن الثاني",
    "Boulevard Allal El Fassi",
    "Boulevard Mohammed V شارع محمد الخامس",
    "Avenue des Forces Armées Royales شارع الجيش الملكي",
    "Route Sefrou طريق صفرو"
}

axes_data = []
tous_les_noms = set()

# 🔍 Rechercher les axes principaux
for _, row in edges.iterrows():
    name = row.get("name")

    # Gérer les cas où le nom est une liste
    if isinstance(name, list):
        for n in name:
            clean_name = n.strip()
            tous_les_noms.add(clean_name)
            if clean_name in axes_principaux:
                axes_data.append({
                    "nom": clean_name,
                    "point_depart": row["geometry"].coords[0],  # Coordonnées de départ
                    "point_arrivee": row["geometry"].coords[-1], # Coordonnées d'arrivée
                    "distance_km": round(row["length"] / 1000, 2),
                    "coords": list(row["geometry"].coords)
                })
    elif isinstance(name, str):
        clean_name = name.strip()
        tous_les_noms.add(clean_name)
        if clean_name in axes_principaux:
            axes_data.append({
                "nom": clean_name,
                "point_depart": row["geometry"].coords[0],  # Coordonnées de départ
                "point_arrivee": row["geometry"].coords[-1], # Coordonnées d'arrivée
                "distance_km": round(row["length"] / 1000, 2),
                "coords": list(row["geometry"].coords)
            })

# Affichage des noms trouvés pour vérification
print("\n🗺️ Noms disponibles dans le graphe :")
print(sorted(tous_les_noms))

# 📁 Vérifier et créer le dossier "data"
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, "data")
os.makedirs(output_dir, exist_ok=True)

# 📄 Enregistrer les données
output_file = os.path.join(output_dir, "axes_routiers_fes.csv")

if axes_data:
    df = pd.DataFrame(axes_data)
    try:
        df.to_csv(output_file, index=False)
        print(f"\n✅ Les coordonnées des axes routiers de Fès ont été extraites avec succès dans '{output_file}'.")
        print("\n📝 Aperçu des données extraites :")
        print(df.head())
    except Exception as e:
        print(f"\n❌ Erreur lors de l'enregistrement du fichier : {e}")
else:
    print("\n⚠️ Aucun axe principal trouvé. Vérifie ta liste d'axes ou les noms dans OSM.")
