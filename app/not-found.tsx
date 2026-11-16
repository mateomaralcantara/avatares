import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: 32 }}>
      <h1>PÃ¡gina no encontrada</h1>
      <p>La direcciÃ³n solicitada no existe o fue movida.</p>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}
