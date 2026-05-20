Sintetiza la conversación actual y genera un fichero `PLAN.md` en la raíz del proyecto, listo para ejecutarse con `/execute-plan`.

## Reglas

- **Sobrescribe siempre** el `PLAN.md` existente sin preguntar.
- **No muestres** el plan al usuario antes de escribirlo — ya se han discutido los detalles en la conversación.
- El fichero **nunca se commitea**: está en `.gitignore` o simplemente no trackeado.
- Comunicación con el usuario **siempre en español**.

## Flujo

### Paso 1 — Sintetizar el plan desde la conversación

Analiza la conversación actual y extrae:

- El **objetivo general** del trabajo a realizar.
- La lista ordenada de **pasos/commits** lógicos necesarios, de menor a mayor dependencia.
- Para cada paso:
  - Qué ficheros se van a tocar (estimación).
  - Qué criterios verificables indican que el paso está completo (tests, lint, tipado, checks de README retro, etc.).
  - Decisiones de diseño ya cerradas en la conversación que `tech` debe respetar sin reabrir.
  - Riesgos o dependencias entre pasos.
  - Si el paso modifica templates (`.html`), estilos (`.scss`), componentes visuales, layout, paleta de colores, tipografía o cualquier aspecto de la UX/UI: marcarlo con `**Afecta UI/UX:** sí`. En caso de duda, marcar como `sí`.

Si la conversación no tiene suficiente detalle para definir algún paso de forma accionable, márcalo explícitamente en el plan como `⚠️ PENDIENTE DE CONCRECIÓN` para que `/execute-plan` lo detecte en su Paso 1 y lo reporte al usuario.

### Paso 2 — Escribir el fichero

Escribe el contenido sintetizado en `PLAN.md` en la raíz del proyecto usando la herramienta `Write`. Usa el formato siguiente:

```markdown
# Plan: <título corto del objetivo>

## Objetivo general

<descripción breve de qué se consigue al completar el plan>

## Pasos

### step-1: <título imperativo>

**Objetivo:** <qué consigue este paso>
**Ficheros estimados:** <lista>
**Criterios de aceptación:**

- <criterio verificable>
  **Decisiones cerradas:**
- <decisión tomada en conversación que no se reabre>
  **Afecta UI/UX:** sí | no
  **Riesgos / dependencias:**
- <si aplica>

### step-2: ...
```

### Paso 3 — Confirmar al usuario

Tras escribir el fichero, informa al usuario con una sola línea:

> `PLAN.md` generado con N pasos. Listo para `/execute-plan`.
