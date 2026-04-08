# Order Detail — Arquitectura de componentes

Documentación de la página de detalle de pedido (`/orders/:id`) y sus sub-componentes.

---

## Estructura de ficheros

```
presentation/pages/orders/order-detail/
├── order-detail.component.ts / .html / .scss   ← página principal (orquestador)
└── components/
    ├── add-edit-line-dialog/                    ← dialog para añadir/editar una línea
    ├── ready-dialog/                            ← dialog de confirmación al avanzar a "ready"
    ├── order-info-section/                      ← sección de cabecera e info del pedido
    ├── order-product-list/                      ← tabla de líneas / productos
    ├── order-stepper/                           ← stepper de selección de packs
    └── order-cost-summary/                      ← resumen de costes
```

---

## Ciclo de vida del pedido

```
draft → selecting_packs → ready → ordered → shipped → received
```

| Estado | Descripción |
|---|---|
| `draft` | El owner y los miembros añaden sus líneas con las cantidades necesarias. |
| `selecting_packs` | El owner elige qué pack comprar para cada producto via el stepper. |
| `ready` | Los packs están confirmados. El pedido está listo para hacer el encargo al proveedor. |
| `ordered` | El pedido ha sido realizado al proveedor. |
| `shipped` | El proveedor ha enviado el paquete. |
| `received` | El paquete ha llegado. Pedido cerrado. |

Solo el owner puede avanzar o retroceder el estado.

---

## Componente orquestador — `OrderDetailComponent`

**Responsabilidades:**
- Carga el pedido desde Supabase y mantiene la señal `order`.
- Suscripciones realtime a `order_members` y `order_lines` para recargar silenciosamente.
- Gestiona el layout de edición: `editingHeader` (colapsa el área de líneas) y `editingLayout` (expande el área de info).
- Construye los `PackStepData[]` para el stepper cuando el estado es `selecting_packs`.
- Coordina las acciones del owner: avanzar/retroceder estado, confirmar packs, borrar pedido, invitar miembros.

**Señales públicas:**

| Señal | Tipo | Descripción |
|---|---|---|
| `order` | `WritableSignal<OrderModel \| null>` | Pedido cargado |
| `loading` | `WritableSignal<boolean>` | Spinner de carga inicial |
| `saving` | `WritableSignal<boolean>` | Operación en curso (deshabilita botones) |
| `editingHeader` | `WritableSignal<boolean>` | Modo edición activo (colapsa líneas) |
| `editingLayout` | `WritableSignal<boolean>` | Info section expandida a flex:1 |
| `packSteps` | `WritableSignal<PackStepData[]>` | Pasos del stepper |
| `allPacksSelected` | `WritableSignal<boolean>` | Todos los packs confirmados (alimentado por el stepper) |

---

## `OrderInfoSectionComponent`

**Selector:** `app-order-info-section`
**Fichero:** `components/order-info-section/`

Muestra y permite editar la cabecera del pedido: título, estado, fechas, costes (envío, PayPal, descuento) y la lista de miembros con sus badges de estado.

### Inputs

| Input | Tipo | Descripción |
|---|---|---|
| `order` | `InputSignal<OrderModel>` | Pedido a mostrar |

### Outputs

| Output | Tipo | Descripción |
|---|---|---|
| `editingStarted` | `void` | El usuario ha pulsado "Guardar" para entrar en modo edición |
| `editingEnded` | `void` | El usuario ha cancelado o guardado — la edición ha terminado |
| `headerSaved` | `void` | Los cambios de cabecera se han persistido correctamente |

### Método público

| Método | Descripción |
|---|---|
| `startEditing()` | Abre el formulario de edición. Llamado por el padre via `@ViewChild`. |

### Comportamiento

- En modo vista: muestra info en filas etiqueta/valor + chips de miembros.
- En modo edición: muestra un `MatExpansionPanel` con el formulario reactivo (`HeaderForm`).
- Gestiona internamente `editingHeader`, `hidingActions`, el `FormGroup` y el guardado.
- La animación de expansión/colapso del formulario usa CSS grid (`grid-template-rows: 0fr → 1fr`).

---

## `OrderProductListComponent`

**Selector:** `app-order-product-list`
**Fichero:** `components/order-product-list/`

Tabla de líneas del pedido con scroll vertical propio.

### Inputs

| Input | Tipo | Descripción |
|---|---|---|
| `order` | `InputSignal<OrderModel>` | Pedido cuyas líneas se muestran |
| `editingHeader` | `InputSignal<boolean>` | Colapsa la sección mientras la cabecera está en edición |

### Outputs

| Output | Tipo | Descripción |
|---|---|---|
| `lineAdd` | `void` | El usuario solicita añadir una línea nueva |
| `lineEdit` | `OrderLineModel` | El usuario solicita editar una línea existente |
| `lineDelete` | `string` | El usuario solicita eliminar una línea (pasa el ID) |

### Comportamiento según estado

| Estado | Vista |
|---|---|
| `draft` | Solo las líneas del usuario actual. Columnas: Producto, Uds. necesarias, Acciones (editar/borrar). |
| Resto | Líneas **agrupadas por producto** (un miembro que pide 5 + otro que pide 3 = una fila de 8). Columnas: Producto, Precio unitario, Uds. pedidas, Subtotal. Sin acciones. |

Cada fila de producto muestra el nombre, categoría y un icono `open_in_new` si el producto tiene URL (enlace directo al proveedor).

### Scroll

La cadena flex que permite scroll real dentro de la sección:
```
:host (flex column) → section-body (flex:1 + display:grid) → section-body-inner (flex column) → table-wrapper (flex:1 overflow:auto)
```

---

## `OrderStepperComponent`

**Selector:** `app-order-stepper`
**Fichero:** `components/order-stepper/`

Stepper paso a paso para que el owner elija el pack óptimo de cada producto. Solo visible cuando el estado es `selecting_packs` y el usuario es el owner.

### Inputs

| Input | Tipo | Descripción |
|---|---|---|
| `order` | `InputSignal<OrderModel>` | Pedido en curso |
| `packSteps` | `InputSignal<PackStepData[]>` | Pasos construidos por el padre |
| `editingHeader` | `InputSignal<boolean>` | Colapsa la sección durante la edición de cabecera |

### Outputs

| Output | Tipo | Descripción |
|---|---|---|
| `allPacksSelectedChange` | `boolean` | Emite cuando cambia si todos los packs han sido confirmados |

### Interfaces exportadas

```typescript
export interface MemberQty {
  userId: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  qty: number;
}

export interface PackStepData {
  productId: string;
  productName: string;
  totalNeeded: number;
  suggestions: PackSuggestion[];   // del pack-optimizer.util
  lineIds: string[];
  memberBreakdown: MemberQty[];
}
```

### Estado interno

| Señal | Descripción |
|---|---|
| `currentStep` | Índice del paso actual |
| `stepSelections` | Map de productId → índice de sugerencia seleccionada |
| `_confirmedSelections` | Set de productIds confirmados explícitamente por el owner |

El estado se re-inicializa automáticamente vía `effect()` cuando cambia el input `packSteps`.

### Comportamiento

- Cada paso muestra el producto, las unidades totales necesarias, el desglose por miembro y las opciones de pack sugeridas por `optimizePacks()`.
- Al seleccionar un pack, persiste inmediatamente `unitPrice` y `quantityOrdered` en las líneas de Supabase (actualización en tiempo real para los miembros).
- La distribución de unidades entre miembros usa el **método de resto mayor** para garantizar que la suma sea exactamente `totalUnits`.
- Botones de navegación: `← Anterior` / `Siguiente →` (con icono + texto, `mat-stroked-button`).

---

## `OrderCostSummaryComponent`

**Selector:** `app-order-cost-summary`
**Fichero:** `components/order-cost-summary/`

Solo visible en estados `ready`, `ordered`, `shipped` y `received` (una vez los packs han sido calculados).

### Inputs

| Input | Tipo | Descripción |
|---|---|---|
| `order` | `InputSignal<OrderModel>` | Pedido cuyos costes se muestran |
| `userId` | `InputSignal<string \| null>` | UUID del usuario autenticado |

### Secciones

#### Mi parte (expandible)

Desglose del coste del usuario actual:

| Línea | Cálculo |
|---|---|
| Productos | `Σ (unitPrice × quantityOrdered)` de las líneas del usuario |
| Envío | `shippingCost × (miSubtotal / totalSubtotal)` — proporcional a lo pedido |
| Comisión PayPal | `paypalFee × (miSubtotal / totalSubtotal)` — proporcional a lo pedido |

Las líneas de Envío y PayPal solo aparecen si el valor es > 0.

#### Total pedido (expandible)

Lista de todos los miembros con su coste total individual, ordenados por rol (owner primero).

### Lógica de reparto

Envío y PayPal se reparten **de forma proporcional** al valor de lo que ha pedido cada miembro. Quien pide más, paga una parte mayor de los gastos comunes. Esto es más justo que el reparto igualitario cuando hay mucha diferencia entre los pedidos de los miembros.

---

## Animaciones de colapso

Todas las secciones colapsables usan la misma técnica CSS:

```scss
// Contenedor: grid con transición de altura
display: grid;
grid-template-rows: 1fr;          // expandido
// →
grid-template-rows: 0fr;          // colapsado

// Inner: overflow:hidden + fade
overflow: hidden;
opacity: 1;                       // expandido
// →
opacity: 0;                       // colapsado
```

El timing está escalonado para eliminar saltos visuales:
- `editingHeader` se activa inmediatamente (colapsa las líneas).
- `editingLayout` se activa 300 ms después (expande la info section).
