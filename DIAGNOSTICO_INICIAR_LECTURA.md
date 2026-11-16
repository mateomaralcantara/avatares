# Diagnóstico real: Iniciar lectura

Proyecto: C:\Users\martin\Desktop\VSC\APPS\avatares

## 1. Archivos

✅ layout: existe -> app\layout.tsx
✅ button: existe -> components\iniciar-lectura-button.tsx
✅ floating: existe -> components\iniciar-lectura-floating-button.tsx
✅ reader: existe -> app\reader\[slug]\page.tsx

## 2. Layout

Posiciones:

```txt
<html: 535
<body: 558
<IniciarLecturaFloatingButton: 592
{children}: 573
</body>: 631
</html>: 643
```

✅ Tiene etiqueta html
✅ Tiene etiqueta body
✅ Tiene cierre body
✅ Tiene cierre html
✅ Renderiza IniciarLecturaFloatingButton
✅ Renderiza children
✅ El botón está dentro del body
✅ children está dentro del body
✅ Solo hay un botón flotante en layout
✅ Solo hay un children en layout

Layout actual:

```tsx
   1: import type { Metadata } from "next";
   2: import type { ReactNode } from "react";
   3: 
   4: import { IniciarLecturaFloatingButton } from "../components/iniciar-lectura-floating-button";
   5: 
   6: import "./globals.css";
   7: 
   8: export const metadata: Metadata = {
   9:   title: "AvatarNarrador AI",
  10:   description:
  11:     "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
  12: };
  13: 
  14: type RootLayoutProps = Readonly<{
  15:   children: ReactNode;
  16: }>;
  17: 
  18: export default function RootLayout({ children }: RootLayoutProps) {
  19:   return (
  20:     <html lang="es">
  21:       <body>
  22:         {children}
  23:         <IniciarLecturaFloatingButton />
  24:       </body>
  25:     </html>
  26:   );
  27: }
```

## 3. Botón

✅ El botón es client component
✅ Usa useRouter
✅ Usa router.push
✅ Tiene ruta reader
✅ Activa loading
⚠️ No encontré setLoading(false). Si falla la navegación, se queda en Abriendo lectura.

Líneas críticas del botón:

```tsx
  27:   const [loading, setLoading] = useState(false);
  33:     setLoading(true);
  35:     const safeSlug = encodeURIComponent(slug || "lectura-demo");
  38:       router.push(`/reader/${safeSlug}`);
  43:       router.push(`/catalog/${safeSlug}/preview`);
  47:     router.push(`/checkout?slug=${safeSlug}`);
  78:       {loading ? "Abriendo lectura..." : "Iniciar lectura"}
```

## 4. Botón flotante

✅ El flotante es client component
⚠️ No usa usePathname
⚠️ No se oculta en reader
⚠️ Todavía usa slug demo lectura-demo

## 5. Reader

✅ Reader exporta default
✅ Reader tiene main
❌ Reader todavía dice Estás leyendo
✅ Reader no muestra lectura-demo

## 6. Prueba HTTP local

✅ Home responde 200, tamaño 22899
✅ Reader responde 200, tamaño 14995

## 7. Conclusión

✅ La ruta reader sí abre. Si visualmente se queda cargando, el problema está en estado loading, hidratación del navegador o duplicados.