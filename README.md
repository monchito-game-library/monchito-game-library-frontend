# 🎮 Monchito Game Library

**Monchito Game Library** es una aplicación Angular 19 diseñada para gestionar tu colección personal de videojuegos por consola, incluyendo detalles como precio, tienda, condición y si tiene platino. Es completamente local, usando IndexedDB, pero preparada para integrarse con una API en el futuro.

---

## 🚀 Demo en producción

👉 [https://monchito-game-library.github.io/monchito-game-library-frontend/](https://monchito-game-library.github.io/monchito-game-library-frontend/)

---

## 🧩 Características

- Gestión de videojuegos: título, precio, consola, condición, tienda, platino, descripción e imagen.
- Soporte multiusuario local con selección visual por avatar.
- Búsqueda, filtro por consola y paginación.
- Estadísticas rápidas (total de juegos y gasto total).
- Responsive y adaptado a móviles.
- Soporte multilenguaje con Transloco.
- Temas visuales dinámicos (light/dark/orange).
- Importación/exportación JSON.
- Guardado local con IndexedDB, fácilmente reemplazable por API REST.

---

## 🛠️ Scripts importantes

### Desarrollo

```bash
  npm install
  npm start
```

### Producción en GitHub Pages

Publica tu aplicación en GitHub Pages con:

```bash
  npm run deploy:pages
```

Este comando ejecuta internamente:

```bash
  npm run build:pages && npm run compile:pages
```

> Asegúrate de que `baseHref` esté configurado como `/monchito-game-library-frontend/` en `angular.json` para rutas correctas en Pages.

---

## 🖥️ Instalación desde cero (Windows)

Si quieres clonar y ejecutar este proyecto en tu máquina local:

1. Asegúrate de tener instalado:
  - [Node.js 18.x o superior](https://nodejs.org/)
  - [Git](https://git-scm.com/)
  - [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

2. Clona el repositorio:

```bash
  git clone https://github.com/monchito-game-library/monchito-game-library-frontend.git
  cd monchito-game-library-frontend
```

3. Instala dependencias:

```bash
  npm install
```

4. Inicia el proyecto en desarrollo:

```bash
  npm start
```

La app estará disponible en `http://localhost:4200`.

---

## 🧱 Tecnologías utilizadas

- Angular 19
- Angular Material
- Signals & Control Flow (`@for`, `@if`)
- IndexedDB local
- Transloco (i18n)
- SCSS y theming Angular Material v15+

---

## 📁 Estructura de carpetas

```
src/
├── components/         # Componentes reutilizables como game-card, game-form, select-user
├── models/             # Interfaces, tipos y constantes
├── pages/              # Vistas principales (listado, formulario, selección)
├── repositories/       # Acceso a IndexedDB
├── services/           # Servicios globales: user, theme, context
├── assets/images/      # Avatares de usuario y portadas por defecto
└── styles/             # SCSS global y temas
```

---

## 👥 Créditos

Proyecto creado por [@albertocheca](https://github.com/albertocheca) para gestionar colecciones de videojuegos con estilo y eficiencia.

---

## 📄 Licencia

MIT
