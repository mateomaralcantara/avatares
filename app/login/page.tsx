import { Navbar } from '@/components/navbar';
  
  export default function LoginPage() {
    return (
      <main className="page">
        <div className="shell">
          <Navbar name="Avatares" showAdmin={true} showAuth />
  
          <section className="card form-card">
            <h1 style={{ fontSize: 36 }}>Iniciar sesión</h1>
            <p className="lead" style={{ fontSize: 16 }}>Pantalla base lista para conectar Supabase Auth.</p>
  
            <label>
              Email
              <input className="input" type="email" placeholder="tu@email.com" />
            </label>
  
            <label>
              Contraseña
              <input className="input" type="password" placeholder="********" />
            </label>
  
            <button className="button" type="button">Entrar</button>
          </section>
        </div>
      </main>
    );
  }
  