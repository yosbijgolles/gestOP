from pydantic import BaseModel
from typing import List, Optional


class Punto(BaseModel):
    lat: float
    lng: float


class Vehiculo(BaseModel):
    id: str
    capacidad_m3: float


class Contenedor(BaseModel):
    id: str
    lat: float
    lng: float
    volumen_m3: float


class OptimizeRequest(BaseModel):
    deposito: Punto
    botadero: Punto
    vehiculos: List[Vehiculo]
    contenedores: List[Contenedor]


class RutaOut(BaseModel):
    vehiculo_id: str
    secuencia: List[str]
    distancia_m: int
    geometria: Optional[dict] = None


class OptimizeResponse(BaseModel):
    rutas: List[RutaOut]
    no_asignados: List[str]
    km_total: float
    km_baseline: float
