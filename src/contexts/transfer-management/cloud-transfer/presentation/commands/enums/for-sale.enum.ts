/**
 * Unidades de venta/compra posibles para un producto o lote transferido.
 * Espejo de `ForSaleEnum` en el dbml de referencia (`jeema-store-platform.dbml`).
 * Vive en `presentation/` porque solo se usa para validar la forma del payload
 * (sección 1.2 de la spec) — el dominio de esta API no tipa el payload (ver D1).
 */
export enum ForSaleEnum {
  KG = 'kg',
  L = 'l',
  M = 'm',
  PC = 'pc',
  DOC = 'doc',
  PAQUETE = 'paquete',
  CAJA = 'caja',
  SET = 'set',
}
