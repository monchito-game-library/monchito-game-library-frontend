# Monchito Game Library

Aplicación Angular para gestionar tu colección personal de videojuegos. Permite registrar cada juego con su consola, precio, tienda, condición, estado de completado, platino y valoración personal.

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
- 875 tests unitarios con Vitest (~98 % de cobertura de statements)

---

## Tecnologías

- Angular 21 (zoneless) + Signals + Control Flow (`@for`, `@if`)
- Angular Material 3 (MD3)
- Angular CDK Virtual Scroll
- Angular Service Worker (PWA)
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Dexie (IndexedDB — caché local)
- Transloco (i18n)
- SCSS con design tokens de Material
- Vitest 4.1.0 (unit testing)
- GitHub Actions (CI — bloquea merge si cobertura < 80 %)

---

## Scripts

```bash
# Desarrollo
npm install
npm start

# Tests unitarios
npx ng test

# Tests con informe de cobertura
npx ng test --configuration=coverage

# Build producción
npm run build

# Build para Vercel (genera entornos desde variables de entorno)
npm run vercel-build
```

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

## Créditos

Proyecto creado por [@albertocheca](https://github.com/albertocheca).

---

## Licencia

MIT
