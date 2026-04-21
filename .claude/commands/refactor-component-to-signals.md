Refactoriza un componente Angular que usa RxJS (BehaviorSubject, Observable, subscribe) para usar la API moderna de Signals.

Argumento: $ARGUMENTS — ruta del fichero o nombre del componente (ej: `src/app/presentation/pages/games/games.component.ts`).

## Transformaciones a aplicar

Lee el fichero indicado y aplica las siguientes transformaciones donde apliquen:

### 1. BehaviorSubject → WritableSignal
```typescript
// Antes
private _items$ = new BehaviorSubject<Item[]>([]);
readonly items$ = this._items$.asObservable();

// Después
readonly items: WritableSignal<Item[]> = signal<Item[]>([]);
```

### 2. .subscribe() para derivar estado → computed()
```typescript
// Antes
this._items$.subscribe(items => {
  this._filteredItems$.next(items.filter(i => i.active));
});

// Después
readonly filteredItems = computed(() => this.items().filter(i => i.active));
```

### 3. combineLatest → computed()
```typescript
// Antes
combineLatest([this._items$, this._filter$]).subscribe(([items, filter]) => { ... });

// Después
readonly result = computed(() => {
  const items = this.items();
  const filter = this.filter();
  return ...;
});
```

### 4. takeUntilDestroyed
- Si solo se usaba para suscripciones internas que ahora son computed/effect, elimínalo
- Si quedan suscripciones a Observables externos (ej: route.params, breakpointObserver), mantén `takeUntilDestroyed()` o usa `toSignal()`

### 5. async pipe en template → signal directa
```html
<!-- Antes -->
<div *ngIf="items$ | async as items">

<!-- Después -->
@if (items(); as items) {
```

### 6. Imports
- Elimina `BehaviorSubject`, `Subject`, `Observable`, `combineLatest` de `rxjs` si ya no se usan
- Añade `signal`, `computed`, `effect` de `@angular/core` si son necesarios
- Elimina `AsyncPipe` de los imports del componente si ya no hay async pipe en el template

## Reglas
- Respeta el orden de miembros de CLAUDE.md (signals públicos después de variables privadas)
- Tipos explícitos en todas las signals: `WritableSignal<T>`, no inferencia
- JSDoc actualizado en los signals que antes eran Observables
- No elimines suscripciones a fuentes externas (Router, BreakpointObserver, Supabase realtime) sin reemplazarlas por `toSignal()`
- Al terminar, lista los cambios realizados y cualquier suscripción que hayas mantenido y por qué
