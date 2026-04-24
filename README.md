# Monchito Game Library

Aplicación web para gestionar tu colección personal de videojuegos, consolas y mandos. Registra cada pieza con sus datos de compra, estado, valoración y condición; gestiona préstamos y ventas; organiza pedidos grupales con otros coleccionistas; y lleva el seguimiento de tu wishlist con links a tiendas.

---

## Índice

- [Demo](#demo)
- [Qué puedes hacer](#qué-puedes-hacer)
  - [Colección de juegos](#colección-de-juegos)
  - [Consolas y mandos](#consolas-y-mandos)
  - [Wishlist](#wishlist)
  - [Ventas](#ventas)
  - [Pedidos grupales](#pedidos-grupales)
  - [Panel de gestión](#panel-de-gestión)
  - [Ajustes y perfil](#ajustes-y-perfil)
- [Flujos principales](#flujos-principales)
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

## Qué puedes hacer

### Colección de juegos

La sección principal de la app. Toda tu biblioteca en un grid responsivo con virtual scroll, filtros en memoria y estadísticas en tiempo real.

#### Lista de juegos

- **Buscar** por título (instantáneo, en memoria).
- **Filtrar** por plataforma, tienda, estado de juego (backlog / playing / completed / platinum / abandoned / owned), formato (físico / digital), solo favoritos, solo prestados. Los filtros son acumulativos.
- **Ordenar** por fecha de adición, título, precio o valoración personal.
- **Estadísticas** siempre visibles: total de juegos en el filtro activo, juegos con platino y gasto total.
- **Grid adaptativo**: de 2 columnas en móvil hasta 6 en pantallas ultra-anchas.
- **Skeleton loaders** mientras se cargan los datos para no mostrar un canvas vacío.
- **Caché en memoria** para que navegar al detalle y volver no relance la query a Supabase.

Cada card muestra portada (con el punto focal que hayas configurado), plataforma, estado, valoración en estrellas y chips de estado especial:
- 🟦 **Prestado** — aparece con el nombre de la persona a la que lo has prestado.
- 🟨 **A la venta** — aparece con el precio que pides.
- 🏆 **Platino** — icono de copa.
- ❤️ **Favorito** — icono de corazón.

#### Detalle de juego

Desde la card accedes a la página de detalle, que muestra todos los datos personales del juego y agrupa las acciones disponibles:

- **Editar** — abre el formulario con todos los campos prellenados.
- **Eliminar** — con diálogo de confirmación.
- **Gestionar venta** — dos modos: marcar como disponible para vender (con precio deseado) o registrar la venta definitiva (precio final + fecha). Al registrar la venta el juego desaparece de la colección activa.
- **Gestionar préstamo** — formulario inline para prestar a alguien (por nombre) o registrar la devolución.

#### Añadir / editar juego

- **Búsqueda en RAWG**: escribe el título y selecciona el juego del catálogo. Se precarga portada, géneros, rating, plataformas disponibles y metadatos.
- **Juego manual**: si no está en RAWG, puedes añadirlo introduciendo los datos tú mismo.
- **Campos personales**: plataforma (obligatorio), formato, estado, condición, precio, tienda, fecha de compra, valoración 0–10, notas, favorito.
- **Portada**: sube una imagen, recórtala con el editor de recorte integrado y configura el punto focal para que la card muestre siempre la parte más importante.
- **Desde wishlist**: si pulsas "Ya lo tengo" en un item de la wishlist, el formulario se preabre con los datos del item ya cargados.

#### Historial de ventas

Vista de solo lectura de todos los items (juegos, consolas y mandos) que has vendido. Muestra el precio de compra, el precio final y la fecha de venta, con filtro por tipo de item.

---

### Consolas y mandos

Secciones independientes dentro del hub de colección (`/collection/consoles` y `/collection/controllers`), con el mismo patrón: lista → detalle, con alta y edición.

#### Catálogo de hardware

El formulario de alta usa un **selector jerárquico** en tres niveles:

1. **Marca** — autocomplete con Sony, Microsoft y Nintendo.
2. **Modelo** — autocomplete filtrado por marca. El catálogo incluye 73 modelos:
   - Sony: 24 (desde la PlayStation original hasta PS5 Pro, incluyendo portátiles PSP/Vita).
   - Microsoft: 15 (desde el Xbox original hasta Xbox Series X/S y sus variantes 2024).
   - Nintendo: 34 (desde el Color TV-Game de 1977 hasta Nintendo Switch 2).
3. **Edición** — select opcional filtrado por modelo (ej. "Digital Edition", "Final Fantasy XVI Limited Ed.").

Al seleccionar un modelo de consola, la app carga automáticamente sus especificaciones técnicas (año de lanzamiento, tipo de categoría, formato de medios, resolución de vídeo, unidades vendidas en millones).

#### Datos personales del hardware

Independientemente del catálogo, cada pieza de hardware almacena tus datos propios: región (PAL / NTSC / NTSC-J) para consolas, color y compatibilidad para mandos, más condición, precio de compra, tienda, fecha y notas en ambos casos.

---

### Wishlist

Tu lista de juegos que quieres comprar. Pensada para decision-making: sabes cuánto vas a gastar, qué tienes más ganas y dónde comprarlo más barato.

- **Añadir item** — busca un juego en RAWG, selecciónalo y rellena:
  - Plataforma deseada.
  - Prioridad (1–5 estrellas).
  - Precio deseado (opcional, para calcular el gasto estimado).
  - Notas.
- **Editar / eliminar** item con confirmación.
- **"Ya lo tengo"** — mueve el item a la colección en un solo gesto: abre el formulario de juego con los datos del catálogo precargados y elimina el item de la wishlist al guardar.
- **Links de tiendas** — cada card genera automáticamente links de búsqueda directa en Amazon, GAME, CEX, Xtralife y otras, con el título del juego ya en la query y la plataforma deseada si la has especificado.
- **Estadísticas**: total de items, gasto estimado sumando los precios deseados, distribución por prioridad.

En **móvil** la wishlist tiene un flujo dedicado en tres vistas: lista → búsqueda → formulario, sin modales que tapen la pantalla.

---

### Ventas

Centraliza la gestión de todo lo que tienes disponible para vender o ya has vendido, independientemente de si es un juego, una consola o un mando.

- **Pestaña "Disponibles"** — lista de items marcados como disponibles para vender, con el precio que pides. Muestra el valor total del inventario en venta.
- **Pestaña "Vendidos"** — historial de ventas con precio de compra, precio final y fecha. Muestra el total ingresado.
- Filtro por tipo de item: Todos / Juegos / Consolas / Mandos.

Marcar un item como vendido se hace desde su página de detalle (no desde esta vista), que registra el precio final y la fecha y lo mueve automáticamente al historial.

---

### Pedidos grupales

Sistema completo para organizar compras colectivas de productos que se venden en packs (protectores, fundas, cajas para cards, etc.). El propietario crea el pedido, invita a participantes por link, y la app calcula automáticamente qué combinación de packs comprar para satisfacer todas las cantidades pedidas al mínimo coste.

#### Estados del pedido

Un pedido pasa por cinco estados en secuencia:

```
Draft → Selecting Packs → Ordering → Ordered → Received
```

**Draft** — El propietario configura el pedido y añade líneas. Cada línea representa un producto que alguien del grupo quiere, con la cantidad necesaria. Cualquier participante puede ver el pedido.

**Selecting Packs** — El propietario activa el modo de selección. Para cada producto del pedido, el sistema:

1. Suma las cantidades de todos los participantes.
2. Consulta el catálogo de packs disponibles del producto.
3. Ejecuta un algoritmo de optimización (programación dinámica) que encuentra las 3 mejores combinaciones de packs para cubrir la cantidad necesaria al mínimo coste unitario.
4. Muestra un stepper con las sugerencias rankeadas.

El propietario selecciona la opción preferida para cada producto. Las cantidades por usuario se distribuyen proporcionalmente entre las líneas.

**Ordering / Ordered / Received** — El pedido avanza a estado de confirmación, pedido real y recepción.

#### Participar en un pedido

- El propietario comparte un link de invitación (con token temporal).
- Al entrar al link, el usuario se une automáticamente como miembro.
- Cada miembro puede marcar su selección como "lista" cuando haya revisado su parte.
- El propietario ve en todo momento cuántos miembros han confirmado.

#### Costes y desglose

El detalle del pedido incluye un resumen de costes con:
- Subtotal por productos.
- Coste de envío (configurable).
- Comisión de pago (ej. PayPal fee).
- Descuento (cantidad fija o porcentaje).
- **Total final**.

Los cambios en líneas se sincronizan en **tiempo real** entre todos los participantes vía Supabase Realtime.

---

### Panel de gestión

Sección restringida a usuarios con rol `admin`. Acceso desde el nav lateral en desktop.

#### Tiendas

CRUD de las tiendas disponibles como opción en los formularios de juegos, consolas y mandos (Amazon, GAME, CEX, Xtralife, etc.).

#### Protectores

CRUD del catálogo de protectores/fundas disponibles para pedidos grupales. Cada protector tiene nombre, categoría, precio unitario y una lista de packs disponibles (ej. pack de 10 unidades a X€, pack de 50 a Y€).

#### Catálogo de hardware

Gestión completa del catálogo de marcas, modelos y ediciones con navegación por breadcrumbs:

```
Hardware > Sony > PlayStation 5 > Digital Edition
```

Desde `/management/hardware` puedes crear y editar marcas, navegar a los modelos de cada marca y, dentro de cada modelo, gestionar sus ediciones. El formulario de modelo adapta los campos según el tipo (`console` muestra las especificaciones técnicas; `controller` solo las básicas).

#### Usuarios

Vista de los usuarios registrados en la plataforma con su email, nombre y rol. Permite cambiar el rol de `user` a `admin`.

#### Audit Log

Historial de cambios en la plataforma: quién modificó qué y cuándo. Solo lectura. Filtrable por usuario, entidad y tipo de acción.

---

### Ajustes y perfil

- **Nombre de usuario** — edición inline con guardado.
- **Avatar** — sube una imagen, recórtala con el editor de recorte (sin dependencias externas) y se guarda en Supabase Storage.
- **Banner de perfil** — elige una imagen de portada de RAWG (buscador en vivo) o sube la tuya propia.
- **Tema** — toggle dark / light mode con transición suave.
- **Idioma** — Español / Inglés. La preferencia se guarda en Supabase y se aplica en el siguiente login.
- **Cerrar sesión**.

---

## Flujos principales

### Añadir un juego a la colección

1. Pulsa el FAB `+` en la lista de juegos o el botón "Añadir juego".
2. Escribe el título en el buscador de RAWG. Selecciona el resultado correcto.
3. El formulario se preabre con la portada, géneros, plataformas y rating del catálogo.
4. Elige tu plataforma, estado (backlog, playing...), formato, condición y precio.
5. Opcionalmente recorta la portada y ajusta el punto focal.
6. Guarda. El juego aparece en la lista.

### Prestar un juego

1. Abre el detalle del juego.
2. Pulsa "Gestionar préstamo".
3. Escribe el nombre de la persona a quien lo prestas y confirma.
4. La card muestra un chip azul con el nombre. Puedes filtrar "Solo prestados" en la lista.
5. Cuando te lo devuelvan, vuelve al detalle y pulsa "Devolver".

### Vender un juego

1. Abre el detalle del juego.
2. Pulsa "Gestionar venta" → activa el toggle "Disponible para vender" y escribe el precio deseado.
3. La card muestra un chip amarillo con el precio.
4. Cuando se venda, vuelve al detalle → "Registrar venta" → escribe el precio final y la fecha.
5. El juego desaparece de la colección activa y pasa al historial de ventas.

### Mover un item de wishlist a la colección

1. En la wishlist, pulsa "Ya lo tengo" en cualquier card.
2. Se abre el formulario de juego con los datos del catálogo precargados (portada, géneros, plataformas disponibles).
3. Completa los campos personales y guarda.
4. El item se elimina de la wishlist automáticamente.

### Crear y gestionar un pedido grupal

1. Ve a `/orders` y pulsa el FAB.
2. Rellena el formulario: título, notas, coste de envío y comisiones opcionales.
3. En el detalle del pedido, añade líneas: elige un producto del catálogo e indica cuántas unidades necesitas.
4. Copia el link de invitación y compártelo con el grupo.
5. Cuando todos hayan revisado sus cantidades, avanza el pedido a "Selecting Packs".
6. El stepper muestra, para cada producto, las combinaciones de packs óptimas. Elige la que prefieras.
7. Avanza a "Ordering" y realiza el pedido real al proveedor.
8. Cuando llegue, márcalo como "Received".

---

## Tecnologías

- Angular 21 + Signals + Control Flow (`@for`, `@if`)
- Angular Material 3 (MD3) con paleta violet
- Angular CDK Virtual Scroll
- Angular Service Worker (PWA)
- Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- RAWG API (catálogo de videojuegos)
- Transloco (i18n — ES / EN)
- Sentry (monitorización de errores en producción)
- SCSS con design tokens CSS
- Vitest 4 (unit testing)
- ESLint 10 + typescript-eslint + angular-eslint
- Prettier
- Knip (detección de código muerto)
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
| `npm run test:watch` | Ejecuta los tests en modo watch |
| `npm run test:coverage` | Ejecuta los tests con informe de cobertura (V8) |
| `npm run lint` | Analiza el código con ESLint |
| `npm run lint:fix` | Analiza y corrige automáticamente los problemas de ESLint |
| `npm run format` | Formatea todos los ficheros con Prettier |
| `npm run check:unused` | Detecta exports, dependencias y ficheros no usados con Knip |
| `npm run clean:install` | Elimina `node_modules` e instala desde cero |
| `npm run vercel-build` | Build usado por Vercel en producción |

---

## Arquitectura

```
presentation  →  domain (contratos de repositorio)  →  data (implementaciones Supabase)
                          ↕                                        ↕
                       entities                              data/dtos
```

La capa `presentation` nunca importa directamente de `data`. Los contratos de repositorio viven en `domain/repositories/`. La inyección de dependencias usa `InjectionToken` para desacoplar cada capa.

---

## Notas sobre rendimiento

El repositorio carga todos los juegos del usuario en memoria al iniciar la vista. Supabase tiene un límite por defecto de 1000 filas por query; la implementación pagina automáticamente en lotes de 1000 para soportar colecciones de cualquier tamaño. Los filtros, la búsqueda y la ordenación son operaciones en memoria (instantáneas). El virtual scroll del CDK se encarga de no renderizar más cards de las visibles en pantalla.

---

## Claude Code — Status line

Si usas [Claude Code](https://claude.ai/code) para trabajar en este proyecto, puedes instalar la status line del equipo para ver en todo momento la carpeta, rama git, modelo activo, coste acumulado de la sesión y contexto usado:

```
📁 monchito-game-library  🌿 master  🤖 Claude Sonnet 4.6  💰 $0.08  ▓▓░░░░░░░░ 18%
```

**1. Copia el script:**
```sh
cp scripts/claude-statusline.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

**2. Añade la clave `statusLine` en `~/.claude/settings.json`:**
```json
{
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh"
  }
}
```

---

## Créditos

Proyecto creado por [@albertocheca](https://github.com/albertocheca).

---

## Licencia

MIT
