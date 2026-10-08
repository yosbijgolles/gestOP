# test_distance.py
from distance import matriz_distancias
coords = [(-5.19, -80.63), (-5.20, -80.62), (-5.16, -80.55)]  # cochera, cont, botadero
m = matriz_distancias(coords)
for row in m: print(row)
