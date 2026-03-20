# Monchito Game Library — Bugs conocidos

> Registro de bugs detectados pendientes de corregir.

---

## Índice

| Bug | Componente | Prioridad |
|---|---|---|
| [Zoom + drag inoperativo en el reposicionamiento de portada](#zoom--drag-inoperativo-en-el-reposicionamiento-de-portada) | `GameCoverPositionDialogComponent` | Alta |

---

## Zoom + drag inoperativo en el reposicionamiento de portada

**Componente:** `GameCoverPositionDialogComponent`
**Fichero:** `src/app/presentation/components/game-cover-position-dialog/`

**Descripción:**
Al hacer zoom sobre la imagen en el dialog de reposicionamiento de portada, el arrastre para desplazar la imagen deja de funcionar correctamente. El usuario no puede posicionarse en el área deseada después de aplicar zoom.

**Pasos para reproducir:**
1. Abrir el dialog de reposicionamiento de portada desde una card de juego.
2. Aplicar zoom a la imagen.
3. Intentar arrastrar la imagen para ajustar la posición.

**Comportamiento esperado:** tras hacer zoom, el drag debe seguir funcionando y permitir desplazar la imagen libremente dentro del marco.

**Comportamiento actual:** el drag no responde o no se desplaza correctamente después del zoom.
