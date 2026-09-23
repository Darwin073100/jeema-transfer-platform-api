/**
 * Forma exacta de una línea de producto+lote a transferir (sección 1.2 de la spec).
 * Es la forma tipada del contenido de `payload.items[]`, usada como referencia
 * tanto por `CreateCloudTransferDTO` como por los mappers. El dominio en sí
 * NO tipa el payload (se mantiene como `any`, ver decisión D1) — este tipo
 * vive en `application/` únicamente para dar forma a la entrada del use-case.
 */
export interface TransferItemProductBlockDTO {
  /** Clave de matching primaria y autoritativa en B. */
  universalBarCode?: string;
  name: string;
  /** Solo informativo/de referencia, no se usa como clave de matching. */
  sku?: string;
  categoryName: string;
  categoryDescription?: string;
  brandName?: string;
  description?: string;
  unitOfMeasure: string;
  imageUrl?: string;
}

export interface TransferItemLotBlockDTO {
  lotNumber: string;
  purchasePrice: string;
  purchaseUnit: string;
  /** Cantidad que efectivamente viaja en este traspaso (puede ser parcial respecto al lote de origen). */
  transferredQuantity: string;
  expirationDate?: string;
  manufacturingDate?: string;
  originReceivedDate?: string;
  supplierName?: string;
}

export interface TransferItemInventoryBlockDTO {
  suggestedSalePriceOne?: string;
  suggestedSalePriceMany?: string;
  suggestedSaleQuantityMany?: string;
  suggestedSalePriceSpecial?: string;
  /** Puramente informativo/auditoría, no debe sumarse al inventario de B. */
  originQuantityOnHand?: string;
  suggestedLocation?: string;
}

export interface TransferItemPayloadDTO {
  /** Trazabilidad en A. B nunca debe usarlo para matching. */
  originLocalProductId: string;
  originLocalLotId?: string;
  originLocalInventoryItemId?: string;
  product: TransferItemProductBlockDTO;
  lot: TransferItemLotBlockDTO;
  inventory: TransferItemInventoryBlockDTO;
}
