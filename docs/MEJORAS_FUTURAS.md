# Mejoras futuras

## Búsqueda de catálogo (game-form)

**Problema actual:** el botón "Buscar en catálogo" abre un `MatDialog` con una grid de cards grandes y búsqueda manual (hay que pulsar botón).

**Propuesta:** eliminar el dialog y reemplazarlo por dos modos dentro de la misma página `game-form`, alternando con animación Angular:

```
[ MODO FORMULARIO ]                    [ MODO BÚSQUEDA ]
┌──────────┬────────────────────┐      ┌────────────────────────────────┐
│ portada  │  campos del form   │  ⇄   │ 🔍 [buscar mientras escribes]  │
│          │                    │      ├────────────────────────────────┤
│          │                    │      │ resultado 1  (card horizontal)  │
└──────────┴────────────────────┘      │ resultado 2                    │
                                       │ resultado 3  ...               │
                                       └────────────────────────────────┘
```

- **Modo formulario** — layout actual (portada + campos del form)
- **Modo búsqueda** — ocupa todo el área de contenido:
  - Input con debounce ~400ms, sin botón de buscar
  - Resultados en lista de cards **horizontales** (no grid):
    - Portada pequeña (portrait) a la izquierda
    - Título grande + año + Metacritic score
    - Rating RAWG con estrella
    - Plataformas como badges
    - Géneros en tono secundario
    - Descripción corta si existe
  - Al seleccionar un juego → animación de vuelta a modo formulario con datos rellenos
