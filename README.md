# Monchito Game Library

Aplicación Angular para gestionar tu colección personal de videojuegos. Permite registrar cada juego con su consola, precio, tienda, condición, estado de completado, platino y valoración personal.

---

## Demo

Desplegada en Vercel. Ver `docs/deploy/VERCEL_DEPLOY.md` para detalles de configuración.

---

## Características

- Autenticación con Supabase (email/contraseña)
- Catálogo personal con virtual scroll (renderiza solo lo visible, soporta colecciones de cualquier tamaño)
- Filtros por consola, tienda, estado y favoritos — instantáneos al estar en memoria
- Ordenación por título, precio y valoración
- Estadísticas en tiempo real: juegos, gasto total y valoración media
- Búsqueda de juegos del catálogo RAWG para rellenar portada y metadatos
- Formulario de juego con soporte para entradas manuales y desde catálogo
- Reposicionamiento de portada por juego (punto focal configurable en la card)
- Recorte de avatar y banner de perfil
- Panel de administración (`/management`): gestión de usuarios, tiendas y audit log
- Tema claro/oscuro con Angular Material 3
- Navegación Rail (desktop) y Bottom Navigation (móvil)
- Soporte multilenguaje (ES/EN) con Transloco

---

## Tecnologías

- Angular 21 + Signals + Control Flow (`@for`, `@if`)
- Angular Material 3 (MD3)
- Angular CDK Virtual Scroll
- Supabase (PostgreSQL + Auth + RLS)
- Dexie (IndexedDB — caché local)
- Transloco (i18n)
- SCSS con design tokens de Material

---

## Scripts

```bash
# Desarrollo
npm install
npm start

# Build producción
npm run build

# Deploy a GitHub Pages (Unix / Windows)
npm run deploy:unix
npm run deploy:windows

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
