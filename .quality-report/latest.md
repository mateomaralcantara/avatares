# Reporte de calidad del proyecto

- **Proyecto:** `C:\Users\martin\Desktop\VSC\APPS\avatares`
- **Generado:** 31/7/2026, 3:58:26 p. m.
- **Puntuación:** **4.62/10.0**
- **Porcentaje:** **46.2%**
- **Calificación:** **F**
- **Resultado:** **NO APROBADO**

## Resumen por categoría

| Categoría | Puntuación | Porcentaje |
|---|---:|---:|
| Entorno | 10/10 | 100% |
| Arquitectura | 6.19/10 | 61.9% |
| TypeScript | 0.89/10 | 8.9% |
| Lint | 2/10 | 20% |
| Build | 1.33/10 | 13.3% |
| Pruebas | 3.96/10 | 39.6% |
| Seguridad | 5.83/10 | 58.3% |
| Accesibilidad | 7.14/10 | 71.4% |
| Rendimiento | 7/10 | 70% |
| Producción | 10/10 | 100% |

## Revisiones

| Categoría | Revisión | Estado | Puntos | Detalles |
|---|---|---|---:|---|
| Entorno | package.json válido | PASS | 2/2 | El manifiesto del proyecto es válido. |
| Entorno | Lockfile reproducible | PASS | 1/1 | Detectados: package-lock.json. |
| Entorno | Versión de Node.js | PASS | 2/2 | Instalada: v24.11.1. Engines: >=20.9.0. |
| Entorno | Dependencias instaladas | PASS | 1/1 | node_modules está disponible. |
| Entorno | Repositorio Git | PASS | 1/1 | El proyecto está bajo control de versiones. |
| Entorno | Versión fijada en engines | PASS | 1/1 | engines.node: >=20.9.0. |
| Arquitectura | Router organizado | PASS | 2/2 | Se detectó App Router o Pages Router. |
| Arquitectura | Componentes separados | PASS | 1.5/1.5 | Existe una carpeta de componentes. |
| Arquitectura | Lógica reutilizable separada | PASS | 1/1 | Se detectó una capa lib, services o server. |
| Arquitectura | Tamaño de archivos fuente | WARN | 1/2 | 3 archivo(s) superan 600 líneas. |
| Arquitectura | Respaldos dentro del proyecto | PASS | 1/1 | 0 respaldo(s) internos detectados. |
| Arquitectura | Contenido demo o pendiente | FAIL | 0/1.5 | 30 marcador(es) demo, TODO o FIXME. |
| Arquitectura | Logs de depuración | FAIL | 0/1.5 | 60 console.log o console.debug detectados. |
| TypeScript | Configuración TypeScript | FAIL | 0/2 | tsconfig.json no existe o no se pudo analizar. |
| TypeScript | Modo strict | WARN | 0.5/2 | compilerOptions.strict no está activado. |
| TypeScript | Uso explícito de any | WARN | 0.75/2 | 13 uso(s) potenciales de any. |
| TypeScript | Compilación de tipos | SKIP | 0/8 | No fue posible ejecutar TypeScript por falta de configuración o dependencias. |
| Lint | Configuración ESLint | PASS | 2/2 | Script lint: true. Configuración: true. |
| Lint | Ejecución ESLint | FAIL | 0/8 | npm run lint terminó con errores. |
| Build | Script de compilación | PASS | 2/2 | npm run build está definido. |
| Build | Build de producción | FAIL | 0/11 | npm run build terminó con errores. |
| Build | Advertencias del build | FAIL | 0/2 | 0 advertencia(s) detectadas. |
| Pruebas | Script de pruebas | PASS | 2/2 | npm test está configurado. |
| Pruebas | Archivos de prueba | WARN | 0.75/2 | 1 archivo(s) de prueba detectados. |
| Pruebas | Ejecución de pruebas | FAIL | 0/6 | Las pruebas terminaron con errores. |
| Pruebas | Configuración de cobertura | PASS | 2/2 | Existe configuración de cobertura o test runner. |
| Seguridad | Auditoría de dependencias | FAIL | 1/5 | Total: 4. Críticas: 0. Altas: 4. Moderadas: 0. Bajas: 0. |
| Seguridad | Secretos en código | PASS | 4/4 | 0 coincidencia(s) potenciales. |
| Seguridad | APIs potencialmente peligrosas | WARN | 1/2 | 2 uso(s) de eval, Function o dangerouslySetInnerHTML. |
| Seguridad | Variables privadas fuera de Git | PASS | 1/1 | 0 archivo(s) privados rastreados por Git. |
| Accesibilidad | Texto alternativo | FAIL | 0/2 | 0 de 1 imágenes incluyen alt. |
| Accesibilidad | Botones identificables | PASS | 2/2 | 20 de 20 botones tienen texto o etiqueta. |
| Accesibilidad | Estructura semántica | PASS | 1/1 | 17 landmarks semánticos detectados. |
| Accesibilidad | Atributos ARIA | PASS | 1/1 | 5 atributo(s) ARIA detectados. |
| Accesibilidad | Estados de carga y error | PASS | 1/1 | Se detectaron límites de carga o error. |
| Rendimiento | Optimización de imágenes | WARN | 1/2 | next/image: 1. img nativo: 1. |
| Rendimiento | Activos pesados | PASS | 2/2 | 0 archivo(s) públicos superan 2 MB. |
| Rendimiento | Complejidad de módulos | WARN | 0.5/1 | 3 módulo(s) superan 600 líneas. |
| Rendimiento | Carga diferida | PASS | 1/1 | 3 importación(es) dinámicas detectadas. |
| Rendimiento | Optimización de fuentes | WARN | 0.4/1 | 0 uso(s) de next/font detectados. |
| Producción | Documentación README | PASS | 1/1 | README encontrado. |
| Producción | Plantilla de variables | PASS | 1/1 | Existe una plantilla de variables. |
| Producción | Metadatos SEO | PASS | 1/1 | 1 definición(es) de metadata detectadas. |
| Producción | Páginas de error | PASS | 1/1 | Se detectaron páginas de error. |
| Producción | Integración continua | PASS | 1/1 | Se detectó configuración CI. |

## Mejoras prioritarias

1. **Build de producción:** Corrige todos los errores del build.
2. **Ejecución ESLint:** Ejecuta npm run lint y corrige los errores.
3. **Ejecución de pruebas:** Corrige las pruebas antes de desplegar.
4. **Auditoría de dependencias:** Ejecuta npm audit fix y revisa las vulnerabilidades.
5. **Configuración TypeScript:** tsconfig.json no existe o no se pudo analizar.
6. **Advertencias del build:** 0 advertencia(s) detectadas.
7. **Texto alternativo:** 0 de 1 imágenes incluyen alt.
8. **Contenido demo o pendiente:** Elimina contenido temporal.
9. **Logs de depuración:** Usa un logger controlado por entorno.
10. **Modo strict:** Activa strict en tsconfig.json.
11. **Uso explícito de any:** Sustituye any por interfaces, genéricos o unknown.
12. **Archivos de prueba:** 1 archivo(s) de prueba detectados.
13. **Tamaño de archivos fuente:** Divide componentes y servicios demasiado grandes.
14. **APIs potencialmente peligrosas:** 2 uso(s) de eval, Function o dangerouslySetInnerHTML.
15. **Optimización de imágenes:** next/image: 1. img nativo: 1.