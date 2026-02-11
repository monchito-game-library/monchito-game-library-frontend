# Guía de Migración a Esquema V2 (Con RAWG API)

## 📋 Resumen

Esta guía te ayudará a migrar de la tabla `games` antigua al nuevo esquema con catálogo de juegos (`game_catalog` + `user_games`).

## 🎯 Ventajas del Nuevo Esquema

- ✅ **Catálogo Global**: Juegos únicos compartidos entre usuarios
- ✅ **Imágenes Automáticas**: Integración con RAWG API
- ✅ **Datos Enriquecidos**: Rating, plataformas, géneros, fechas
- ✅ **Mejor Performance**: Menos duplicación de datos
- ✅ **Escalabilidad**: Preparado para múltiples usuarios

## 🚀 Pasos de Migración

### 1. Backup de Datos Actual (IMPORTANTE)

Antes de cualquier cambio, exporta tus datos actuales:

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT * FROM games;
```

Guarda el resultado como JSON o CSV.

### 2. Ejecutar Nuevo Esquema

1. Ve a Supabase Dashboard → SQL Editor
2. Abre el archivo: `docs/supabase-schema-v2.sql`
3. Copia todo el contenido
4. Pégalo en SQL Editor
5. Ejecuta (Run)

Esto creará las nuevas tablas:
- `game_catalog`
- `user_games`
- Vista `user_games_with_catalog`

### 3. Ejecutar Migración de Datos

1. Abre el archivo: `docs/migration-to-v2.sql`
2. Copia todo el contenido
3. Pégalo en SQL Editor
4. Ejecuta (Run)

El script:
- ✅ Extrae juegos únicos de `games` → `game_catalog`
- ✅ Crea referencias en `user_games` con tus datos personales
- ✅ Muestra resumen de migración
- ⚠️ NO elimina la tabla `games` (por seguridad)

### 4. Verificar Migración

Ejecuta estas consultas para verificar:

```sql
-- Ver resumen
SELECT
  (SELECT COUNT(*) FROM games) as old_games,
  (SELECT COUNT(*) FROM game_catalog) as catalog_games,
  (SELECT COUNT(*) FROM user_games) as user_games;

-- Ver tus juegos migrados (con la vista)
SELECT * FROM user_games_with_catalog
WHERE user_id = auth.uid()
LIMIT 10;

-- Ver juegos sin imagen (serán actualizados al buscar en RAWG)
SELECT title, platforms, rating FROM game_catalog
WHERE image_url IS NULL;
```

### 5. Actualizar Código (Frontend)

Necesitas actualizar el `SupabaseRepository` para usar las nuevas tablas.

**¿Quieres que actualice el repository automáticamente?** → Dímelo y lo hago ahora.

### 6. Probar la Aplicación

1. Levanta el servidor: `npm start`
2. Ve a "Añadir nuevo juego"
3. Haz clic en "Buscar Juego en Catálogo"
4. Busca un juego (ej: "Elden Ring")
5. Selecciona → Completa datos → Guarda

### 7. Eliminar Tabla Antigua (OPCIONAL)

**SOLO después de verificar que todo funciona correctamente:**

```sql
-- En Supabase SQL Editor:
DROP TABLE IF EXISTS games CASCADE;
```

## ⚠️ Notas Importantes

### Juegos Migrados Sin Imágenes

Los juegos de la tabla antigua no tienen imágenes porque no estaban en RAWG. Tienes dos opciones:

**Opción A: Buscar y Reemplazar**
1. Ve a tu lista de juegos
2. Edita cada juego
3. Usa el botón "Buscar Juego en Catálogo"
4. Selecciona el juego correcto de RAWG
5. Guarda → Ahora tendrá imagen y metadata

**Opción B: Mantener Como Están**
- Los juegos seguirán funcionando sin imagen
- Solo se mostrarán con icono por defecto

### RAWG ID Temporales

Los juegos migrados tienen `rawg_id` temporales generados por hash del título. Cuando busques y selecciones el juego de RAWG, se actualizará con el ID real.

### Juegos Duplicados Entre Usuarios

Si varios usuarios tenían el mismo juego:
- **Antes**: 1 registro por usuario en `games` (duplicación)
- **Ahora**: 1 registro en `game_catalog` + N referencias en `user_games` (eficiente)

## 🆘 Solución de Problemas

### "La tabla game_catalog no existe"
→ Ejecuta `supabase-schema-v2.sql` primero

### "Algunos juegos no se migraron"
→ Revisa que los títulos no estén vacíos o nulos

### "No aparecen mis juegos después de migrar"
→ Verifica el `user_id` en la tabla `user_games`

### "El repository da error"
→ Necesitas actualizar el código para usar las nuevas tablas

## 📞 ¿Necesitas Ayuda?

Si tienes algún problema durante la migración, avísame y te ayudo a resolverlo.

## ✅ Checklist

- [ ] Backup de datos actual exportado
- [ ] `supabase-schema-v2.sql` ejecutado
- [ ] `migration-to-v2.sql` ejecutado
- [ ] Verificación de datos OK
- [ ] Repository actualizado
- [ ] Aplicación probada
- [ ] Tabla `games` eliminada (opcional)
