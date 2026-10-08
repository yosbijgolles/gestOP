from ortools.constraint_solver import routing_enums_pb2, pywrapcp
from typing import List, Optional


def resolver_cvrp(matriz, demandas, capacidades, num_vehiculos, num_contenedores, time_limit_s=3):
    """
    Nodos: 0=cochera, 1..C=contenedores, C+1..C+V=botadero duplicado (end por vehículo)
    """
    n = len(matriz)
    C = num_contenedores
    V = num_vehiculos
    starts = [0] * V
    ends = [C + 1 + k for k in range(V)]

    manager = pywrapcp.RoutingIndexManager(n, V, starts, ends)
    routing = pywrapcp.RoutingModel(manager)

    def dist_cb(fi, ti):
        return matriz[manager.IndexToNode(fi)][manager.IndexToNode(ti)]

    transit = routing.RegisterTransitCallback(dist_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(transit)

    escala = 1000
    dem_int = [int(round(d * escala)) for d in demandas]
    caps_int = [int(round(c * escala)) for c in capacidades]

    def dem_cb(fi):
        return dem_int[manager.IndexToNode(fi)]

    dem_idx = routing.RegisterUnaryTransitCallback(dem_cb)
    routing.AddDimensionWithVehicleCapacity(dem_idx, 0, caps_int, True, "Capacidad")

    penalty = 10_000_000
    for c in range(1, C + 1):
        routing.AddDisjunction([manager.NodeToIndex(c)], penalty)

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    params.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    params.time_limit.FromSeconds(time_limit_s)

    sol = routing.SolveWithParameters(params)
    if sol is None:
        return None

    rutas = []
    visitados = set()
    km_total_m = 0

    for k in range(V):
        idx = routing.Start(k)
        secuencia = []
        dist_ruta = 0
        while not routing.IsEnd(idx):
            nodo = manager.IndexToNode(idx)
            if 1 <= nodo <= C:
                secuencia.append(nodo)
                visitados.add(nodo)
            nxt = sol.Value(routing.NextVar(idx))
            dist_ruta += routing.GetArcCostForVehicle(idx, nxt, k)
            idx = nxt
        rutas.append({"vehiculo_idx": k, "secuencia": secuencia, "distancia_m": dist_ruta})
        km_total_m += dist_ruta

    no_asignados = [c for c in range(1, C + 1) if c not in visitados]
    return {"rutas": rutas, "no_asignados": no_asignados, "km_total_m": km_total_m}


def baseline_vecino_mas_cercano(matriz, demandas, capacidades, num_contenedores, num_vehiculos):
    C = num_contenedores
    V = num_vehiculos
    pendientes = set(range(1, C + 1))
    total = 0

    for k in range(V):
        if not pendientes:
            break
        botadero = C + 1 + k
        cap = capacidades[k]
        carga = 0.0
        actual = 0
        while True:
            mejor, mejor_d = None, None
            for c in pendientes:
                if carga + demandas[c] > cap:
                    continue
                d = matriz[actual][c]
                if mejor_d is None or d < mejor_d:
                    mejor, mejor_d = c, d
            if mejor is None:
                break
            total += matriz[actual][mejor]
            actual = mejor
            carga += demandas[mejor]
            pendientes.discard(mejor)
        total += matriz[actual][botadero]

    return total
