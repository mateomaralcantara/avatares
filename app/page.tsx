'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import BookUploadArea from '@/components/BookUploadArea';

const contentTypes = [
  'Libro',
  'Resumen de libro',
  'Noticia',
  'Artículo',
  'Guion de YouTube',
  'Clase educativa',
  'Promoción',
  'Otro',
];

const narrationModes = [
  'Narración seria',
  'Narración emocional',
  'Narración periodística',
  'Narración educativa',
  'Narración dramática',
  'Narración comercial',
];

const durations = ['30 segundos', '1 minuto', '3 minutos', '5 minutos', 'Personalizada'];

const avatars = [
  {
    id: 'presentador',
    name: 'Presentador profesional',
    role: 'Ideal para videos corporativos y explicaciones serias.',
    icon: '🎙️',
  },
  {
    id: 'narradora',
    name: 'Narradora educativa',
    role: 'Perfecta para clases, tutoriales y resúmenes.',
    icon: '📚',
  },
  {
    id: 'periodista',
    name: 'Periodista de noticias',
    role: 'Pensada para análisis, boletines y actualidad.',
    icon: '📰',
  },
  {
    id: 'literario',
    name: 'Narrador literario',
    role: 'Ideal para novelas, cuentos y libros dramáticos.',
    icon: '🎭',
  },
];

const voices = [
  'Masculina profunda',
  'Masculina juvenil',
  'Femenina profesional',
  'Femenina cálida',
  'Voz periodística',
  'Voz narrativa',
];

const initialForm = {
  title: '',
  contentType: 'Libro',
  text: '',
  narrationMode: 'Narración seria',
  duration: '1 minuto',
  avatar: 'presentador',
  voice: 'Masculina profunda',
  language: 'Español',
};

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [generatedScript, setGeneratedScript] = useState('');
  const [projectStatus, setProjectStatus] = useState('Draft');

  const selectedAvatar = useMemo(() => {
    return avatars.find((avatar) => avatar.id === form.avatar) ?? avatars[0];
  }, [form.avatar]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateScript() {
    const title = form.title.trim() || 'Narración sin título';
    const baseText = form.text.trim() || 'Aquí irá el contenido principal de la narración.';

    setGeneratedScript(
      `Hola, bienvenido. Hoy presentamos: ${title}. ` +
        `Esta es una narración en modo ${form.narrationMode.toLowerCase()} sobre ${form.contentType.toLowerCase()}. ` +
        `${baseText} ` +
        'Gracias por acompañarnos. Esta pieza fue preparada para ser convertida en video con avatar inteligente.',
    );

    setProjectStatus('Script generado');
  }

  function generateVideoPreview() {
    if (!generatedScript) {
      generateScript();
    }

    setProjectStatus('Video listo');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    generateVideoPreview();
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.badge}>AvatarNarrador AI</p>
          <h1 style={styles.title}>
            Convierte tus textos en videos narrados por avatares inteligentes
          </h1>
          <p style={styles.subtitle}>
            Crea narraciones profesionales para libros, noticias, resúmenes y contenido educativo
            usando avatares que hablan.
          </p>
          <BookUploadArea />
          <div style={styles.heroActions}>
            <a href="#crear" style={styles.primaryButton}>
              Crear mi primera narración
            </a>
            <a href="#preview" style={styles.secondaryButton}>
              Ver preview
            </a>
          </div>
        </div>

        <div style={styles.heroCard}>
          <div style={styles.avatarCircle}>{selectedAvatar.icon}</div>
          <h2 style={styles.cardTitle}>{selectedAvatar.name}</h2>
          <p style={styles.cardText}>{selectedAvatar.role}</p>
          <div style={styles.statusPill}>{projectStatus}</div>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <strong>12</strong>
          <span>Avatares disponibles</span>
        </div>
        <div style={styles.statCard}>
          <strong>6</strong>
          <span>Voces preparadas</span>
        </div>
        <div style={styles.statCard}>
          <strong>4</strong>
          <span>Idiomas soportados</span>
        </div>
        <div style={styles.statCard}>
          <strong>Mock</strong>
          <span>Video preview listo</span>
        </div>
      </section>

      <section id="crear" style={styles.builderSection}>
        <div style={styles.sectionHeader}>
          <p style={styles.badge}>Estudio de producción</p>
          <h2 style={styles.sectionTitle}>Crear narración</h2>
          <p style={styles.sectionText}>
            Escribe o pega tu texto, selecciona avatar, voz, estilo y genera un preview simulado.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Título del proyecto
            <input
              style={styles.input}
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Ej: Resumen del capítulo 1"
            />
          </label>

          <div style={styles.twoColumns}>
            <label style={styles.label}>
              Tipo de contenido
              <select
                style={styles.input}
                value={form.contentType}
                onChange={(event) => updateField('contentType', event.target.value)}
              >
                {contentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Modo de narración
              <select
                style={styles.input}
                value={form.narrationMode}
                onChange={(event) => updateField('narrationMode', event.target.value)}
              >
                {narrationModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
          </div>

          <label style={styles.label}>
            Texto o guion
            <textarea
              style={styles.textarea}
              value={form.text}
              onChange={(event) => updateField('text', event.target.value)}
              placeholder="Pega aquí el texto del libro, resumen, noticia o guion..."
            />
          </label>

          <div style={styles.twoColumns}>
            <label style={styles.label}>
              Duración deseada
              <select
                style={styles.input}
                value={form.duration}
                onChange={(event) => updateField('duration', event.target.value)}
              >
                {durations.map((duration) => (
                  <option key={duration}>{duration}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Voz
              <select
                style={styles.input}
                value={form.voice}
                onChange={(event) => updateField('voice', event.target.value)}
              >
                {voices.map((voice) => (
                  <option key={voice}>{voice}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={styles.avatarGrid}>
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                style={{
                  ...styles.avatarCard,
                  borderColor: form.avatar === avatar.id ? '#D72638' : '#D8DEE9',
                  background: form.avatar === avatar.id ? '#FFF4F5' : '#FFFFFF',
                }}
                onClick={() => updateField('avatar', avatar.id)}
              >
                <span style={styles.avatarIcon}>{avatar.icon}</span>
                <strong>{avatar.name}</strong>
                <small>{avatar.role}</small>
              </button>
            ))}
          </div>

          <div style={styles.formActions}>
            <button type="button" style={styles.secondaryAction} onClick={generateScript}>
              Generar guion optimizado
            </button>
            <button type="submit" style={styles.primaryAction}>
              Crear video preview
            </button>
          </div>
        </form>
      </section>

      <section id="preview" style={styles.previewSection}>
        <div style={styles.videoMock}>
          <div style={styles.avatarCircleLarge}>{selectedAvatar.icon}</div>
          <p style={styles.videoLabel}>Preview del avatar</p>
          <h3>{selectedAvatar.name}</h3>
          <p>{form.voice}</p>
        </div>

        <div style={styles.previewPanel}>
          <p style={styles.badge}>Resultado</p>
          <h2 style={styles.sectionTitle}>Estado: {projectStatus}</h2>
          <p style={styles.sectionText}>
            Duración estimada: {form.duration}. Idioma: {form.language}.
          </p>

          <div style={styles.scriptBox}>
            {generatedScript || 'Genera un guion para ver aquí el texto optimizado.'}
          </div>

          <div style={styles.mockApiBox}>
            <strong>API mock preparada:</strong>
            <pre style={styles.pre}>
              {JSON.stringify(
                {
                  ok: true,
                  status: 'video_ready',
                  videoUrl: '/mock/avatar-video.mp4',
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </section>

      <section style={styles.warningBox}>
        <strong>Uso responsable:</strong> usa textos propios, autorizados o resúmenes permitidos.
        No clones voces ni rostros de personas reales sin consentimiento.
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F5F7FA',
    color: '#1F2937',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 0.7fr)',
    gap: 32,
    padding: '72px 7vw 40px',
    background: 'linear-gradient(135deg, #0B1F3A 0%, #123B6D 65%, #D72638 100%)',
    color: '#FFFFFF',
  },
  heroContent: {
    maxWidth: 820,
  },
  badge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: 999,
    background: 'rgba(215, 38, 56, 0.12)',
    color: '#D72638',
    fontWeight: 800,
    letterSpacing: 0.4,
    margin: 0,
  },
  title: {
    fontSize: 'clamp(2.4rem, 6vw, 5rem)',
    lineHeight: 1,
    margin: '20px 0',
  },
  subtitle: {
    fontSize: '1.15rem',
    lineHeight: 1.7,
    maxWidth: 720,
    color: 'rgba(255,255,255,0.88)',
  },
  heroActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 28,
  },
  primaryButton: {
    padding: '14px 22px',
    borderRadius: 14,
    background: '#D72638',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: 800,
  },
  secondaryButton: {
    padding: '14px 22px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.12)',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: 800,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  heroCard: {
    background: '#FFFFFF',
    color: '#1F2937',
    borderRadius: 28,
    padding: 28,
    boxShadow: '0 24px 70px rgba(0,0,0,0.25)',
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: '#F5F7FA',
    fontSize: 38,
  },
  avatarCircleLarge: {
    width: 140,
    height: 140,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: '#FFFFFF',
    fontSize: 64,
    margin: '0 auto 20px',
  },
  cardTitle: {
    margin: '20px 0 8px',
    color: '#0B1F3A',
  },
  cardText: {
    lineHeight: 1.6,
    color: '#4B5563',
  },
  statusPill: {
    marginTop: 18,
    display: 'inline-flex',
    padding: '10px 14px',
    borderRadius: 999,
    background: '#0B1F3A',
    color: '#FFFFFF',
    fontWeight: 800,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
    padding: '28px 7vw',
  },
  statCard: {
    background: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    boxShadow: '0 12px 34px rgba(15, 23, 42, 0.08)',
    display: 'grid',
    gap: 8,
  },
  builderSection: {
    padding: '40px 7vw',
  },
  sectionHeader: {
    maxWidth: 760,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: '2.2rem',
    color: '#0B1F3A',
    margin: '14px 0 10px',
  },
  sectionText: {
    color: '#4B5563',
    lineHeight: 1.7,
  },
  form: {
    background: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.09)',
    display: 'grid',
    gap: 18,
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  label: {
    display: 'grid',
    gap: 8,
    fontWeight: 800,
    color: '#0B1F3A',
  },
  input: {
    width: '100%',
    border: '1px solid #D8DEE9',
    borderRadius: 14,
    padding: '13px 14px',
    fontSize: 16,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    minHeight: 170,
    border: '1px solid #D8DEE9',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    resize: 'vertical',
    outline: 'none',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
  },
  avatarCard: {
    border: '2px solid #D8DEE9',
    borderRadius: 20,
    padding: 18,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'grid',
    gap: 8,
    color: '#1F2937',
  },
  avatarIcon: {
    fontSize: 32,
  },
  formActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryAction: {
    border: 0,
    background: '#D72638',
    color: '#FFFFFF',
    padding: '14px 20px',
    borderRadius: 14,
    fontWeight: 900,
    cursor: 'pointer',
  },
  secondaryAction: {
    border: '1px solid #0B1F3A',
    background: '#FFFFFF',
    color: '#0B1F3A',
    padding: '14px 20px',
    borderRadius: 14,
    fontWeight: 900,
    cursor: 'pointer',
  },
  previewSection: {
    padding: '40px 7vw',
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 0.8fr) minmax(0, 1.2fr)',
    gap: 24,
  },
  videoMock: {
    borderRadius: 28,
    padding: 32,
    textAlign: 'center',
    background: 'linear-gradient(135deg, #0B1F3A, #123B6D)',
    color: '#FFFFFF',
    minHeight: 360,
    display: 'grid',
    placeItems: 'center',
  },
  videoLabel: {
    color: 'rgba(255,255,255,0.78)',
    margin: 0,
  },
  previewPanel: {
    background: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.09)',
  },
  scriptBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    background: '#F5F7FA',
    lineHeight: 1.7,
    color: '#1F2937',
  },
  mockApiBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    background: '#0B1F3A',
    color: '#FFFFFF',
  },
  pre: {
    whiteSpace: 'pre-wrap',
    color: '#FFFFFF',
    marginBottom: 0,
  },
  warningBox: {
    margin: '20px 7vw 60px',
    padding: 20,
    borderRadius: 20,
    background: '#FFF4F5',
    color: '#7F1D1D',
    border: '1px solid rgba(215, 38, 56, 0.25)',
  },
};