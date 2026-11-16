# Fuentes posibles para conectar el lector

Proyecto: C:\Users\martin\Desktop\VSC\APPS\avatares

## Top archivos candidatos

### app\page.tsx

Puntuación: 59

```txt
Línea 5 | book | import BookUploadArea from '@/components/BookUploadArea';
Línea 7 | content | const contentTypes = [
Línea 8 | libro | 'Libro',
Línea 9 | libro | 'Resumen de libro',
Línea 18 | narration | const narrationModes = [
Línea 29 | avatar | const avatars = [
Línea 51 | libro | role: 'Ideal para novelas, cuentos y libros dramáticos.',
Línea 67 | libro | contentType: 'Libro',
Línea 67 | content | contentType: 'Libro',
Línea 69 | narration | narrationMode: 'Narración seria',
Línea 71 | avatar | avatar: 'presentador',
Línea 81 | avatar | const selectedAvatar = useMemo(() => {
```

### components\BookUploadArea.tsx

Puntuación: 41

```txt
Línea 1 | book | // components/BookUploadArea.tsx
Línea 6 | book | type UploadedBook = {
Línea 18 | book | export default function BookUploadArea() {
Línea 19 | book | const [books, setBooks] = useState<UploadedBook[]>([]);
Línea 19 | books | const [books, setBooks] = useState<UploadedBook[]>([]);
Línea 26 | pdf | 'application/pdf',
Línea 27 | epub | 'application/epub+zip',
Línea 32 | book | const selectedBooks = Array.from(files)
Línea 32 | books | const selectedBooks = Array.from(files)
Línea 33 | epub | .filter((file) => allowedTypes.includes(file.type) || file.name.endsWith('.epub'))
Línea 38 | libro | type: file.type || 'Archivo de libro',
Línea 41 | book | setBooks((current) => [...selectedBooks, ...current]);
```

### README.md

Puntuación: 41

```txt
Línea 1 | avatar | # Avatares
Línea 3 | avatar | Quiero crear una app web profesional llamada **AvatarNarrador AI**.
Línea 6 | libro | Crear una plataforma donde el usuario pueda generar avatares parlantes para narrar libros propios, resúmenes, noticias, artículos, textos cortos, guiones educativos o contenido promocional.
Línea 6 | contenido | Crear una plataforma donde el usuario pueda generar avatares parlantes para narrar libros propios, resúmenes, noticias, artículos, textos cortos, guiones educativos o contenido promocional.
Línea 6 | avatar | Crear una plataforma donde el usuario pueda generar avatares parlantes para narrar libros propios, resúmenes, noticias, artículos, textos cortos, guiones educativos o contenido promocional.
Línea 8 | avatar | La app debe permitir que el usuario escriba o pegue un texto, seleccione un avatar, elija una voz, genere una narración y vea un video preview del avatar hablando.
Línea 40 | avatar | 5. Galería de avatares
Línea 46 | avatar | Debe explicar que la plataforma permite crear videos narrados con avatares para:
Línea 48 | libro | * Libros
Línea 49 | libro | * Resúmenes de libros
Línea 58 | avatar | “Convierte tus textos en videos narrados por avatares inteligentes”
Línea 61 | libro | “Crea narraciones profesionales para libros, noticias, resúmenes y contenido educativo usando avatares que hablan.”
```

### DIAGNOSTICO_INICIAR_LECTURA.md

Puntuación: 35

```txt
Línea 1 | lectura | # Diagnóstico real: Iniciar lectura
Línea 3 | avatar | Proyecto: C:\Users\martin\Desktop\VSC\APPS\avatares
Línea 8 | lectura | ✅ button: existe -> components\iniciar-lectura-button.tsx
Línea 9 | lectura | ✅ floating: existe -> components\iniciar-lectura-floating-button.tsx
Línea 10 | slug | ✅ reader: existe -> app\reader\[slug]\page.tsx
Línea 10 | reader | ✅ reader: existe -> app\reader\[slug]\page.tsx
Línea 19 | lectura | <IniciarLecturaFloatingButton: 592
Línea 29 | lectura | ✅ Renderiza IniciarLecturaFloatingButton
Línea 42 | lectura | 4: import { IniciarLecturaFloatingButton } from "../components/iniciar-lectura-floating-button";
Línea 47 | avatar | 9:   title: "AvatarNarrador AI",
Línea 49 | libro | 11:     "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
Línea 49 | contenido | 11:     "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
```

### components\iniciar-lectura-button.tsx

Puntuación: 16

```txt
Línea 5 | lectura | type IniciarLecturaButtonProps = {
Línea 6 | slug | slug?: string | null;
Línea 19 | lectura | export function IniciarLecturaButton({
Línea 20 | slug | slug = "lectura-demo",
Línea 20 | lectura | slug = "lectura-demo",
Línea 24 | lectura | }: IniciarLecturaButtonProps) {
Línea 25 | slug | const safeSlug = encodeURIComponent(slug || "lectura-demo");
Línea 25 | lectura | const safeSlug = encodeURIComponent(slug || "lectura-demo");
Línea 29 | slug | let href = `/reader/${safeSlug}`;
Línea 29 | reader | let href = `/reader/${safeSlug}`;
Línea 32 | slug | href = `/catalog/${safeSlug}/preview`;
Línea 36 | slug | href = `/checkout?slug=${safeSlug}`;
```

### app\reader\[slug]\page.tsx

Puntuación: 9

```txt
Línea 1 | reader | export default function ReaderPage() {
Línea 42 | lectura | Lectura iniciada
Línea 53 | contenido | El lector está listo. Aquí se cargará el contenido real del proyecto:
Línea 54 | libro | libro, capítulo, PDF, EPUB, audio o narración con avatar.
Línea 54 | pdf | libro, capítulo, PDF, EPUB, audio o narración con avatar.
Línea 54 | epub | libro, capítulo, PDF, EPUB, audio o narración con avatar.
Línea 54 | audio | libro, capítulo, PDF, EPUB, audio o narración con avatar.
Línea 54 | avatar | libro, capítulo, PDF, EPUB, audio o narración con avatar.
Línea 67 | lectura | Próximo paso: conectar esta pantalla con la fuente real de lectura.
```

### app\layout.tsx

Puntuación: 7

```txt
Línea 4 | lectura | import { IniciarLecturaFloatingButton } from "../components/iniciar-lectura-floating-button";
Línea 9 | avatar | title: "AvatarNarrador AI",
Línea 11 | libro | "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
Línea 11 | contenido | "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
Línea 11 | avatar | "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
Línea 11 | narracion | "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
Línea 23 | lectura | <IniciarLecturaFloatingButton />
```

### components\iniciar-lectura-floating-button.tsx

Puntuación: 6

```txt
Línea 4 | lectura | import { IniciarLecturaButton } from "./iniciar-lectura-button";
Línea 6 | lectura | export function IniciarLecturaFloatingButton() {
Línea 9 | reader | if (pathname.startsWith("/reader")) {
Línea 24 | slug | <IniciarLecturaButton slug="lectura-demo" hasAccess={true} />
Línea 24 | lectura | <IniciarLecturaButton slug="lectura-demo" hasAccess={true} />
Línea 29 | lectura | export default IniciarLecturaFloatingButton;
```

### package-lock.json

Puntuación: 4

```txt
Línea 2 | avatar | "name": "avatares",
Línea 8 | avatar | "name": "avatares",
Línea 4544 | pdf | "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
Línea 4858 | pdf | "integrity": "sha512-pyFS63ptit/P5WqUkt+UUfe+4oevH+bFeIiPPdfb0pFeYEu/1ELnJu5l+5EcTKYL5M7zaAa7S8ddywgXypqKCw==",
```

### .vacoder-audit\snapshot-before.json

Puntuación: 1

```txt
Línea 101 | book | "Path":  "components\\BookUploadArea.tsx",
```

### app\admin\page.tsx

Puntuación: 1

```txt
Línea 13 | avatar | <Navbar name="Avatares" showAdmin showAuth={true} />
```

### app\api\health\route.ts

Puntuación: 1

```txt
Línea 6 | avatar | service: 'avatares',
```

### app\dashboard\page.tsx

Puntuación: 1

```txt
Línea 9 | avatar | name="Avatares"
```

### app\login\page.tsx

Puntuación: 1

```txt
Línea 7 | avatar | <Navbar name="Avatares" showAdmin={true} showAuth />
```

### middleware.ts

Puntuación: 1

```txt
Línea 5 | avatar | response.headers.set('x-vacoder-app', 'avatares');
```

### package.json

Puntuación: 1

```txt
Línea 2 | avatar | "name": "avatares",
```
