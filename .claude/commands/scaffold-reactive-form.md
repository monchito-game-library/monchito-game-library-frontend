Genera una interfaz de formulario reactivo y su componente Angular siguiendo las convenciones del proyecto.

Argumento: $ARGUMENTS — nombre en kebab-case y campos opcionales (ej: `game-review rating:number comment:string?` o simplemente `game-review`).

## Artefactos a generar

Usa `src/app/entities/interfaces/forms/console-form.interface.ts` y `src/app/presentation/pages/collection/components/hardware-form-shell/` como referencia de patrón.

### 1. Interfaz de formulario — `src/app/entities/interfaces/forms/<entity>-form.interface.ts`

```typescript
export interface XxxFormValue {
  campo: TipoPlano | null;
}

export interface XxxForm {
  campo: FormControl<TipoPlano | null>;
}
```

- `XxxFormValue` con tipos planos (para `getRawValue()`)
- `XxxForm` con `FormControl<T>` tipado
- JSDoc de una línea en la interfaz
- Exportar ambas interfaces

### 2. Componente de formulario — `src/app/presentation/components/<entity>-form/<entity>-form.component.ts`

Estructura del componente (respetar el orden de miembros de CLAUDE.md):
1. Inyecciones privadas
2. Input `initialValues: InputSignal<Partial<XxxModel> | null>`
3. Input `saving: InputSignal<boolean>` (con valor por defecto `false`)
4. Output `save: OutputEmitterRef<XxxFormValue>`
5. Output `cancel: OutputEmitterRef<void>`
6. `form: FormGroup<XxxForm>` inicializado en el constructor
7. `ngOnInit` — si hay initialValues, parchear el form
8. `onSubmit()` — valida y emite save
9. `onCancel()` — emite cancel

### 3. Template HTML — `<entity>-form.component.html`
- Estructura básica con `mat-form-field` por campo
- Mensajes de error con `@if (form.get('campo')?.hasError('required'))`
- Botones "Cancelar" y "Guardar" con `[disabled]="saving()"`
- Usar directivas Angular Material: `matInput`, `matLabel`, `matError`

### 4. SCSS — `<entity>-form.component.scss`
- Espaciados en `rem`, múltiplos de 0.25
- Clases completas (`.xxx-form__field`, no `&__field`)
- Breakpoints al final si son necesarios

### 5. Spec boilerplate — `<entity>-form.component.spec.ts`
- Suite básica: creación del componente, valores iniciales del form, `onSubmit` con form válido/inválido, `onCancel`
- Usa mocks de `src/testing/` donde aplique

## Reglas
- Todos los imports vía path aliases
- Tipos explícitos en todo
- JSDoc en todos los métodos públicos y privados
