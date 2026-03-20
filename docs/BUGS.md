# Monchito Game Library — Bugs conocidos

> Registro de bugs detectados pendientes de corregir.

---

## Índice

| Bug | Componente | Prioridad |
|---|---|---|
| ~~[Zoom + drag inoperativo en el reposicionamiento de portada](#zoom--drag-inoperativo-en-el-reposicionamiento-de-portada)~~ | `GameCoverPositionDialogComponent` | ✅ Resuelto |

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

**Causa:** la fórmula de sensibilidad del drag era incorrecta — usaba `overflowX + containerW*(s-1)` en vez de `(containerW + overflowX)*s - containerW`. Al escalar, el drag era demasiado rápido, la imagen alcanzaba el borde al instante y quedaba clampeada. Además, el `transform-origin` estaba fijo al centro del elemento en vez de seguir la posición actual (`posX% posY%`), lo que hacía que el zoom no entrara en el punto correcto.

**Solución (commit `fix/cover-position-drag`):** corrección de la fórmula de overflow efectivo, `transform-origin` dinámico vinculado a `positionCss()`, y manejo de `touchend` para resetear `_lastPointerX/Y` al soltar un dedo del pinch.
