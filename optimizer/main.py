from fastapi import FastAPI
from models import OptimizeRequest, OptimizeResponse, RutaOut
from distance import matriz_distancias
from solver import resolver_cvrp, baseline_vecino_mas_cercano

app = FastAPI(title="gestOP Optimizer", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest):
    contenedores = req.contenedores
    vehiculos = req.vehiculos
    C = len(contenedores)
    V = len(vehiculos)

    if C == 0 or V == 0:
        return OptimizeResponse(
            rutas=[],
            no_asignados=[c.id for c in contenedores],
            km_total=0.0,
            km_baseline=0.0,
        )

    # Coords: cochera, contenedores..., botadero x V
    coords = [(req.deposito.lat, req.deposito.lng)]
    coords += [(c.lat, c.lng) for c in contenedores]
    coords += [(req.botadero.lat, req.botadero.lng)] * V

    matriz = matriz_distancias(coords)

    demandas = [0.0] + [c.volumen_m3 for c in contenedores] + [0.0] * V
    capacidades = [v.capacidad_m3 for v in vehiculos]

    res = resolver_cvrp(
        matriz=matriz,
        demandas=demandas,
        capacidades=capacidades,
        num_vehiculos=V,
        num_contenedores=C,
        time_limit_s=3,
    )

    if res is None:
        return OptimizeResponse(
            rutas=[],
            no_asignados=[c.id for c in contenedores],
            km_total=0.0,
            km_baseline=0.0,
        )

    rutas_out = []
    for r in res["rutas"]:
        ids = [contenedores[i - 1].id for i in r["secuencia"]]
        rutas_out.append(
            RutaOut(
                vehiculo_id=vehiculos[r["vehiculo_idx"]].id,
                secuencia=ids,
                distancia_m=r["distancia_m"],
                geometria=None,
            )
        )

    no_asignados_ids = [contenedores[i - 1].id for i in res["no_asignados"]]
    km_total = res["km_total_m"] / 1000.0

    baseline_m = baseline_vecino_mas_cercano(matriz, demandas, capacidades, C, V)
    km_baseline = baseline_m / 1000.0

    return OptimizeResponse(
        rutas=rutas_out,
        no_asignados=no_asignados_ids,
        km_total=round(km_total, 2),
        km_baseline=round(km_baseline, 2),
    )
