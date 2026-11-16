import { Navbar } from '@/components/navbar';
  import { SectionCard } from '@/components/section-card';
  
  export default function DashboardPage() {
    return (
      <main className="page">
        <div className="shell">
          <Navbar
            name="Avatares"
            showAdmin={true}
            showAuth={true}
          />
  
          <section className="hero">
            <div className="badge">Dashboard</div>
            <h1>Panel principal</h1>
            <p className="lead">Centro operativo para controlar módulos, métricas y próximas acciones.</p>
          </section>
  
          <section className="grid">
            <SectionCard title="Estado" description="Base del proyecto lista para conectar datos reales." />
            <SectionCard title="Módulos" description="landing, dashboard, supabase-ready, auth-shell, admin, health-api" />
            <SectionCard title="Siguiente paso" description="Conecta autenticación, base de datos y reglas de negocio." />
          </section>
        </div>
      </main>
    );
  }
  