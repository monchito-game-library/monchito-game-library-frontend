# Monchito Game Library — Bugs conocidos

> Registro de bugs detectados pendientes de corregir.

---

## Índice

| Bug | Componente | Prioridad |
|---|---|---|
| ~~[Zoom + drag inoperativo en el reposicionamiento de portada](#zoom--drag-inoperativo-en-el-reposicionamiento-de-portada)~~ | `GameCoverPositionDialogComponent` | ✅ Resuelto |
| ~~[Espaciados SCSS no siguen la convención de rem/múltiplos de 0.25](#espaciados-scss-no-siguen-la-convención-de-remmúltiplos-de-025)~~ | Varios | ✅ Resuelto |

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

---

## Espaciados SCSS no siguen la convención de rem/múltiplos de 0.25

**Componente:** Varios ficheros SCSS

**Descripción:**
Varios ficheros SCSS usan valores de `gap`, `margin` y `padding` que incumplen una o ambas reglas de la convención:
1. Los espaciados deben estar en `rem`, no en `px`.
2. Los valores en `rem` deben ser múltiplos de `0.25` (0.25, 0.5, 0.75, 1, 1.25, 1.5…).

---

### Bloque 1 — Valores en `px` que deben convertirse a `rem` (conversión limpia)

#### `app.component.scss`
| Línea | Actual | Corrección |
|-------|--------|------------|
| 38 | `padding: 12px 0` | `0.75rem 0` |
| 61 | `gap: 4px` | `0.25rem` |
| 70 | `gap: 4px` | `0.25rem` |
| 72 | `padding: 12px 4px` | `0.75rem 0.25rem` |
| 102 | `margin: 4px 0` | `0.25rem 0` |
| 208 | `gap: 4px` | `0.25rem` |
| 209 | `padding: 8px 4px` | `0.5rem 0.25rem` |
| 233 | `margin: 8px !important` | `0.5rem !important` |

#### `settings.component.scss`
| Línea | Actual | Corrección |
|-------|--------|------------|
| 135 | `gap: 4px` | `0.25rem` |

#### `game-list.component.scss`
| Línea | Actual | Corrección |
|-------|--------|------------|
| 104 | `padding: 0 4px` | `0 0.25rem` |

#### `wishlist.component.scss`
| Línea | Actual | Corrección |
|-------|--------|------------|
| 13 | `padding: 24px` | `1.5rem` |
| 14 | `gap: 24px` | `1.5rem` |
| 23 | `gap: 16px` | `1rem` |
| 41 | `gap: 16px` | `1rem` |
| 47 | `gap: 4px` | `0.25rem` |
| 62 | `gap: 16px` | `1rem` |
| 63 | `padding: 48px 0` | `3rem 0` |
| 71 | `gap: 12px` | `0.75rem` |
| 72 | `padding: 64px 24px` | `4rem 1.5rem` |
| 97 | `gap: 12px` | `0.75rem` |
| 114 | `gap: 12px` | `0.75rem` |
| 120 | `gap: 8px` | `0.5rem` |
| 140 | `gap: 12px` | `0.75rem` |
| 141 | `padding: 8px 12px` | `0.5rem 0.75rem` |
| 179 | `gap: 4px` | `0.25rem` |
| 188 | `gap: 8px` | `0.5rem` |
| 214 | `gap: 8px` | `0.5rem` |
| 235 | `gap: 8px` | `0.5rem` |
| 247 | `padding: 20px` | `1.25rem` |
| 254 | `padding: 12px` | `0.75rem` |
| 255 | `gap: 16px` | `1rem` |
| 280 | `padding: 12px 16px` | `0.75rem 1rem` |

#### `wishlist-card.component.scss`
| Línea | Actual | Corrección |
|-------|--------|------------|
| 3 | `gap: 16px` | `1rem` |
| 4 | `padding: 12px` | `0.75rem` |
| 46 | `gap: 8px` | `0.5rem` |
| 80 | `gap: 4px` | `0.25rem` |
| 95 | `gap: 4px` | `0.25rem` |
| 155 | `gap: 4px` | `0.25rem` |

#### `wishlist-item-dialog.component.scss`
| Línea | Actual | Corrección |
|-------|--------|------------|
| 11 | `margin: 0 0 12px` | `0 0 0.75rem` |
| 19 | `gap: 12px` | `0.75rem` |
| 20 | `padding: 8px 12px` | `0.5rem 0.75rem` |
| 58 | `gap: 4px` | `0.25rem` |
| 65 | `gap: 8px` | `0.5rem` |
| 93 | `gap: 8px` | `0.5rem` |

---

### Bloque 2 — Valores en `rem` que no son múltiplos de 0.25

#### `0.15rem` → `0.25rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `stores-management.component.scss` | 114 | `margin-top: 0.15rem` |

#### `0.2rem` → `0.25rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `management.component.scss` | 23 | `gap: 0.2rem` |
| `audit-log-management.component.scss` | 96 | `gap: 0.2rem` |
| `game-form.component.scss` | 205 | `gap: 0.2rem` |

#### `0.3rem` → `0.25rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `game-search-panel.component.scss` | 166 | `gap: 0.3rem` |
| `protectors-management.component.scss` | 149 | `gap: 0.3rem` |
| `game-list.component.scss` | 35 | `gap: 0.3rem` |

#### `0.35rem` → `0.25rem` o `0.5rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `game-search-panel.component.scss` | 115 | `gap: 0.35rem` |
| `stores-management.component.scss` | 113 | `gap: 0.35rem` |
| `game-card.component.scss` | 138 | `margin: 0.35rem 0 0` |

#### `0.375rem` → `0.25rem` o `0.5rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `app.component.scss` | 275 | `margin-bottom: 0.375rem` |
| `app.component.scss` | 311 | `gap: 0.375rem` |
| `management.component.scss` | 118 | `gap: 0.375rem` |
| `audit-log-management.component.scss` | 62 | `gap: 0.375rem` |
| `game-list-filters-sheet.component.scss` | 52 | `padding: 0.375rem 0` |

#### `0.4rem` → `0.5rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `management.component.scss` | 132 | `padding: 0.4rem 0.875rem` |
| `game-card.component.scss` | 109 | `gap: 0.4rem` |
| `game-card.component.scss` | 254 | `gap: 0.4rem` |
| `game-form.component.scss` | 217 | `margin: 0.4rem 0 0` |
| `game-form.component.scss` | 332 | `gap: 0.4rem` |

#### `0.6rem` → `0.5rem` o `0.75rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `settings.component.scss` | 232 | `padding-left: 0.6rem` |
| `management.component.scss` | 36 | `padding: 0 0.6rem` |

#### `0.625rem` → `0.5rem` o `0.75rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `management.component.scss` | 44 | `padding: 0.625rem 0.75rem` |
| `game-list-filters-sheet.component.scss` | 12 | `padding: 0.625rem 0.5rem 0.625rem 1.25rem` |
| `game-list.component.scss` | 130 | `padding: 0.625rem 1.5rem` |
| `game-list.component.scss` | 222 | `padding: 0.625rem 0.75rem` |

#### `0.65rem` → `0.75rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `game-card.component.scss` | 351 | `padding: 0.65rem 2.75rem 0.65rem 0.65rem` |

#### `0.875rem` → `0.75rem` o `1rem`
| Fichero | Línea | Actual |
|---------|-------|--------|
| `management.component.scss` | 132 | `padding: 0.4rem 0.875rem` |
| `audit-log-management.component.scss` | 69 | `gap: 0.875rem` |
| `protectors-management.component.scss` | 70 | `padding: 0.875rem 1rem` |
| `users-management.component.scss` | 61 | `gap: 0.875rem` |

---

### Bloque 3 — Micro-espaciados en `px` en chips, badges y pills

> Valores donde la conversión a `rem` no produce un múltiplo limpio de 0.25 (1px, 2px, 3px, 5px, 6px, 7px, 10px, 14px). Son espaciados decorativos internos de elementos pequeños.

| Fichero | Línea | Actual |
|---------|-------|--------|
| `toggle-switch.component.scss` | 8 | `padding: 2px` |
| `game-search-panel.component.scss` | 145 | `padding: 1px 6px` |
| `game-search-panel.component.scss` | 153 | `gap: 2px` |
| `game-search-panel.component.scss` | 171 | `padding: 1px 7px` |
| `settings.component.scss` | 104 | `gap: 6px` |
| `settings.component.scss` | 139 | `gap: 2px` |
| `settings.component.scss` | 149 | `padding: 2px` |
| `settings.component.scss` | 175 | `padding: 2px 6px` |
| `settings.component.scss` | 188 | `padding: 3px` |
| `settings.component.scss` | 324 | `gap: 6px` |
| `settings.component.scss` | 450 | `gap: 6px` |
| `settings.component.scss` | 454 | `padding: 5px 14px` |
| `stores-management.component.scss` | 121 | `padding: 2px 8px` |
| `protectors-management.component.scss` | 113 | `padding: 2px 8px` |
| `protectors-management.component.scss` | 164 | `padding: 2px 5px` |
| `protectors-management.component.scss` | 170 | `padding: 2px 5px` |
| `protectors-management.component.scss` | 187 | `padding: 2px 8px` |
| `users-management.component.scss` | 120 | `padding: 2px 6px` |
| `game-card.component.scss` | 264 | `padding: 2px 7px` |
| `game-card.component.scss` | 324 | `gap: 3px` |
| `wishlist-card.component.scss` | 84 | `padding: 2px 8px` |
| `wishlist-card.component.scss` | 119 | `padding: 2px 8px` |
| `wishlist-card.component.scss` | 130 | `gap: 6px` |
| `wishlist-card.component.scss` | 135 | `padding: 2px 10px` |
| `wishlist-item-dialog.component.scss` | 37 | `gap: 2px` |
| `wishlist-item-dialog.component.scss` | 76 | `padding: 3px 10px` |
| `wishlist.component.scss` | 158 | `gap: 2px` |
| `wishlist.component.scss` | 219 | `padding: 3px 10px` |
