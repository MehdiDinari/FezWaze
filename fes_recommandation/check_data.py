import pandas as pd

axes_df = pd.read_csv('data/axes_routiers_fes.csv')
temps_df = pd.read_csv('data/temps_trajet_fes.csv')

print("Axes Routiers :")
print(axes_df.head())

print("\nTemps de Trajet :")
print(temps_df.head())
