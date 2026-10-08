export default function Home() {
  return (
    <main>
      <h1>GestOP API</h1>
      <p>Servidor web activo. Endpoints disponibles:</p>
      <ul>
        <li>
          <a href="/api/contenedores">GET /api/contenedores</a>
        </li>
        <li>
          <a href="/api/vehiculos">GET /api/vehiculos</a>
        </li>
      </ul>
    </main>
  )
}