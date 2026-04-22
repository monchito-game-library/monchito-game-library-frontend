# Monchito Game Library — Roadmap de mejoras futuras

> Ideas y funcionalidades pendientes de implementar. Ordenadas por prioridad de mayor a menor.

---

## Índice

| Mejora | Prioridad | Estado |
|---|---|---|
| [Identidad visual y sistema de diseño](#identidad-visual-y-sistema-de-diseño) | Muy alta | ✅ Completado |
| [Imágenes de consolas y mandos (Supabase Storage)](#imágenes-de-consolas-y-mandos-supabase-storage) | Alta | ⏳ Pendiente |
| [Integración RAWG en detalle de juego](#integración-rawg-en-detalle-de-juego) | Media | ⏳ Pendiente |
| [Recomendaciones de juegos](#recomendaciones-de-juegos) | Media | ⏳ Pendiente |
| [Sign-in con OAuth (Google, Discord, GitLab)](#sign-in-con-oauth-google-discord-gitlab) | Media | ⏳ Pendiente |
| [Dashboard de estadísticas (`/stats`)](#dashboard-de-estadísticas-stats) | Baja | ⏳ Pendiente |
| [Sincronización automática de metadatos RAWG](#sincronización-automática-de-metadatos-rawg) | Baja | ⏳ Pendiente |
| [Mejoras visuales de polish](#mejoras-visuales-de-polish) | Baja | 🔄 Parcial (8/10) |
| [Perfiles públicos, amigos e interacción](#perfiles-públicos-amigos-e-interacción) | Muy baja | ⏳ Pendiente |
| [Observabilidad — Sentry + Better Stack](#observabilidad--sentry--better-stack) | Alta | ✅ Completado |
| [Mejora de diseño con ui-ux-pro-max-skill](#mejora-de-diseño-con-ui-ux-pro-max-skill) | Alta | ✅ Completado |
| [Catálogo de hardware (marcas, modelos y ediciones)](#catálogo-de-hardware-marcas-modelos-y-ediciones) | Alta | ✅ Completado |
| [Hub de colección con categorías](#hub-de-colección-con-categorías-consolas-y-mandos) | Alta | ✅ Completado |
| [Formularios y gestión de consolas y mandos](#formularios-y-gestión-de-consolas-y-mandos) | Alta | ✅ Completado |

---

## Muy alta prioridad

### Identidad visual y sistema de diseño

Audit completo de UI/UX realizado con el skill `ui-ux-pro-max` sobre la versión estable en `master`. La app tiene una base sólida (MD3, espaciado consistente, dark mode, card flip 3D) pero acumula inconsistencias visuales típicas de crecimiento incremental. Este bloque aborda la identidad de marca y los sistemas de diseño fundamentales.

#### Contexto del audit

- **Herramienta:** `ui-ux-pro-max` v2.5.0 instalado en `.claude/skills/ui-ux-pro-max/`
- **Tipo de producto detectado:** Gaming / entertainment / personal collection
- **Estilo recomendado:** Dark Mode (OLED) o Cyberpunk UI
- **Paleta recomendada para gaming:** primary `#7C3AED` (violeta), CTA `#F43F5E` (rosa-rojo), bg `#0F0F23`

---

#### Ítem 1 — Paleta de color

**Problema:** `mat.$spring-green-palette` es genérica y no transmite identidad gaming. Los usuarios de apps de colección de videojuegos esperan un color primario con más energía y personalidad.

**Opciones (de menor a mayor cambio):**

| Opción | Material token | Descripción |
|---|---|---|
| A (recomendada) | `mat.$violet-palette` | Una línea en `styles.scss`, cambio global instantáneo |
| B | `mat.$deep-purple-palette` | Más oscuro y saturado, también válido |
| C | Paleta custom gaming | `#7C3AED` primary, `#F43F5E` CTA, `#0F0F23` bg — fuera de Material tokens |

**Fichero afectado:** `src/styles.scss` (una línea)

**Impacto:** cambia a la vez botones, FAB, chips activos, nav-rail active state, checkboxes, sliders y todos los elementos que consumen `--mat-sys-primary`.

---

#### Ítem 2 — Escala tipográfica

**Problema:** 14 tamaños de fuente distintos en uso, desde `0.6rem` hasta `1.5rem`. No hay jerarquía clara ni tokens compartidos, lo que dificulta el mantenimiento.

**Tamaños actuales a eliminar:** `0.65rem`, `0.7rem`, `0.72rem`, `0.8125rem`, `0.9rem`, `0.9375rem`, `1.1rem`

**Escala propuesta (6 tokens en `styles.scss`):**

```scss
:root {
  --text-xs:   0.75rem;   // Labels, badges, chips
  --text-sm:   0.875rem;  // Texto secundario, metadata
  --text-base: 1rem;      // Texto principal
  --text-lg:   1.125rem;  // Subtítulos de sección
  --text-xl:   1.375rem;  // Títulos de página
  --text-2xl:  1.75rem;   // Solo casos destacados
}
```

**Ficheros afectados:** todos los SCSS de componentes y páginas — búsqueda global de `font-size` y sustitución por el token más próximo.

---

#### Ítem 3 — Escala de border-radius

**Problema:** 8 valores distintos en uso (`4px`, `6px`, `8px`, `10px`, `12px`, `16px`, `20px`, `50%`) sin sistema definido.

**Tokens propuestos (en `styles.scss`):**

```scss
:root {
  --radius-sm:   6px;     // Chips, badges pequeños
  --radius-md:   12px;    // Cards, dialogs, inputs
  --radius-lg:   20px;    // Bottom sheets, modales grandes
  --radius-full: 9999px;  // Avatares, FABs, toggles
}
```

**Ficheros afectados:** todos los SCSS con `border-radius` hardcodeado — búsqueda global y sustitución por el token más próximo.

---

#### Ítem 4 — Escala de z-index

**Problema:** valores de `z-index` dispersos por el código (ej. `z-index: 200` en bottom-nav) sin escala documentada. Dificulta detectar conflictos de superposición.

**Escala propuesta (en `styles.scss`):**

```scss
:root {
  --z-base:    0;
  --z-card:    10;
  --z-dropdown: 20;
  --z-sticky:  30;
  --z-overlay: 40;
  --z-modal:   50;
  --z-toast:   60;
  --z-nav:     70;
}
```

**Ficheros afectados:** `app.component.scss` y cualquier componente con `z-index` hardcodeado.

---

#### Ítem 5 — Colores hardcodeados

**Problema:** varios colores con hex fijos que rompen el sistema de theming — no respetan el toggle light/dark ni los tokens MD3.

**Lista completa identificada:**

| Color | Hex | Ubicación | Sustitución sugerida |
|---|---|---|---|
| Platino | `#ffd700` | `game-card` | `--color-platinum: #ffd700` (custom property) |
| Rating stars | `#ffc107` | `game-card`, `wishlist-card` | `--color-rating: #ffc107` |
| Favoritos | `#ff6b6b`, `#ee5a6f` | `game-card` | `--color-favorite-start/end` |
| Digital copy | `#002d6e`, `#0050c8` | `game-card` | `--color-digital-start/end` |
| Préstamo | `#1565c0`, `#0d47a1` | `game-card` | `--color-loan-start/end` |
| Pedido recibido | `#e8f5e9`, `#2e7d32` | `orders` | `--color-status-received-bg/text` |
| Pedido enviado | `#fff8e1`, `#f57f17` | `orders` | `--color-status-shipped-bg/text` |
| Pedido ordenado | `#e3f2fd`, `#1565c0` | `orders` | `--color-status-ordered-bg/text` |
| Metacritic | `#6ab04c` | game detail | `--color-metacritic` |

**Fichero destino:** definir todas en `styles.scss` bajo un bloque `:root { /* Colores semánticos */ }`.

---

#### Ítem 6 — Tipografía de headings (opcional, fase 2)

Evaluar sustituir `Outfit` solo en headings (`h1`–`h3`, títulos de página) por una fuente más expresiva para un contexto gaming. Candidatas:

- **[Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)** — técnica, moderna, buena en dark mode
- **[Syne](https://fonts.google.com/specimen/Syne)** — más editorial, marcada personalidad

`Outfit` se mantendría para el body. Este ítem se aborda solo si los ítems 1–5 quedan bien integrados.

---

#### Plan de implementación

| Fase | Ítems | Complejidad |
|---|---|---|
| 1 | Paleta de color (ítem 1) | Pequeña — 1 línea |
| 2 | Tokens z-index + border-radius (ítems 3 y 4) | Pequeña — definir en styles.scss + búsqueda global |
| 3 | Escala tipográfica (ítem 2) | Media — sustitución en todos los SCSS |
| 4 | Colores hardcodeados (ítem 5) | Media — búsqueda global + definir custom properties |
| 5 | Tipografía headings (ítem 6) | Pequeña — solo si fases anteriores quedan bien |

---

## Alta prioridad

### Catálogo de hardware (marcas, modelos y ediciones)

Catálogo global de marcas, modelos y ediciones de consolas y mandos gestionado desde el panel de administración. Sustituye los campos de texto libre actuales (`brand`, `model`, `edition`) por referencias a IDs normalizados, garantizando consistencia entre usuarios.

#### Por qué

Sin un catálogo centralizado, distintos usuarios pueden registrar la misma consola como "PlayStation 5", "PS5", "play 5", etc. El catálogo resuelve esto con un selector jerárquico.

#### Modelo de datos

Las especificaciones técnicas se separan en tablas propias por tipo, evitando nulls cruzados entre consolas y mandos:

```
hardware_brands          → id, name                              (Sony, Microsoft, Nintendo…)
hardware_models          → id, brand_id, name, type, generation  ('console' | 'controller')
hardware_console_specs   → model_id, launch_year, discontinued_year, category, media, video_resolution, units_sold_million
hardware_controller_specs → model_id, ...                        (campos a definir)
hardware_editions        → id, model_id, name                    (Final Fantasy XVI Limited Ed…)
```

`user_consoles` y `user_controllers` pasan de tener texto libre a tener `brand_id`, `model_id`, `edition_id` (FK opcionales para edición).

##### Campos de `hardware_console_specs`

| Campo | Tipo | Descripción |
|---|---|---|
| `launch_year` | `INTEGER` | Año de lanzamiento |
| `discontinued_year` | `INTEGER` nullable | Año de descontinuación. `null` = aún en venta |
| `category` | `TEXT` | `'home'` \| `'portable'` \| `'hybrid'` |
| `media` | `TEXT` | `'optical_disc'` \| `'digital'` \| `'cartridge'` \| `'hybrid'` \| `'built_in'` |
| `video_resolution` | `TEXT` nullable | Resolución máxima de vídeo (texto libre: `'4K'`, `'1080p'`, `'480×272'`). `null` si no aplica |
| `units_sold_million` | `NUMERIC` nullable | Unidades vendidas en millones. Dato agregado por familia de modelo (ej: PS4 + PS4 Slim + PS4 Pro comparten el mismo total, igual que hace la propia Sony) |

##### Fuentes de datos por marca

| Marca | Fuente |
|---|---|
| Sony | [Wikipedia — Anexo:Videoconsolas de Sony](https://es.wikipedia.org/wiki/Anexo:Videoconsolas_de_Sony) |
| Microsoft | [Wikipedia — Anexo:Videoconsolas de Microsoft](https://es.wikipedia.org/wiki/Anexo:Videoconsolas_de_Microsoft) |
| Nintendo | [Wikipedia — Anexo:Videoconsolas de Nintendo](https://es.wikipedia.org/wiki/Anexo:Videoconsolas_de_Nintendo) |

##### Seed — Sony (24 modelos)

| Modelo | Gen | Año | Desc. | Categoría | Formato | Resolución | Vendidas (M) |
|---|---|---|---|---|---|---|---|
| PlayStation | 5 | 1994 | 2000 | home | optical_disc | 640×480 | 104 |
| PocketStation | 5 | 1999 | 2008 | portable | optical_disc | null | 5 |
| PSOne | 5 | 2000 | 2005 | home | optical_disc | 640×480 | 104 |
| PlayStation 2 | 6 | 2000 | 2004 | home | optical_disc | 480p | 150 |
| PSX | 6 | 2003 | 2016 | hybrid | optical_disc | 480p | null |
| PlayStation 2 Slim | 6 | 2004 | 2013 | home | optical_disc | 480p | 150 |
| PlayStation Portable | 7 | 2005 | 2007 | portable | optical_disc | 480×272 | 80 |
| PlayStation 3 | 7 | 2006 | 2010 | home | optical_disc | 1080p | 86 |
| PSP Slim & Lite | 7 | 2007 | 2010 | portable | optical_disc | 480×272 | 80 |
| PSP-3000 | 7 | 2008 | 2014 | portable | optical_disc | 480×272 | 80 |
| PlayStation 3 Slim | 7 | 2009 | 2016 | home | optical_disc | 1080p | 86 |
| PSP Go | 7 | 2009 | 2011 | portable | digital | 480×272 | 80 |
| PSP Street | 7 | 2011 | 2015 | portable | optical_disc | 480×272 | 80 |
| PlayStation 3 Super Slim | 7 | 2012 | 2017 | home | optical_disc | 1080p | 86 |
| PlayStation Vita | 8 | 2011 | 2016 | portable | cartridge | 960×544 | 16 |
| PlayStation 4 | 8 | 2013 | 2017 | home | optical_disc | 1080p | 117 |
| PS Vita Slim | 8 | 2014 | 2017 | portable | cartridge | 960×544 | 16 |
| PlayStation 4 Slim | 8 | 2016 | 2022 | home | optical_disc | 1080p | 117 |
| PlayStation 4 Pro | 8 | 2017 | 2022 | home | optical_disc | 4K | 117 |
| PlayStation Classic | 8 | 2018 | null | home | built_in | 480p | null |
| PlayStation 5 | 9 | 2020 | null | home | optical_disc | 4K | 67 |
| PlayStation 5 Digital | 9 | 2020 | null | home | digital | 4K | 67 |
| PlayStation 5 Slim | 9 | 2023 | null | home | hybrid | 4K | 67 |
| PlayStation 5 Pro | 9 | 2024 | null | home | digital | 4K | 67 |

##### Seed — Microsoft (15 modelos)

| Modelo | Gen | Año | Desc. | Categoría | Formato | Resolución | Vendidas (M) |
|---|---|---|---|---|---|---|---|
| Xbox | 6 | 2001 | 2006 | home | optical_disc | 480p | 24 |
| Xbox 360 | 7 | 2005 | 2009 | home | optical_disc | 720p | 85 |
| Xbox 360 Premium | 7 | 2005 | 2009 | home | optical_disc | 720p | 85 |
| Xbox 360 Elite | 7 | 2007 | 2010 | home | optical_disc | 1080p | 85 |
| Xbox 360 S | 7 | 2010 | 2013 | home | optical_disc | 1080p | 85 |
| Xbox 360 E | 7 | 2013 | 2016 | home | optical_disc | 1080p | 85 |
| Xbox One | 8 | 2013 | 2017 | home | optical_disc | 1080p | 51 |
| Xbox One S | 8 | 2016 | 2022 | home | optical_disc | 1080p | 51 |
| Xbox One X | 8 | 2017 | 2022 | home | optical_disc | 4K | 51 |
| Xbox One S All-Digital | 8 | 2019 | 2022 | home | digital | 1080p | 51 |
| Xbox Series X | 9 | 2020 | null | home | hybrid | 4K | 31 |
| Xbox Series S | 9 | 2020 | null | home | digital | 1440p | 31 |
| Xbox Series S Robot White | 9 | 2024 | null | home | digital | 1440p | 31 |
| Xbox Series X Digital Edition | 9 | 2024 | null | home | digital | 4K | 31 |
| Xbox Series X Galaxy Edition | 9 | 2024 | null | home | hybrid | 4K | 31 |

##### Seed — Nintendo (34 modelos)

| Modelo | Gen | Año | Desc. | Categoría | Formato | Resolución | Vendidas (M) |
|---|---|---|---|---|---|---|---|
| Color TV-Game | 1 | 1977 | 1983 | home | built_in | null | 3 |
| Game & Watch | 2 | 1980 | 1991 | portable | built_in | null | 40 |
| Famicom | 3 | 1983 | 1993 | home | cartridge | 256×240 | 61 |
| NES | 3 | 1985 | 1995 | home | cartridge | 256×240 | 61 |
| NES-101 | 3 | 1993 | 2003 | home | cartridge | 256×240 | 61 |
| Game Boy | 4 | 1989 | 1998 | portable | cartridge | 160×144 | 118 |
| Super Nintendo | 4 | 1990 | 1999 | home | cartridge | 256×240 | 49 |
| Game Boy Pocket | 4 | 1995 | 2000 | portable | cartridge | 160×144 | 118 |
| Game Boy Light | 4 | 1997 | 2003 | portable | cartridge | 160×144 | 56 |
| Virtual Boy | 5 | 1995 | 1996 | portable | cartridge | 384×224 | 0.77 |
| Nintendo 64 | 5 | 1996 | 2003 | home | cartridge | 640×480 | 32 |
| Game Boy Color | 5 | 1998 | 2004 | portable | cartridge | 160×144 | 118 |
| GameCube | 6 | 2001 | 2007 | home | optical_disc | 480p | 21 |
| Game Boy Advance | 6 | 2001 | 2008 | portable | cartridge | 240×160 | 81 |
| Game Boy Advance SP | 6 | 2003 | 2008 | portable | cartridge | 240×160 | 43 |
| Game Boy Micro | 6 | 2004 | 2008 | portable | cartridge | 240×160 | 2.4 |
| Nintendo DS | 7 | 2004 | 2007 | portable | cartridge | 256×192 | 154 |
| Wii | 7 | 2006 | 2016 | home | optical_disc | 480p | 101 |
| DS Lite | 7 | 2006 | 2012 | portable | cartridge | 256×192 | 154 |
| DSi | 7 | 2008 | 2013 | portable | cartridge | 256×192 | 154 |
| DSi XL | 7 | 2010 | 2013 | portable | cartridge | 256×192 | 154 |
| Nintendo 3DS | 8 | 2011 | 2017 | portable | cartridge | 400×240 | 75 |
| Nintendo 3DS XL | 8 | 2012 | 2017 | portable | cartridge | 400×240 | 75 |
| Wii U | 8 | 2012 | 2017 | home | optical_disc | 1080p | 14 |
| Nintendo 2DS | 8 | 2013 | 2018 | portable | cartridge | 400×240 | 75 |
| New Nintendo 3DS | 8 | 2014 | 2019 | portable | cartridge | 400×240 | 75 |
| New Nintendo 3DS XL | 8 | 2014 | 2019 | portable | cartridge | 400×240 | 75 |
| NES Classic Edition | 8 | 2016 | null | home | built_in | 480p | 2.3 |
| New Nintendo 2DS XL | 8 | 2017 | 2020 | portable | cartridge | 400×240 | 75 |
| SNES Classic Edition | 8 | 2017 | null | home | built_in | 480p | 5.3 |
| Nintendo Switch | 8 | 2017 | null | hybrid | cartridge | 1080p | 153 |
| Switch Lite | 8 | 2019 | null | portable | cartridge | 720p | 153 |
| Switch OLED | 8 | 2021 | null | hybrid | cartridge | 1080p | 153 |
| Nintendo Switch 2 | 9 | 2025 | null | hybrid | cartridge | 4K | 8.67 |

#### Migraciones Supabase

**Bloque 1 — Ya aplicadas** ✅

```sql
-- hardware_brands, hardware_models, hardware_editions
-- ALTER user_consoles (brand_id, model_id, edition_id)
-- ALTER user_controllers (brand_id, model_id, edition_id)
```

**Bloque 2 — Ya aplicadas** ✅

```sql
-- Añadir generation a hardware_models
ALTER TABLE hardware_models
  ADD COLUMN generation INTEGER;

-- Especificaciones de consola
CREATE TABLE hardware_console_specs (
  model_id             UUID PRIMARY KEY REFERENCES hardware_models(id) ON DELETE CASCADE,
  launch_year          INTEGER NOT NULL,
  discontinued_year    INTEGER,
  category             TEXT NOT NULL CHECK (category IN ('home', 'portable', 'hybrid')),
  media                TEXT NOT NULL CHECK (media IN ('optical_disc', 'digital', 'cartridge', 'hybrid', 'built_in')),
  video_resolution     TEXT,
  units_sold_million   NUMERIC
);
ALTER TABLE hardware_console_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read console specs"
  ON hardware_console_specs FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage console specs"
  ON hardware_console_specs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_preferences WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_preferences WHERE user_id = auth.uid() AND role = 'admin'));

-- Especificaciones de mando (campos a definir)
CREATE TABLE hardware_controller_specs (
  model_id UUID PRIMARY KEY REFERENCES hardware_models(id) ON DELETE CASCADE
  -- campos específicos de mando se añadirán cuando se definan
);
ALTER TABLE hardware_controller_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read controller specs"
  ON hardware_controller_specs FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage controller specs"
  ON hardware_controller_specs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_preferences WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_preferences WHERE user_id = auth.uid() AND role = 'admin'));
```

#### Plan de implementación

**Fase 1 — Capa de datos** ✅ completada

- ✅ Migraciones bloque 1 aplicadas (`hardware_brands`, `hardware_models`, `hardware_editions`, ALTER `user_consoles`, ALTER `user_controllers`)
- ✅ Tipo `HardwareModelType` + constante `HARDWARE_MODEL_TYPE`
- ✅ Entidades: `HardwareBrandModel`, `HardwareModelModel`, `HardwareEditionModel`
- ✅ DTOs: `HardwareBrandDto`, `HardwareModelDto`, `HardwareEditionDto`
- ✅ Mappers + specs: `hardware-brand.mapper`, `hardware-model.mapper`, `hardware-edition.mapper`
- ✅ Contratos de repositorio: `hardware-brand.repository.contract`, etc.
- ✅ Implementaciones Supabase + specs: `SupabaseHardwareBrandRepository`, etc.
- ✅ Casos de uso + specs: `HardwareBrandUseCasesImpl`, `HardwareModelUseCasesImpl`, `HardwareEditionUseCasesImpl`
- ✅ Providers DI: `hardwareBrandRepositoryProvider`, `hardwareModelRepositoryProvider`, `hardwareEditionRepositoryProvider` (y sus use-cases)
- ✅ Migraciones bloque 2 aplicadas (`generation` en `hardware_models`, `hardware_console_specs`, `hardware_controller_specs`)
- ✅ Entidad `HardwareConsoleSpecsModel` + DTO + mapper + repositorio + use-cases + DI
- ✅ Actualizar `ConsoleModel` / `ControllerModel`: sustituir `brand/model/edition: string` por `brandId/modelId/editionId: string` (UUIDs FK) + actualizar DTOs, mappers, formularios y tests
- ✅ Seed SQL: 73 modelos (Sony 24 + Microsoft 15 + Nintendo 34) en `hardware_brands`, `hardware_models` y `hardware_console_specs`

**Fase 2 — Gestión (admin)** ✅ completada

Nueva sección `/management/hardware` con navegación contextual (drill-down):

```
/management/hardware                          → listado de marcas + CRUD
/management/hardware/:brandId/models          → modelos de esa marca + CRUD (con specs inline)
/management/hardware/models/:modelId/editions → ediciones de ese modelo + CRUD
```

- ✅ Breadcrumb en cada nivel (`Hardware > Sony > PlayStation 5`). Acceso restringido a admins.
- ✅ El formulario de modelo muestra los campos de specs según el tipo (`console` → campos de `hardware_console_specs`).
- ✅ Providers de hardware registrados en las rutas de gestión.

**Fase 3 — Formularios de consola y mando** ✅ completada

Selectores jerárquicos implementados:
1. ✅ **Marca** → autocomplete con todas las marcas
2. ✅ **Modelo** → autocomplete filtrado por marca + tipo, se limpia al cambiar marca
3. ✅ **Edición** → select filtrado por modelo seleccionado, opcional, se limpia al cambiar modelo

**Fase 4 — Listas y detalle de consolas y mandos** ✅ completada

- ✅ Resolución de nombres (marca, modelo, tienda) por lookup en memoria cargado al iniciar la vista.
- ✅ Pantalla de detalle de consola y mando: muestra datos del usuario (precio, condición, tienda, notas) + nombre de marca y modelo resueltos del catálogo.

---

### Hub de colección con categorías (consolas y mandos) ✅ completado

La página de colección (`/games`) actúa como hub con cards por categoría y subrutas independientes por tipo.

#### Navegación

```
/games                → hub con cards de categoría (juegos, consolas, mandos)
/games/list           → listado de juegos (lo actual)
/games/list/:id       → detalle de juego
/games/list/add       → añadir juego
/games/list/edit/:id  → editar juego
/games/list/sold      → historial de ventas
/games/consoles       → listado de consolas
/games/controllers    → listado de mandos
```

El hub muestra una card por categoría con el contador de elementos. Al hacer clic navega a la subruta correspondiente.

#### Consolas (`user_consoles`)

Campos: marca, modelo, región (PAL / NTSC / NTSC-J), condición, precio, tienda, fecha de compra, notas.

#### Mandos (`user_controllers`)

Campos: modelo, edición especial, color (obligatorio), compatibilidad (PS5 / Xbox / PC / Switch...), condición, precio, tienda, fecha de compra, notas. Los mandos son entidades independientes — no están vinculados a ninguna consola.

#### Base de datos

Tablas `user_consoles` y `user_controllers` creadas en Supabase con RLS (cada usuario solo ve los suyos). Ver schema en `docs/backend/supabase-schema-current.sql`.

#### Implementación

- Renombrar la ruta `/games` actual a `/games/list` y añadir redirect `/games` → hub.
- Crear la página hub con cards de categoría.
- Capas de datos completas para consolas y mandos (DTO, mapper, repositorio, casos de uso, providers DI).
- Listados de consolas y mandos con filtros específicos por categoría.
- Formularios de alta/edición para cada categoría.

---

### Formularios y gestión de consolas y mandos ✅ completado

Los listados de consolas (`/games/consoles`) y mandos (`/games/controllers`) están implementados con soporte completo de alta, edición y baja.

#### Rutas a añadir

```
/games/consoles/add          → formulario de alta de consola
/games/consoles/edit/:id     → formulario de edición de consola
/games/controllers/add       → formulario de alta de mando
/games/controllers/edit/:id  → formulario de edición de mando
```

Seguir el mismo patrón que `game-list/pages/create-update-game`: cada formulario es una página hija con su propio `*.routes.ts`, cargada con `loadChildren` desde el routes padre.

#### Formulario de consola

Campos: marca (texto libre), modelo (texto libre), región (select: PAL / NTSC / NTSC-J), condición (select: Nuevo / Usado), precio (número opcional), tienda (select igual que juegos), fecha de compra (datepicker opcional), notas (textarea opcional), imagen (ver [Imágenes de consolas y mandos](#imágenes-de-consolas-y-mandos-supabase-storage)).

#### Formulario de mando

Campos: modelo (texto libre), edición (texto libre opcional), color (color picker o texto libre), compatibilidad (select: PS5 / PS4 / PS3 / Xbox / PC / Switch / Universal), condición (select), precio (opcional), tienda (optional), fecha de compra (opcional), notas (opcional), imagen (ver más abajo).

#### Implementación

- Interfaces `ConsoleForm` / `ConsoleFormValue` y `ControllerForm` / `ControllerFormValue` en `entities/interfaces/forms/`.
- El use-case `add` y `update` ya existen — el formulario los llama directamente.
- El FAB y el botón de "Añadir" en el estado vacío navegan a `/games/consoles/add` y `/games/controllers/add`.
- Cada card en el listado añade botón de editar que navega a `edit/:id`.
- Diálogo de confirmación en delete (ya implementado) se mantiene.

---

### Observabilidad — Sentry + Better Stack

Integración de monitorización de errores y uptime para detectar problemas en producción antes de que los usuarios los reporten.

#### Better Stack (Uptime)

Monitor que comprueba cada minuto que la app en Vercel responde correctamente. Alerta por email si cae. No requiere cambios en el código — se configura íntegramente desde el panel de Better Stack.

**Pasos:**
1. Crear cuenta en Better Stack.
2. Añadir monitor HTTP apuntando a `https://project-hohsa.vercel.app`.
3. Configurar alerta al email del propietario.

#### Sentry (Error tracking)

Captura automática de errores JavaScript no manejados en producción, con stack traces reales gracias a los source maps.

**Paquete:**
```
@sentry/angular@10.48.0
```

**Ficheros a modificar:**
- `main.ts` — inicialización de Sentry con DSN desde variable de entorno
- `src/app/app.config.ts` — registrar `ErrorHandler` de Sentry y tracing de rutas
- `angular.json` — activar `sourceMap: { scripts: true }` en el build de producción

**Variables de entorno a añadir en Vercel:**
- `NG_APP_SENTRY_DSN` — DSN del proyecto Sentry
- `SENTRY_AUTH_TOKEN` — token para subir source maps
- `SENTRY_ORG` — slug de la organización en Sentry
- `SENTRY_PROJECT` — slug del proyecto en Sentry

**Integración Vercel ↔ Sentry:**
Instalar la integración oficial desde el marketplace de Vercel (Settings → Integrations → Sentry). Genera automáticamente las variables de entorno y sube los source maps en cada deploy.

**Plan de implementación:**
1. Crear cuenta en Sentry y proyecto Angular.
2. Instalar integración Sentry en Vercel.
3. Instalar `@sentry/angular` con versión exacta.
4. Inicializar Sentry en `main.ts`.
5. Registrar `ErrorHandler` y tracing en `app.config.ts`.
6. Activar source maps en `angular.json`.
7. Verificar en el dashboard de Sentry que llegan errores de prueba.

---

### ~~Mejora de diseño con ui-ux-pro-max-skill~~ ✅

Skill instalado en `.claude/skills/ui-ux-pro-max/` (proyecto local, no global). Audit completo ejecutado sobre `master` — resultado documentado en [Identidad visual y sistema de diseño](#identidad-visual-y-sistema-de-diseño) como bloque de muy alta prioridad.

---

### Imágenes de consolas y mandos (Supabase Storage)

Consolas y mandos no tienen integración con RAWG — las imágenes las sube el propio usuario y se guardan en Supabase Storage. Esta feature se implementa junto con o inmediatamente después de los formularios de alta/edición.

#### Base de datos

Añadir campo `image_url` a las tablas existentes:

```sql
ALTER TABLE user_consoles ADD COLUMN image_url TEXT;
ALTER TABLE user_controllers ADD COLUMN image_url TEXT;
```

Actualizar los modelos, DTOs y mappers correspondientes para incluir el nuevo campo.

#### Supabase Storage

Crear un bucket privado `hardware-images` en Supabase Storage con RLS: cada usuario solo puede leer y escribir sus propios archivos.

```sql
-- Política de lectura
CREATE POLICY "Users can view their own hardware images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hardware-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política de escritura
CREATE POLICY "Users can upload their own hardware images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hardware-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política de borrado
CREATE POLICY "Users can delete their own hardware images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hardware-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Las imágenes se guardan en la ruta `{user_id}/{console_or_controller_id}.{ext}`.

#### Servicio de upload

Crear `HardwareImageService` en `presentation/services/` que encapsule:
- `uploadImage(userId, itemId, file: File): Promise<string>` — sube al bucket y devuelve la URL pública.
- `deleteImage(userId, itemId): Promise<void>` — borra el archivo del bucket.

Usar el cliente de Supabase ya configurado en el repositorio (`SupabaseService`).

#### UI en el formulario

El campo de imagen en el formulario de consola/mando funciona igual que el crop de portadas de juegos:
1. Input tipo `file` (acepta `image/*`) con botón de "Subir imagen".
2. Preview de la imagen seleccionada antes de guardar.
3. Al guardar el formulario: primero se sube la imagen → se obtiene la URL → se guarda la URL en el campo `image_url` del registro.
4. Si ya hay imagen, mostrarla con opción de "Cambiar" o "Eliminar".

#### UI en las cards del listado

- Si `image_url` existe: mostrar la imagen como fondo o thumbnail en la card (reemplaza el icono `tv`/`gamepad` actual).
- Si no: mantener el icono como fallback.
- Usar `NgOptimizedImage` **sin modo `fill`** para evitar el conflicto conocido con CDK virtual scroll. Usar `width` y `height` explícitos en función del tamaño de la card.

---

### Integración RAWG en detalle de juego

La página de detalle ya muestra todos los datos personales de `user_games`. Queda integrar los datos externos de RAWG para juegos con `rawg_id`.

#### Sección RAWG (datos de `game_catalog` + llamadas a la API)

- Descripción completa
- Rating RAWG, puntuación Metacritic, clasificación ESRB
- Plataformas disponibles, géneros, desarrolladores, publishers
- Screenshots (carrusel)
- Tiendas donde comprarlo con links directos
- DLCs disponibles
- Juegos de la misma saga

#### Implementación

- Los datos que no están en `game_catalog` (DLCs, saga, tiendas con links) se piden en paralelo al endpoint de RAWG usando el `rawg_id` del juego:
  - `/games/{id}` — descripción completa, tiendas, ESRB
  - `/games/{id}/screenshots` — capturas
  - `/games/{id}/additions` — DLCs
- Si el juego es `source = 'manual'` (sin `rawg_id`), ocultar las secciones de RAWG.
- Cachear las respuestas de RAWG en memoria durante la sesión.

---

### Recomendaciones de juegos

Sugerir juegos que el usuario no tiene en su colección basándose en sus platinos y favoritos. Se muestra de forma sutil dentro de la lista de juegos, no como sección nueva en el nav.

#### Lógica de cálculo

**Base:** los juegos candidatos son aquellos donde el usuario tiene `platinum = true` O `is_favorite = true`. Son los que mejor reflejan sus gustos reales.

**Paso 1 — Juegos similares individuales:**
Para cada juego candidato, llamar al endpoint de RAWG `/games/{rawg_id}/suggested` que devuelve juegos similares. Filtrar los resultados eliminando los que el usuario ya tiene en `user_games` (comparando por `rawg_id`).

**Paso 2 — Detección de patrones por género:**
Si entre todos los juegos sugeridos hay géneros que se repiten con frecuencia, priorizar esos géneros en las recomendaciones. Ejemplo: si 8 de tus platinos son de acción-aventura, las recomendaciones de ese género suben arriba.

**Paso 3 — Deduplicación:**
Un mismo juego puede aparecer como sugerencia de varios candidatos. Priorizar los que aparecen más veces — son los que más se parecen al perfil del usuario.

#### UI

- Panel sutil al final de la lista de juegos: "Puede que también te guste..." con un scroll horizontal de cards.
- Cada card muestra portada, título, géneros y rating de RAWG.
- Botón rápido para añadir el juego directamente a la colección o a la wishlist.
- Si el usuario no tiene platinos ni favoritos suficientes, no se muestra el panel.

#### Implementación

- Las llamadas a RAWG se hacen desde el frontend (no Edge Function) ya que dependen de la sesión del usuario.
- Cachear los resultados en memoria durante la sesión para no repetir llamadas a RAWG al navegar.
- No guardar las recomendaciones en Supabase — se calculan en tiempo real cada vez.
- RAWG puede no tener el endpoint `/suggested` para todos los juegos (juegos manuales o con poco dato). Ignorar silenciosamente los que fallen.

---

### Sign-in con OAuth (Google, Discord, GitLab)

Permitir que los usuarios inicien sesión (y se registren) usando sus cuentas de Google, Discord o GitLab, sin necesidad de crear una contraseña. El flujo es una redirección al proveedor y vuelta a la app — Supabase gestiona el intercambio de tokens y la sesión resultante.

#### Por qué

Reduce la fricción de registro/login significativamente. La mayoría de usuarios de una app gaming ya tienen cuenta de Discord o Google. Es especialmente valioso en mobile donde escribir email + contraseña es tedioso.

#### Flujo técnico

1. El usuario hace clic en "Continuar con Google" (o Discord / GitLab).
2. `supabase.auth.signInWithOAuth({ provider })` redirige al proveedor.
3. El proveedor autentica y redirige de vuelta a la app con el token en la URL.
4. Supabase intercepta el callback y establece la sesión.
5. El `onAuthStateChange` ya existente detecta la sesión → la app navega al dashboard. No hay que cambiar la lógica post-login.

#### Plan de implementación

**Paso 0 — Configuración externa (Supabase dashboard)**

- [ ] Activar provider **Google** en Supabase Auth → crear OAuth App en Google Cloud Console → pegar Client ID y Secret.
- [ ] Activar provider **Discord** en Supabase Auth → crear OAuth App en Discord Developer Portal → pegar Client ID y Secret.
- [ ] Activar provider **GitLab** en Supabase Auth → crear OAuth App en GitLab → pegar Client ID y Secret.
- [ ] Añadir la URL de callback de Supabase como redirect URI en cada OAuth App (`https://<proyecto>.supabase.co/auth/v1/callback`).
- [ ] Añadir `https://project-hohsa.vercel.app` como Site URL en Supabase Auth → URL Configuration.

**Paso 1 — Tipo `OAuthProvider`**

- [ ] Crear `src/app/entities/types/oauth-provider.type.ts`:
  ```typescript
  export type OAuthProvider = 'google' | 'discord' | 'gitlab';
  ```

**Paso 2 — Capa `domain` (contrato)**

- [ ] Añadir al `AuthRepositoryContract` (`domain/repositories/auth.repository.contract.ts`):
  ```typescript
  signInWithOAuth(provider: OAuthProvider): Promise<void>;
  ```

**Paso 3 — Capa `data` (implementación)**

- [ ] Implementar en `SupabaseAuthRepository`:
  ```typescript
  async signInWithOAuth(provider: OAuthProvider): Promise<void> {
    const { error } = await this._supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  }
  ```
- [ ] Añadir spec correspondiente en `supabase-auth.repository.spec.ts`.

**Paso 4 — Capa `domain` (casos de uso)**

- [ ] Añadir a `AuthUseCasesContract`:
  ```typescript
  signInWithOAuth(provider: OAuthProvider): Promise<AuthResult>;
  ```
- [ ] Implementar en `AuthUseCases` con try/catch → `AuthResult`.
- [ ] Añadir spec en `auth.use-cases.spec.ts`.

**Paso 5 — Capa `presentation` (UI)**

- [ ] Añadir en `login.component.html` una sección separada "O continuar con" con tres botones, uno por proveedor.
- [ ] Añadir los mismos botones en `register.component.html` (el registro OAuth crea la cuenta automáticamente).
- [ ] Para los iconos de cada proveedor, usar SVG inline (los iconos de Google, Discord y GitLab no están en Material Icons). Guardar los SVG como assets o como constantes en el componente.
- [ ] Añadir `onOAuthSignIn(provider: OAuthProvider): Promise<void>` en `LoginComponent` y `RegisterComponent`, delegando al use case.
- [ ] En caso de error (proveedor no configurado, popup bloqueado, etc.), mostrar el `errorMessage` ya existente.

**Paso 6 — i18n**

- [ ] Añadir en `es.json` y `en.json` bajo `auth.login` y `auth.register`:
  ```json
  "orContinueWith": "O continuar con",
  "continueWithGoogle": "Continuar con Google",
  "continueWithDiscord": "Continuar con Discord",
  "continueWithGitlab": "Continuar con GitLab"
  ```

**Paso 7 — Tests**

- [ ] `supabase-auth.repository.spec.ts`: verificar que `signInWithOAuth('google')` llama a `supabase.auth.signInWithOAuth` con el provider correcto.
- [ ] `auth.use-cases.spec.ts`: verificar que devuelve `{ success: true }` en caso exitoso y `{ success: false, error }` si falla.
- [ ] `login.component.spec.ts`: verificar que `onOAuthSignIn('google')` llama al use case con `'google'`, y que los errores se reflejan en `errorMessage`.

#### Consideraciones

- El flujo OAuth implica una redirección completa del navegador — no es un popup. La app se recarga al volver del proveedor y el `onAuthStateChange` en `AppComponent` ya gestiona la sesión resultante.
- En local (http://localhost:4200), hay que añadir `http://localhost:4200` como URL adicional en Supabase Auth → URL Configuration.
- Si un usuario intenta registrarse con OAuth usando un email que ya existe como cuenta email/password, Supabase puede fusionar o rechazar según la configuración — conviene verificar el comportamiento en el dashboard.

---

## Baja prioridad

### Dashboard de estadísticas (`/stats`)

Nueva sección en el nav que sustituye las estadísticas actuales de la colección (juegos totales, gasto total, valoración media). Lo que hay ahora es la v.1 — al implementar esto esos datos se mueven aquí y se eliminan del header de la colección.

#### Estadísticas de colección

- Distribución por plataforma (cuántos juegos tienes en cada consola)
- Distribución por género
- Distribución por estado (`backlog`, `playing`, `completed`, `platinum`, `abandoned`, `owned`)
- Ratio completados vs backlog
- Gasto total por tienda
- Gasto total por año de compra
- Evolución de la colección en el tiempo (juegos añadidos por mes/año)
- Valoración media personal
- Juegos con platino / favoritos

#### Estadísticas de wishlist

- Total de juegos en la wishlist
- Gasto estimado (suma de `desired_price` de los items que lo tienen)
- Distribución por prioridad

#### Implementación

- Todos los cálculos se hacen en SQL directamente sobre `user_games` y `user_wishlist` — no hace falta ninguna tabla nueva.
- Crear vistas o queries específicas en Supabase para cada agrupación (o calcularlas en el repositorio con `.select()` y agregaciones).
- El tipo de gráfica (barras, tarta, líneas) se decide en el momento de implementar el frontend.
- Nueva ruta `/stats` y entrada en nav-rail (desktop) y bottom-nav (móvil).
- Componentes de tarjeta de estadística reutilizables para los valores simples (totales, medias).

---

### Sincronización automática de metadatos RAWG

Los juegos guardados en `game_catalog` tienen los datos de RAWG del momento en que se añadieron. Con el tiempo RAWG actualiza esa información — nuevas plataformas, ports, remasters, cambios en rating o metacritic. Esta feature mantendría esos datos al día automáticamente sin intervención del usuario.

#### Cómo funciona

Una **Supabase Edge Function** (código TypeScript ejecutado en los servidores de Supabase, no en el navegador) se programaría para ejecutarse periódicamente (por ejemplo cada semana) mediante un **Supabase Cron Job**.

La función haría lo siguiente:
1. Consultar `game_catalog` filtrando por `source = 'rawg'` y `rawg_id IS NOT NULL`.
2. Para cada juego, llamar al endpoint de RAWG `/games/{rawg_id}`.
3. Actualizar en `game_catalog` los campos que pueden cambiar con el tiempo:
   - `platforms`, `parent_platforms`
   - `rating`, `rating_top`, `ratings_count`, `reviews_count`
   - `metacritic_score`, `metacritic_url`
   - `genres`, `tags`, `developers`, `publishers`
   - `screenshots`
   - `tba` (puede pasar de true a false cuando se anuncia fecha)
   - `released_date` (puede concretarse si era TBA)
4. Actualizar `last_synced_at` en cada registro procesado.

#### Consideraciones

- **Rate limit de RAWG:** la API gratuita tiene límite de peticiones. Procesar en lotes con delay entre llamadas o usar `last_synced_at` para priorizar los que llevan más tiempo sin actualizar.
- **Juegos manuales:** los registros con `source = 'manual'` no se tocan — no tienen `rawg_id`.
- **RAWG API key:** debe estar configurada como variable de entorno en Supabase (no en el frontend).
- La función vive en `supabase/functions/sync-rawg-metadata/index.ts` (directorio estándar de Edge Functions).

---

## Mejoras visuales de polish

Mejoras puramente visuales detectadas mediante análisis del estado actual de la app. No añaden funcionalidad nueva — elevan la calidad percibida y la coherencia del sistema de diseño. Todas son independientes entre sí y pueden implementarse en cualquier orden.

---

### Ítem 1 — Color dinámico por plataforma

Cada consola tiene colores de marca reconocibles (PS5 azul, Xbox verde, Switch rojo, PC gris). Aplicar un accent color diferente al chip de plataforma en los cards haría la biblioteca más rica e identificable de un vistazo.

**Implementación:** mapa `PLATFORM_COLORS` con `color` y `bg` por plataforma → custom properties inline `[style.--platform-color]` en el chip.

**Ficheros afectados:** `game-card`, `wishlist-card`, chips de plataforma.

---

### Ítem 2 — Dominant color extraction en covers

Extraer el color dominante de la portada y usarlo como gradiente sutil en el back-face del flip card. Crea una experiencia visualmente "viva" sin cambiar la estructura.

**Implementación:** `canvas.getContext('2d').drawImage()` → muestreo de píxeles → color dominante → CSS variable inyectada en el card. Solo se calcula una vez y se cachea por juego.

**Ficheros afectados:** `game-card.component.ts/scss`.

---

### Ítem 3 — Skeleton loading consistente

El componente `skeleton` existe pero no se usa en todas las listas (consolas, mandos, wishlist). Auditar y asegurar que todas las listas muestran skeleton mientras cargan.

**Implementación:** revisar cada page con listado (`consoles`, `controllers`, `wishlist`) y añadir el skeleton si falta.

**Ficheros afectados:** pages de consolas, mandos y wishlist.

---

### Ítem 4 — Scrollbar personalizado

Con cuatro líneas de CSS (`scrollbar-width: thin` + `scrollbar-color`) alineadas a la paleta violet, los paneles con scroll se verían mucho más cuidados.

**Implementación:**

```scss
:root {
  scrollbar-width: thin;
  scrollbar-color: var(--mat-sys-primary) transparent;
}
```

**Fichero afectado:** `styles.scss`.

---

### Ítem 5 — Animaciones de entrada escalonadas (stagger)

Al navegar a una lista, los cards entran con un pequeño delay progresivo (`nth-child(n) → animation-delay: n * 40ms`). Hace que la página se "construya" visualmente en lugar de aparecer todo de golpe.

**Implementación:** Angular Animations con `query(':enter', stagger(40, animate(...)))` en los listados.

**Ficheros afectados:** `game-list`, `consoles-list`, `controllers-list`.

---

### Ítem 6 — Transición dark/light mode suave

El cambio de tema actualmente es brusco. Con una transición CSS en `:root` queda fluido.

**Implementación:**

```scss
:root {
  transition: background-color 300ms ease, color 300ms ease;
}
```

**Fichero afectado:** `styles.scss`.

---

### Ítem 7 — Metacritic badge con color semántico

En lugar de mostrar solo el número, un badge color-coded al estilo de la web de Metacritic: verde (≥75), amarillo (50–74), rojo (<50).

**Implementación:** pipe o computed que devuelve `'green' | 'yellow' | 'red'` según el score → clase CSS `--metacritic-green/yellow/red`.

**Ficheros afectados:** `game-detail`, `game-card` (si muestra score).

---

### Ítem 8 — Focus visible mejorado

Asegurar que todos los elementos interactivos tienen un `focus-visible` outline coherente con la paleta violet. Mejora accesibilidad y estética a la vez.

**Implementación:**

```scss
:focus-visible {
  outline: 2px solid var(--mat-sys-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Fichero afectado:** `styles.scss`.

---

### Ítem 9 — Tooltips en chips de estado

Un tooltip en cada chip (préstamo activo, en venta, platinum, favorito) que explique su significado. Útil para usuarios nuevos y añade polish sin ruido visual.

**Implementación:** `matTooltip` de Angular Material en cada chip. El texto puede salir de las constantes de traducción existentes.

**Ficheros afectados:** `game-card`, `badge-chip`.

---

### Ítem 10 — Micro-animación en bottom nav al cambiar tab

Un pequeño translate vertical (`translateY(-2px)`) en el icono activo del bottom nav refuerza el feedback táctil en mobile sin ser intrusivo.

**Implementación:** clase `--active` con `transform: translateY(-2px)` y `transition: transform 150ms ease`.

**Fichero afectado:** `bottom-nav.component.scss` (o equivalente).

---

## Social *(prioridad muy baja)*

### Perfiles públicos, amigos e interacción

Convertir Monchito en una plataforma social donde los usuarios pueden compartir su colección, hacer amigos y recomendarse juegos. Es una feature grande que se puede construir en fases.

---

#### Fase 1 — Perfiles públicos y privacidad

**Comportamiento:**
- Cada usuario tiene un perfil accesible en `/u/:username` (requiere añadir campo `username` único en `user_preferences`).
- El usuario elige en su configuración si su perfil es **público** (visible para cualquiera) o **privado** (visible solo para amigos aprobados).
- Por defecto se muestra todo: colección, wishlist y valoraciones personales. En el futuro se puede añadir control granular por sección.

**Base de datos:**
- Añadir a `user_preferences`:
  ```sql
  ALTER TABLE user_preferences
    ADD COLUMN username TEXT UNIQUE,
    ADD COLUMN profile_visibility TEXT DEFAULT 'public'
      CHECK (profile_visibility IN ('public', 'private'));
  ```
- Actualizar RLS de `user_games` y `user_wishlist` para permitir lectura si el perfil es público o si existe amistad aceptada.

---

#### Fase 2 — Sistema de amigos

**Comportamiento:**
- Un usuario puede enviar solicitud de amistad a otro por username.
- El receptor puede aceptar o rechazar.
- Los amigos pueden ver el perfil aunque sea privado.

**Base de datos:**
- Nueva tabla `friendships`:
  ```sql
  CREATE TABLE friendships (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status     TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_user, to_user)
  );
  ```
- RLS: cada usuario solo ve sus propias solicitudes enviadas/recibidas y las amistades aceptadas.

**Presentación:**
- Sección `/friends` con pestañas: amigos, solicitudes recibidas, solicitudes enviadas.
- Buscador de usuarios por username.

---

#### Fase 3 — Interacción

**Recomendaciones:**
- Desde el detalle de un juego, botón "Recomendar a un amigo" que abre un selector de amigos con campo de mensaje opcional.
- Nueva tabla `game_recommendations`:
  ```sql
  CREATE TABLE game_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
    message         TEXT,
    read            BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

**Comentarios:**
- Los usuarios pueden dejar un comentario público en un juego del catálogo (no en el `user_games` de alguien, sino sobre el juego en sí).
- Nueva tabla `game_comments`:
  ```sql
  CREATE TABLE game_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

---

#### Fase 4 — Realtime (Supabase Realtime)

Una vez implementadas las fases anteriores, activar suscripciones en tiempo real para:
- Notificaciones al recibir una solicitud de amistad.
- Notificaciones al recibir una recomendación.
- Actualización en vivo del perfil de un amigo si estás viendo su colección.

Supabase Realtime usa WebSockets internamente. En Angular se integra suscribiéndose al canal del cliente de Supabase y actualizando las signals correspondientes cuando llega un evento.

---

#### Consideraciones generales
- La fase 1 es prerequisito de todo lo demás.
- La fase 2 es prerequisito de las fases 3 y 4.
- Cada fase es independiente y desplegable por separado.
- Los campos de valoración personal (`personal_rating`, `personal_review`) son los más sensibles — considerar ocultarlos por defecto en perfiles públicos y que el usuario los active explícitamente.

---

## Completado

### ~~Mejora de diseño con ui-ux-pro-max-skill~~ ✅

Skill `ui-ux-pro-max` v2.5.0 instalado en `.claude/skills/ui-ux-pro-max/` (ámbito de proyecto, no global). Audit completo de UI/UX ejecutado sobre `master`: análisis de paleta, tipografía, border-radius, z-index, colores hardcodeados e identidad visual. Resultados documentados y priorizados en [Identidad visual y sistema de diseño](#identidad-visual-y-sistema-de-diseño).

---

### ~~Observabilidad — Sentry + Better Stack~~ ✅

`@sentry/angular` integrado en `main.ts` y `app.config.ts`. Captura automática de errores JavaScript no manejados en producción con `SentryErrorHandler`. Trazado de rutas con `TraceService` + `browserTracingIntegration`. Sentry solo se inicializa en producción (condicionado a `environment.sentry.enabled`). Source maps hidden activados en `angular.json` para stack traces legibles. `set-env.js` inyecta `SENTRY_DSN` en el build de Vercel. Integración Sentry ↔ Vercel configurada para subida automática de source maps en cada deploy. Better Stack configurado externamente como monitor HTTP de uptime.

---

### ~~Préstamos de juegos~~ ✅

Tabla `game_loans` en Supabase con RLS. Vista `user_games_full` actualizada con LEFT JOIN LATERAL para exponer `active_loan_id/to/at`. Capas de datos y dominio completas (`createLoan`, `returnLoan`, `getLoanHistory`). Formulario inline en la página de detalle con dos modos (prestar / devolver). Chip azul en la card con nombre truncado a 12 chars. Filtro **"Solo prestados"** en el sheet de filtros de la colección. Solo aplica a juegos con `format = 'physical'`.

---

### ~~Página de detalle de juego (`/games/:id`) — sección personal~~ ✅

Página con ruta propia `/games/:id`. La card navega a la página de detalle en lugar de abrir directamente el formulario de edición. La página muestra todos los datos personales del juego (estado, plataforma, formato, condición, precio, tienda, valoración, notas, fechas) junto con los botones de editar, eliminar y gestión de venta. La integración RAWG (descripción, screenshots, etc.) queda pendiente — ver [Integración RAWG en detalle de juego](#integración-rawg-en-detalle-de-juego).

---

### ~~Juegos a la venta~~ ✅

Toggle **"Gestionar venta"** desde la página de detalle del juego. Permite marcar un juego como disponible para vender con precio de venta deseado, y registrar la venta final con precio obtenido y fecha. Al registrar la venta el juego desaparece de la colección activa. Chip `sell` en la card indicando que el juego está a la venta, con precio si lo tiene. Filtro **"En venta"** en la colección. La vista de historial de ventas queda pendiente — ver [Historial de ventas](#historial-de-ventas-gamessold).

---

### ~~Historial de ventas (`/games/sold`)~~ ✅

Página `/games/sold` con los juegos vendidos (`sold_at IS NOT NULL`), accesible desde el bottom-nav/nav-rail. Cards estilo lista con portada, título, plataforma, precio de compra → precio de venta final y fecha de venta. Sin acciones — solo consulta. Al confirmar la venta desde el detalle, el juego desaparece de la colección activa y navega a `/games`. Índice único parcial `WHERE sold_at IS NULL` en `user_games` para permitir recomprar un juego ya vendido. Schema Supabase actualizado con los datos reales de producción.

---

### ~~Rediseño mobile de wishlist~~ ✅

Vista de detalle de item en pantalla completa en lugar de bottom sheet para mobile (≤768px portrait). Navegación con back button integrado. Scroll corregido para que el último item sea completamente visible.
