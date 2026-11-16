import type { Metadata } from "next";
import type { ReactNode } from "react";

import { IniciarLecturaFloatingButton } from "../components/iniciar-lectura-floating-button";

import "./globals.css";

export const metadata: Metadata = {
  title: "AvatarNarrador AI",
  description:
    "Crea narraciones con avatares inteligentes para libros, resúmenes, noticias y contenido educativo.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        {children}
        <IniciarLecturaFloatingButton />
      </body>
    </html>
  );
}