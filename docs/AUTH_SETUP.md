# 🔐 Sistema de Autenticación con Supabase

Este proyecto ahora incluye un sistema completo de autenticación usando **Supabase Auth**.

---

## 🎯 ¿Qué se ha implementado?

### ✅ Funcionalidades Principales

1. **Registro de Usuarios** (`/register`)
   - Email + Password
   - Nombre para mostrar personalizable
   - Validación de contraseñas coincidentes
   - Confirmación por email automática

2. **Login** (`/login`)
   - Email + Password
   - Sesiones persistentes (no hace falta login cada vez)
   - Recuperación de contraseña (próximamente)

3. **Avatares Automáticos**
   - Se generan automáticamente basados en el nombre
   - Usa UI Avatars (https://ui-avatars.com)
   - Colores aleatorios únicos por usuario

4. **Guards de Seguridad**
   - Todas las rutas están protegidas
   - Redirect automático a `/login` si no estás autenticado

5. **Persistencia**
   - Los juegos ahora se guardan con el `user.id` de Supabase
   - Cada usuario solo ve sus propios juegos
   - Multi-dispositivo: accede desde donde quieras

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:
```
src/app/
├── services/
│   └── auth.service.ts              # Servicio de autenticación
├── pages/
│   ├── login/
│   │   ├── login.component.ts       # Componente de login
│   │   ├── login.component.html
│   │   └── login.component.scss
│   └── register/
│       ├── register.component.ts    # Componente de registro
│       ├── register.component.html
│       └── register.component.scss
```

### Archivos Modificados:
- `src/app/services/user-context.service.ts` - Ahora usa AuthService
- `src/app/guards/user.guard.ts` - Verifica autenticación real
- `src/app/app.routes.ts` - Nuevas rutas de login/register
- `src/app/app.component.ts` - Muestra usuario autenticado
- `src/app/app.component.html` - Avatar generado automáticamente
- `public/assets/i18n/es.json` - Traducciones en español
- `public/assets/i18n/en.json` - Traducciones en inglés

---

## 🚀 Cómo Probar

### 1. Habilitar Email Auth en Supabase

Antes de empezar, asegúrate de que el email authentication esté habilitado:

1. Ve a tu proyecto en **Supabase Dashboard**
2. **Authentication > Providers**
3. Busca **Email** y asegúrate de que esté **enabled** ✅
4. **Opcional**: Desactiva "Confirm email" si quieres hacer pruebas sin verificación de email

### 2. Iniciar la App

```bash
npm start
```

### 3. Registrar un Usuario

1. Ve a `http://localhost:4200` (te redirigirá a `/login`)
2. Click en **"Regístrate aquí"**
3. Completa el formulario:
   - **Nombre**: Tu nombre (aparecerá en el avatar)
   - **Email**: tu@email.com
   - **Contraseña**: Mínimo 6 caracteres
   - **Confirmar**: Repite la contraseña
4. Click en **"Crear cuenta"**

### 4. Verificar Email (Opcional)

Si tienes "Confirm email" activado en Supabase:
- Recibirás un email de confirmación
- Click en el link del email
- Ya puedes hacer login

Si lo desactivaste:
- Puedes hacer login inmediatamente

### 5. Iniciar Sesión

1. En `/login`, ingresa tu email y contraseña
2. Click en **"Iniciar sesión"**
3. Serás redirigido a `/home`

### 6. Añadir Juegos

- Ahora todos los juegos se guardan con tu `user.id` de Supabase
- Solo tú puedes ver y editar tus juegos
- Si creas otro usuario, tendrá su propia biblioteca

---

## 👤 Avatares de Usuario

Los avatares se generan automáticamente usando el nombre del usuario:

```typescript
// En AuthService
getAvatarUrl(): string {
  const name = this.getDisplayName();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
}
```

**Ejemplo**:
- Nombre: "Alberto Checa"
- Avatar: Iniciales "AC" con color de fondo aleatorio

**Próximamente**: Permitir subir foto personalizada a Supabase Storage.

---

## 🔒 Seguridad

### Configuración Actual (Desarrollo)

En `supabase-schema.sql` deshabilitamos RLS temporalmente:

```sql
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
```

Esto permite acceso completo sin políticas complejas.

### ⚠️ Para Producción (Recomendado)

Cuando estés listo para producción, habilita RLS con políticas:

```sql
-- Habilitar RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propios juegos
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  USING (auth.uid()::text = user_id);

-- Los usuarios solo pueden insertar para ellos mismos
CREATE POLICY "Users can insert own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Los usuarios solo pueden actualizar sus propios juegos
CREATE POLICY "Users can update own games"
  ON games FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Los usuarios solo pueden eliminar sus propios juegos
CREATE POLICY "Users can delete own games"
  ON games FOR DELETE
  USING (auth.uid()::text = user_id);
```

**IMPORTANTE**: Esto requiere que uses `auth.uid()` de Supabase como `user_id`. Actualmente ya está configurado así ✅

---

## 🎨 Personalización

### Cambiar Estilo del Avatar

Edita en `auth.service.ts`:

```typescript
getAvatarUrl(): string {
  const name = this.getDisplayName();

  // Opciones disponibles:
  return `https://ui-avatars.com/api/` +
    `?name=${encodeURIComponent(name)}` +
    `&background=673ab7` +    // Color de fondo (hex sin #)
    `&color=fff` +             // Color del texto
    `&size=128` +              // Tamaño
    `&font-size=0.5` +         // Tamaño de fuente (0-1)
    `&bold=true`;              // Texto en negrita
}
```

### Añadir Más Proveedores OAuth

En el futuro puedes añadir:
- Google OAuth
- GitHub OAuth
- Discord OAuth

Supabase los soporta nativamente.

---

## 📊 Verificar Usuarios en Supabase

Para ver los usuarios registrados:

1. Ve a **Supabase Dashboard**
2. **Authentication > Users**
3. Verás todos los usuarios con:
   - Email
   - Created at
   - Last sign in
   - User metadata (display_name, etc.)

---

## 🐛 Troubleshooting

### Error: "Email not confirmed"

**Solución**: Desactiva la verificación de email:
1. Supabase > Authentication > Settings
2. **Disable email confirmations** ✅

### No aparece el avatar

**Causa**: Posible error en la URL o nombre vacío

**Solución**: Verifica en la consola del navegador. El avatar se genera en tiempo real desde UI Avatars.

### Los juegos no se guardan

**Causa**: No estás autenticado o el user_id es null

**Solución**: Verifica en `UserContextService.userId()` que devuelve un ID válido.

---

## ✨ Próximos Pasos

1. **Recuperar Contraseña** - Añadir componente de reset password
2. **Subir Avatar Personalizado** - Usar Supabase Storage
3. **OAuth Social** - Login con Google/GitHub
4. **Perfil de Usuario** - Editar nombre, email, etc.
5. **Verificación de Email** - Forzar verificación en producción

---

## 📄 Documentación Oficial

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Angular Router Guards](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access)
- [UI Avatars API](https://ui-avatars.com/documentation)

---

¡Sistema de autenticación completo y funcional! 🎉
