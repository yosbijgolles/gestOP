# ---- Builder stage ----
FROM python:3.11-slim AS builder

# Instala uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copia solo lo necesario para resolver dependencias
COPY pyproject.toml uv.lock ./

# Instala dependencias en un venv aislado
RUN uv sync --frozen --no-dev

# ---- Runtime stage ----
FROM python:3.11-slim

WORKDIR /app

# Copia el venv del builder
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copia el código
COPY . .

# Fly inyecta $PORT; uvicorn debe escuchar en 0.0.0.0
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
