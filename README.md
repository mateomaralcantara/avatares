# Avatares
  
  Quiero crear una app web profesional llamada **AvatarNarrador AI**.

Objetivo general:
Crear una plataforma donde el usuario pueda generar avatares parlantes para narrar libros propios, resúmenes, noticias, artículos, textos cortos, guiones educativos o contenido promocional.

La app debe permitir que el usuario escriba o pegue un texto, seleccione un avatar, elija una voz, genere una narración y vea un video preview del avatar hablando.

Tipo de app:
SaaS / Web App moderna.

Stack:
Next.js App Router, React, TypeScript, CSS moderno, Supabase-ready.

Diseño:

* Interfaz moderna, premium y fácil de usar.
* Colores principales: azul oscuro, rojo elegante, blanco y gris claro.
* Diseño responsive para celular y computadora.
* Panel limpio tipo estudio de producción.
* Estética profesional, tecnológica y creativa.

Paleta:

* Azul oscuro: #0B1F3A
* Azul medio: #123B6D
* Rojo principal: #D72638
* Rojo hover: #A91E2C
* Blanco: #FFFFFF
* Gris claro: #F5F7FA
* Texto oscuro: #1F2937

Páginas principales:

1. Landing page
2. Dashboard
3. Crear narración
4. Biblioteca de proyectos
5. Galería de avatares
6. Historial de videos
7. Configuración
8. Admin básico

Landing page:
Debe explicar que la plataforma permite crear videos narrados con avatares para:

* Libros
* Resúmenes de libros
* Noticias
* Artículos
* Clases
* Guiones de YouTube
* Promociones
* Mensajes institucionales

Título principal:
“Convierte tus textos en videos narrados por avatares inteligentes”

Subtítulo:
“Crea narraciones profesionales para libros, noticias, resúmenes y contenido educativo usando avatares que hablan.”

Botón principal:
“Crear mi primera narración”

Dashboard:
Debe mostrar:

* Total de proyectos creados
* Narraciones generadas
* Videos exportados
* Avatares disponibles
* Últimos proyectos
* Botón para crear nueva narración

Módulo Crear narración:
Debe tener un formulario con estos campos:

1. Título del proyecto

2. Tipo de contenido:

   * Libro
   * Resumen de libro
   * Noticia
   * Artículo
   * Guion de YouTube
   * Clase educativa
   * Promoción
   * Otro

3. Texto o guion:
   Un textarea grande donde el usuario pueda pegar el contenido.

4. Modo de narración:

   * Narración seria
   * Narración emocional
   * Narración periodística
   * Narración educativa
   * Narración dramática
   * Narración comercial

5. Duración deseada:

   * 30 segundos
   * 1 minuto
   * 3 minutos
   * 5 minutos
   * Personalizada

6. Avatar:
   Mostrar tarjetas de avatares ficticios:

   * Presentador profesional
   * Narradora educativa
   * Periodista de noticias
   * Maestro explicador
   * Ejecutivo corporativo
   * Narrador literario

7. Voz:

   * Masculina profunda
   * Masculina juvenil
   * Femenina profesional
   * Femenina cálida
   * Voz periodística
   * Voz narrativa

8. Idioma:

   * Español
   * Inglés
   * Francés
   * Portugués

9. Botones:

   * Generar guion optimizado
   * Generar narración
   * Crear video preview
   * Guardar proyecto

Resultado:
Después de generar, mostrar una pantalla de preview con:

* Avatar seleccionado
* Texto narrado
* Estado del proyecto
* Duración estimada
* Botón reproducir
* Botón exportar MP4
* Botón editar texto
* Botón cambiar avatar
* Botón cambiar voz

Importante:
En esta primera versión no es obligatorio conectar una API real de video, pero la app debe quedar preparada para conectar APIs como:

* Text to Speech
* Avatar video generation
* Lip sync
* Exportación MP4
* Almacenamiento en Supabase

Crear una arquitectura preparada para producción:

* Separar tipos en /types
* Separar utilidades en /lib
* Crear componentes reutilizables
* Crear datos mock temporales para avatares, voces y proyectos
* Dejar comentarios claros donde luego se conectarán APIs reales

Base de datos Supabase-ready:
Crear esquema SQL para:

1. users/profiles
2. avatars
3. voices
4. narration_projects
5. generated_videos

Campos sugeridos para narration_projects:

* id
* user_id
* title
* content_type
* original_text
* optimized_script
* narration_style
* selected_avatar
* selected_voice
* language
* duration
* status
* video_url
* created_at
* updated_at

Estados del proyecto:

* Draft
* Script generado
* Narración generada
* Video en proceso
* Video listo
* Error

Panel admin:
Debe permitir ver:

* Usuarios
* Proyectos creados
* Videos generados
* Estado de generación
* Avatares disponibles
* Voces disponibles

Reglas importantes:

1. No crear una app falsa vacía.
2. Debe sentirse como una plataforma real.
3. No usar dependencias innecesarias.
4. No usar “latest” en package.json.
5. No romper el build.
6. No meter prompts largos dentro de metadata.
7. No crear pagos todavía.
8. No crear autenticación obligatoria todavía, solo dejarla Supabase-ready.
9. No clonar voces o rostros de personas reales sin consentimiento.
10. Incluir advertencia de derechos de autor: el usuario debe usar textos propios, autorizados o resúmenes permitidos.

Componentes sugeridos:

* Navbar
* HeroSection
* FeatureGrid
* AvatarCard
* VoiceSelector
* NarrationForm
* ProjectPreview
* VideoPreviewMock
* DashboardStats
* ProjectTable
* AdminPanel
* StatusBadge

Rutas:

* /
* /dashboard
* /create
* /projects
* /avatars
* /admin
* /api/health
* /api/narrations
* /api/videos

API mock:
Crear endpoints simulados:

* POST /api/narrations para guardar una narración
* POST /api/videos para simular generación de video
* GET /api/health para verificar estado de la app

El endpoint de generación debe devolver una respuesta mock como:
{
"ok": true,
"status": "video_ready",
"videoUrl": "/mock/avatar-video.mp4"
}

La app debe incluir una sección donde se vea claro que próximamente se conectará con APIs reales de avatar y voz.

Validación final:
Después de crear la app:

1. Ejecutar npm install.
2. Ejecutar npm run typecheck.
3. Ejecutar npm run build.
4. Corregir cualquier error.
5. Ejecutar npm run dev.
6. Verificar localhost.
7. No declarar la app lista hasta que compile y funcione sin errores.
  
  ## Stack
  
  - Next.js App Router
- React
- TypeScript
- Supabase-ready
  
  ## Rutas
  
  - /
- /dashboard
- /login
- /admin
- /api/health
  
  ## Comandos
  
  ```bash
  npm install
  npm run build
  npm run dev
  ```
  
  ## Variables de entorno
  
  Copia `.env.example` a `.env.local` y completa los valores reales.
  
  ## Nota de producción
  
  Antes de producción revisa seguridad, autenticación, políticas RLS, permisos de admin y manejo de errores.
  