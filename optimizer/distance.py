import math
from typing import List, Tuple

FACTOR_VIA = 1.3  # Haversine es línea recta; las calles reales suman ~30%


def haversine_m(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    R = 6371000.0
    lat1, lng1 = math.radians(a[0]), math.radians(a[1])
    lat2, lng2 = math.radians(b[0]), math.radians(b[1])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def matriz_distancias(coords: List[Tuple[float, float]], factor_via: float = FACTOR_VIA) -> List[List[int]]:
    n = len(coords)
    m = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            d = int(haversine_m(coords[i], coords[j]) * factor_via)
            m[i][j] = d
            m[j][i] = d
    return m
