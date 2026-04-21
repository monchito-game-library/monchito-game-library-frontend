Analiza el proyecto en busca de violaciones de arquitectura y convenciones, complementando el linting automático con un informe en lenguaje natural.

Argumento opcional: $ARGUMENTS — ruta a analizar (por defecto `src/app`). Puede ser un fichero concreto o una carpeta.

## Qué detectar

### 1. Violaciones de capas
- `presentation/` importando directamente de `data/` (debe pasar por `domain/`)
- Cualquier capa importando modelos que no son de `entities/`
- Busca con grep: `from '@/data/` dentro de `src/app/presentation/`

### 2. Imports con rutas relativas prohibidas
- Cualquier `from '../` o `from '../../` fuera del mismo directorio
- Busca: `from '\.\./` en ficheros `.ts` de `src/app/`

### 3. Privados sin prefijo `_`
- Campos o métodos `private` sin `_` al inicio
- Busca: `private (?!readonly _|_)\w` en ficheros de componentes y repositorios

### 4. Signals sin tipo explícito
- `signal(` sin `WritableSignal<T>` declarado
- `computed(` sin tipo de retorno explícito donde sea no obvio

### 5. JSDoc incompleto
- Métodos públicos o privados sin bloque `/** ... */` anterior (excepto `ngOnInit`, `ngOnDestroy`, `ngOnChanges`, `ngAfterViewInit`, `constructor`)
- `@param` sin tipo entre llaves `{tipo}`

### 6. SCSS — espaciados en px
- `gap`, `margin`, `padding` con valor en `px` donde debería ser `rem`
- Excepción aceptada: valores decorativos en chips/badges (`padding: 2px 8px`)

### 7. SCSS — clases con `&__` anidado
- Patrón `&__elemento` que no sea `&--modificador`
- Busca: `&__` en ficheros `.scss`

### 8. Interfaces o tipos declarados dentro de componentes
- `interface` o `type` en ficheros `.component.ts` — deben estar en `@/interfaces/` o `@/types/`

## Formato del informe
Para cada violación encontrada:
- Fichero y línea
- Tipo de violación
- Fragmento de código afectado
- Sugerencia de corrección

Agrupa por categoría. Al final, da un resumen con el total por tipo.
Si no hay violaciones en una categoría, indícalo explícitamente.
