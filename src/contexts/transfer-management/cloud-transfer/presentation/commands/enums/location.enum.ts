/**
 * Ubicación física/estado sugerido para el inventario recibido.
 * Espejo de `LocationEnum` en el dbml de referencia (`jeema-store-platform.dbml`).
 * Vive en `presentation/` porque solo se usa para validar la forma del payload
 * (sección 1.2 de la spec) — el dominio de esta API no tipa el payload (ver D1).
 */
export enum LocationEnum {
  VENTA = 'venta',
  ALMACEN = 'almacen',
  DANADO = 'dañado',
  VIAJANDO = 'viajando',
}
