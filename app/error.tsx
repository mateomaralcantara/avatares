"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main role="alert" style={{ padding: 32 }}>
      <h1>No pudimos completar la operaciÃ³n</h1>
      <p>El incidente fue aislado. Puedes volver a intentarlo.</p>
      <button type="button" onClick={reset}>Reintentar</button>
    </main>
  );
}
