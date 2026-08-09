import { Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';

/**
 * UrlMatcher para los child-routes de `/sale`. Recibe los segmentos
 * RELATIVOS al path padre (`/sale`), por lo que:
 *   - `/sale`           → segments = []
 *   - `/sale/available` → segments = ['available']
 *   - `/sale/history`   → segments = ['history']
 *   - `/sale/`          → segments = ['']  (trailing slash, alias de `/sale`)
 *   - `/sale/foo/bar`   → segments = ['foo', 'bar']  (no match → catch-all)
 *   - `/sale/unknown`   → segments = ['unknown']  (no match → catch-all)
 *
 * La razón de usar un matcher (en lugar de rutas con `path: 'available'`
 * y `path: 'history'`) es que Angular destruye y reconstruye el componente
 * al cambiar entre rutas con path distinto. Con un matcher único, las
 * cuatro URLs válidas (`/sale`, `/sale/`, `/sale/available`, `/sale/history`)
 * reutilizan la misma instancia de `SaleComponent`, conservando el estado
 * (signals, suscripción a la URL, etc.) y evitando peticiones duplicadas
 * a Supabase. Cualquier otro segmento de un solo carácter o más de un
 * segmento se descarta con `null` para que el catch-all siguiente redirija
 * a `/sale/available`.
 */
function isSalePath(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) {
    return { consumed: segments };
  }
  if (segments.length === 1) {
    const path = segments[0].path;
    if (path === '' || path === 'available' || path === 'history') {
      return { consumed: segments };
    }
    return null;
  }
  return null;
}

export const saleRoutes: Route[] = [
  // `/sale`, `/sale/`, `/sale/available` y `/sale/history` cargan el mismo
  // SaleComponent (single-instance vía matcher).
  {
    canActivate: [canActivateUser],
    loadComponent: () => import('./sale.component').then((m) => m.SaleComponent),
    matcher: isSalePath
  },
  // Catch-all: cualquier ruta colgada bajo `/sale/...` (cualquier segmento
  // desconocido, p.ej. `/sale/unknown`, o más de 1 segmento) redirige al
  // tab por defecto.
  { path: '**', redirectTo: '/sale/available', pathMatch: 'full' }
];
