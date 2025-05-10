import osmnx as ox
import pandas as pd

# Définir la zone d'étude (Fès)
place_name = "Fès, Morocco"

# Créer le graphe routier de Fès
graph = ox.graph_from_place(place_name, network_type="drive")

# Extraire les données des routes
edges = ox.graph_to_gdfs(graph, nodes=False, edges=True)

# Filtrer les axes principaux (vous pouvez personnaliser cette liste)
axes_principaux = ["Avenue Hassan II", "Avenue Allal El Fassi", "Boulevard Chefchaouni",
                   "Boulevard Mohammed V", "Avenue des FAR", "Route de Sefrou"]

axes_data = []
for _, row in edges.iterrows():
    name = row.get("name")
    if isinstance(name, list):
        name = name[0]

    if name in axes_principaux:
        axes_data.append({
            "nom": name,
            "point_depart": row["u"],
            "point_arrivee": row["v"],
            "distance_km": round(row["length"] / 1000, 2),
            "coords": list(row["geometry"].coords)
        })

# Sauvegarder les coordonnées des axes dans un fichier CSV
df = pd.DataFrame(axes_data)
df.to_csv("data/axes_routiers_fes.csv", index=False)
print("Les coordonnées des axes routiers de Fès ont été extraites avec succès.")
