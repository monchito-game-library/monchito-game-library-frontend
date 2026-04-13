# Monchito Game Library

Aplicación Angular para gestionar tu colección personal de videojuegos. Permite registrar cada juego con su consola, precio, tienda, condición, estado de completado, platino y valoración personal.

---

## Índice

- [Demo](#demo)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Scripts](#scripts)
- [Arquitectura](#arquitectura)
- [Notas sobre rendimiento](#notas-sobre-rendimiento)
- [Claude Code — Status line](#claude-code--status-line)
- [Créditos](#créditos)
- [Licencia](#licencia)

---

## Demo

Desplegada en Vercel. Ver `docs/deploy/VERCEL_DEPLOY.md` para detalles de configuración.

---

## Características

- Autenticación con Supabase (email/contraseña)
- Catálogo personal con virtual scroll (renderiza solo lo visible, soporta colecciones de cualquier tamaño)
- Filtros por consola, tienda, estado, formato y favoritos — instantáneos al estar en memoria
- Ordenación por título, precio y valoración
- Estadísticas en tiempo real: juegos, gasto total y valoración media
- Wishlist (`/wishlist`) con prioridad, gasto estimado y links directos a tiendas (Amazon, GAME, CEX, Xtralife)
- Pedidos grupales (`/orders`) con invitación por link, asignación de cantidades y desglose de costes por miembro
- Búsqueda de juegos del catálogo RAWG para rellenar portada y metadatos
- Formulario de juego con sugerencia automática de formato según tienda
- Reposicionamiento de portada por juego (punto focal configurable en la card)
- Recorte de avatar y banner de perfil (implementación propia sin dependencias externas)
- Panel de administración (`/management`): gestión de usuarios, tiendas, protectores y audit log
- Catálogo de protectores/cajas con packs y precios, base para pedidos grupales
- PWA instalable con estrategia de actualización automática en segundo plano
- Tema claro/oscuro con Angular Material 3
- Navegación Rail (desktop) y Bottom Navigation (móvil)
- Soporte multilenguaje (ES/EN) con Transloco
- +1292 tests unitarios con Vitest (~99 % de cobertura de statements)

---

## Tecnologías

- Angular 21 + Signals + Control Flow (`@for`, `@if`)
- Angular Material 3 (MD3)
- Angular CDK Virtual Scroll
- Angular Service Worker (PWA)
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Transloco (i18n)
- SCSS con design tokens de Material
- Vitest 4 (unit testing)
- ESLint 10 + typescript-eslint + angular-eslint
- GitHub Actions (CI — bloquea merge si cobertura < 80 % o el build falla)

---

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/monchito-game-library/monchito-game-library-frontend.git
cd monchito-game-library-frontend
```

2. Instala dependencias:

```bash
npm install
```

3. Crea tu proyecto en [Supabase](https://supabase.com) y configura las variables en `src/environments/environment.ts` (ver `src/environments/environment.example.ts`):

```typescript
export const environment = {
  supabase: {
    url: 'https://<tu-proyecto>.supabase.co',
    anonKey: '<tu-anon-key>'
  },
  rawg: {
    apiUrl: 'https://api.rawg.io/api',
    apiKey: '<tu-rawg-key>'
  }
};
```

4. Ejecuta el schema de base de datos en el SQL Editor de Supabase (`docs/backend/supabase-schema-current.sql`).

5. Inicia el servidor de desarrollo:

```bash
npm start
```

---

## Scripts

| Script | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo en modo `development` |
| `npm run build` | Build de producción |
| `npm test` | Ejecuta todos los tests unitarios una vez |
| `npm run test:watch` | Ejecuta los tests en modo watch (se relanza al cambiar ficheros) |
| `npm run test:coverage` | Ejecuta los tests con informe de cobertura (V8) |
| `npm run test:eslint-rules` | Ejecuta los tests de las reglas ESLint personalizadas |
| `npm run lint` | Analiza el código con ESLint |
| `npm run lint:fix` | Analiza y corrige automáticamente los problemas de ESLint |
| `npm run format` | Formatea todos los ficheros `.ts`, `.html` y `.scss` con Prettier |
| `npm run format:check` | Comprueba el formato sin modificar ficheros |
| `npm run check:unused` | Detecta exports, dependencias y ficheros no usados con Knip |
| `npm run clean:install` | Elimina `node_modules` e instala desde cero |
| `npm run vercel-build` | Build usado por Vercel en producción (genera `environment.ts` desde variables de entorno) |

---

## Arquitectura

```
presentation  →  domain (contratos de repositorio)  →  data (implementaciones Supabase)
                          ↕                                        ↕
                       entities                              data/dtos
```

La capa `presentation` nunca importa directamente de `data`. Los contratos de repositorio viven en `domain/repositories/`.

---

## Notas sobre rendimiento

El repositorio carga todos los juegos del usuario en memoria al iniciar la vista. Supabase tiene un límite por defecto de 1000 filas por query; la implementación pagina automáticamente en lotes de 1000 para soportar colecciones de cualquier tamaño sin cambios en el resto de la app. Los filtros, la búsqueda y la ordenación son operaciones en memoria (instantáneas). El virtual scroll del CDK se encarga de no renderizar más cards de las visibles en pantalla.

---

## Claude Code — Status line

Si usas [Claude Code](https://claude.ai/code) para trabajar en este proyecto, puedes instalar la status line del equipo para ver en todo momento la carpeta, rama git, modelo activo, coste acumulado de la sesión y contexto usado:

```
📁 monchito-game-library  🌿 master  🤖 Claude Sonnet 4.6  💰 $0.08  ▓▓░░░░░░░░ 18%
```

- **Barra de contexto**: muestra el porcentaje de contexto usado. La barra se llena conforme crece la conversación y cambia de color: verde (<40%), amarillo (40-64%), rojo (≥64%). El auto-compact se activa alrededor del 80%.
- **Coste `💰`**: coste acumulado en USD desde que se inició el proceso. Informativo — no refleja lo que pagas con suscripción.

### Instalación

**1. Copia el script:**
```sh
cp scripts/claude-statusline.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

**2. Añade la clave `statusLine` en `~/.claude/settings.json`:**
```json
{
  "statusLine": {
    "command": "~/.claude/statusline-command.sh"
  }
}
```

> Si ya tienes tu propia status line configurada, no es necesario que la cambies.

---

## Créditos

Proyecto creado por [@albertocheca](https://github.com/albertocheca).

---

## Licencia

MIT
