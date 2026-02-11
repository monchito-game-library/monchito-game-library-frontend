# 🚀 Guía de Configuración de Supabase

Esta guía te llevará paso a paso para configurar Supabase como backend de tu aplicación de videojuegos.

---

## 📋 Requisitos Previos

- Una cuenta de GitHub (para login en Supabase)
- Node.js instalado (ya lo tienes)

---

## 🎯 Paso 1: Crear Cuenta y Proyecto en Supabase

1. **Ir a Supabase**
   - Visita: https://supabase.com
   - Click en "Start your project" o "Sign In"
   - Inicia sesión con GitHub (recomendado) o email

2. **Crear un Nuevo Proyecto**
   - Click en "New Project"
   - Completa los datos:
     - **Name**: `monchito-game-library` (o el nombre que prefieras)
     - **Database Password**: Crea una contraseña segura (guárdala en un lugar seguro)
     - **Region**: Selecciona la más cercana a ti (ej: `Europe West (London)` o `US East (Virginia)`)
     - **Pricing Plan**: Selecciona "Free" (Incluye 500MB de base de datos, 50K usuarios, etc.)
   - Click en "Create new project"
   - **Espera 1-2 minutos** mientras Supabase crea tu base de datos

---

## 🗄️ Paso 2: Crear la Tabla de Juegos

1. **Ir al Editor SQL**
   - En el menú lateral izquierdo, click en "SQL Editor"
   - Click en "New Query"

2. **Ejecutar el siguiente SQL**

   Copia y pega este código:

   ```sql
   -- Crear la tabla de juegos
   CREATE TABLE games (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT NOT NULL,
     title TEXT NOT NULL,
     price NUMERIC,
     store TEXT NOT NULL,
     condition TEXT NOT NULL,
     platinum BOOLEAN NOT NULL DEFAULT false,
     description TEXT NOT NULL DEFAULT '',
     platform TEXT,
     image TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Crear índices para mejorar el rendimiento
   CREATE INDEX idx_games_user_id ON games(user_id);
   CREATE INDEX idx_games_platform ON games(platform);
   CREATE INDEX idx_games_created_at ON games(created_at DESC);

   -- Función para actualizar el campo updated_at automáticamente
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = TIMEZONE('utc', NOW());
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   -- Trigger que actualiza updated_at en cada UPDATE
   CREATE TRIGGER update_games_updated_at
     BEFORE UPDATE ON games
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();
   ```

3. **Ejecutar la Query**
   - Click en el botón "Run" o presiona `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)
   - Deberías ver el mensaje "Success. No rows returned"

---

## 🔑 Paso 3: Obtener las Credenciales

1. **Ir a Settings > API**
   - En el menú lateral, click en el icono de engranaje (Settings)
   - Luego click en "API" en la sección "Project Settings"

2. **Copiar las Credenciales**

   Verás dos valores importantes:

   - **Project URL**:
     - Algo como: `https://xxxxxxxxxxxxx.supabase.co`
     - Copia este valor

   - **anon public key**:
     - En la sección "Project API keys"
     - Es un JWT largo que empieza con `eyJ...`
     - Copia este valor (el completo, es largo)

---

## ⚙️ Paso 4: Configurar las Credenciales en tu Proyecto

1. **Abrir el archivo de configuración**

   Navega a: `src/environments/environment.ts`

2. **Reemplazar los valores**

   Cambia:
   ```typescript
   supabase: {
     url: 'YOUR_SUPABASE_URL',
     anonKey: 'YOUR_SUPABASE_ANON_KEY'
   }
   ```

   Por tus valores reales:
   ```typescript
   supabase: {
     url: 'https://xxxxxxxxxxxxx.supabase.co',
     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Tu clave completa
   }
   ```

3. **Hacer lo mismo para producción** (opcional, por ahora)

   Edita `src/environments/environment.prod.ts` con los mismos valores

---

## 🔒 Paso 5: Configurar Políticas de Seguridad (RLS)

**IMPORTANTE**: Por defecto, Supabase protege tus tablas. Necesitas configurar políticas de acceso.

### Opción 1: Sin autenticación (más simple para empezar)

Si no quieres implementar autenticación de usuarios ahora, ejecuta este SQL:

```sql
-- Deshabilitar RLS temporalmente (solo para desarrollo)
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
```

### Opción 2: Con políticas básicas (recomendado)

Si quieres mantener seguridad pero permitir acceso anónimo:

```sql
-- Habilitar RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos
CREATE POLICY "Allow public read access"
  ON games FOR SELECT
  USING (true);

-- Permitir inserción a todos
CREATE POLICY "Allow public insert access"
  ON games FOR INSERT
  WITH CHECK (true);

-- Permitir actualización a todos
CREATE POLICY "Allow public update access"
  ON games FOR UPDATE
  USING (true);

-- Permitir eliminación a todos
CREATE POLICY "Allow public delete access"
  ON games FOR DELETE
  USING (true);
```

**Nota**: Estas políticas permiten acceso completo. En producción, deberías implementar autenticación y limitar el acceso por usuario.

---

## ✅ Paso 6: Probar la Aplicación

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

2. **Abrir en el navegador**
   - Ve a: `http://localhost:4200`
   - Selecciona un usuario
   - Intenta agregar un juego

3. **Verificar en Supabase**
   - En Supabase, ve a "Table Editor"
   - Selecciona la tabla `games`
   - Deberías ver el juego que acabas de crear

---

## 🎉 ¡Listo!

Tu aplicación ahora está conectada a Supabase. Los datos se guardan en la nube y son accesibles desde cualquier dispositivo.

---

## 🔄 Cambiar entre IndexedDB y Supabase

Si quieres volver a usar IndexedDB local, edita `src/app/app.config.ts`:

```typescript
// Usar Supabase (remoto)
{
  provide: GAME_REPOSITORY,
  useClass: SupabaseRepository
}

// O usar IndexedDB (local)
{
  provide: GAME_REPOSITORY,
  useClass: IndexedDBRepository
}
```

---

## 📊 Monitoreo y Gestión

En el dashboard de Supabase puedes:

- **Ver datos**: Table Editor
- **Ejecutar queries**: SQL Editor
- **Ver logs**: Logs
- **Monitorear uso**: Settings > Usage

---

## 🚀 Próximos Pasos (Opcionales)

1. **Implementar autenticación de usuarios**
   - Supabase Auth está incluido
   - Permite login con email, Google, GitHub, etc.

2. **Añadir Storage para imágenes**
   - Sube las portadas de juegos a Supabase Storage
   - Mejora el rendimiento

3. **Deploy a producción**
   - Deploy frontend en Vercel (gratis)
   - Ya tienes el backend en Supabase

---

## ❓ Problemas Comunes

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Verifica tu conexión a internet

### Error: "JWT expired" o "Invalid API key"
- Verifica que copiaste la `anon public key` completa
- Asegúrate de no tener espacios extras

### No aparecen los datos
- Verifica las políticas RLS (Paso 5)
- Ve al SQL Editor y ejecuta: `SELECT * FROM games;`

### "Row Level Security" bloqueando operaciones
- Ejecuta el SQL del Paso 5, Opción 1 o 2

---

## 🆘 Ayuda

- Documentación oficial: https://supabase.com/docs
- Discord de Supabase: https://discord.supabase.com
- Issues del proyecto: (tu repo de GitHub)
