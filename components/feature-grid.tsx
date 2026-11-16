import { SectionCard } from '@/components/section-card';
  
  const features = [
    {
      title: 'Arquitectura limpia',
      description: 'Base lista para crecer con rutas, componentes y utilidades separadas.',
    },
    {
      title: 'Producción primero',
      description: 'Incluye health check, variables de entorno y estructura segura.',
    },
    {
      title: 'Lista para integrar',
      description: 'Preparada para Supabase, dashboard, admin y módulos de negocio.',
    },
  ];
  
  export function FeatureGrid() {
    return (
      <section className="grid">
        {features.map((feature) => (
          <SectionCard key={feature.title} {...feature} />
        ))}
      </section>
    );
  }
  