import { Navbar } from '@/components/navbar';
  
  const rows = [
    { label: 'Usuarios', value: 'Pendiente' },
    { label: 'Eventos', value: 'Pendiente' },
    { label: 'Seguridad', value: 'Revisar RLS' },
  ];
  
  export default function AdminPage() {
    return (
      <main className="page">
        <div className="shell">
          <Navbar name="Avatares" showAdmin showAuth={true} />
  
          <section className="hero">
            <div className="badge">Admin</div>
            <h1>Panel de administración</h1>
            <p className="lead">Vista base para gestión interna. Protege esta ruta antes de producción.</p>
          </section>
  
          <section className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    );
  }
  