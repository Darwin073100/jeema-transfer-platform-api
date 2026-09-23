import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ForSaleEnum } from './enums/for-sale.enum';
import { LocationEnum } from './enums/location.enum';

/**
 * Bloque `product` de un item de traspaso (sección 1.2 de la spec).
 */
export class ProductBlockCommand {
  @IsOptional()
  @IsString({ message: 'El código de barras universal debe ser una cadena.' })
  readonly universalBarCode?: string;

  @IsNotEmpty({ message: 'El nombre del producto es obligatorio.' })
  @IsString({ message: 'El nombre del producto debe ser una cadena.' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'El SKU debe ser una cadena.' })
  readonly sku?: string;

  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio.' })
  @IsString({ message: 'El nombre de la categoría debe ser una cadena.' })
  readonly categoryName: string;

  @IsOptional()
  @IsString({ message: 'La descripción de la categoría debe ser una cadena.' })
  readonly categoryDescription?: string;

  @IsOptional()
  @IsString({ message: 'El nombre de la marca debe ser una cadena.' })
  readonly brandName?: string;

  @IsOptional()
  @IsString({ message: 'La descripción del producto debe ser una cadena.' })
  readonly description?: string;

  @IsNotEmpty({ message: 'La unidad de medida es obligatoria.' })
  @IsEnum(ForSaleEnum, { message: 'La unidad de medida no es válida.' })
  readonly unitOfMeasure: ForSaleEnum;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida.' })
  readonly imageUrl?: string;
}

/**
 * Bloque `lot` de un item de traspaso (sección 1.2 de la spec).
 */
export class LotBlockCommand {
  @IsNotEmpty({ message: 'El número de lote es obligatorio.' })
  @IsString({ message: 'El número de lote debe ser una cadena.' })
  readonly lotNumber: string;

  @IsNotEmpty({ message: 'El precio de compra es obligatorio.' })
  @IsNumberString(
    {},
    { message: 'El precio de compra es una cadena numérica (decimal).' },
  )
  readonly purchasePrice: string;

  @IsNotEmpty({ message: 'La unidad de compra es obligatoria.' })
  @IsEnum(ForSaleEnum, { message: 'La unidad de compra no es válida.' })
  readonly purchaseUnit: ForSaleEnum;

  @IsNotEmpty({ message: 'La cantidad transferida es obligatoria.' })
  @IsNumberString(
    {},
    { message: 'La cantidad transferida es una cadena numérica (decimal).' },
  )
  readonly transferredQuantity: string;

  @IsOptional()
  @IsString({
    message: 'La fecha de caducidad debe ser una cadena ISO (YYYY-MM-DD).',
  })
  readonly expirationDate?: string;

  @IsOptional()
  @IsString({
    message: 'La fecha de fabricación debe ser una cadena ISO (YYYY-MM-DD).',
  })
  readonly manufacturingDate?: string;

  @IsOptional()
  @IsString({
    message:
      'La fecha de recepción de origen debe ser una cadena ISO (YYYY-MM-DD).',
  })
  readonly originReceivedDate?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del proveedor debe ser una cadena.' })
  readonly supplierName?: string;
}

/**
 * Bloque `inventory` de un item de traspaso (sección 1.2 de la spec). Valores de
 * referencia sugeridos, no vinculantes para B.
 */
export class InventoryBlockCommand {
  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'El precio sugerido de venta unitario es una cadena numérica (decimal).',
    },
  )
  readonly suggestedSalePriceOne?: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'El precio sugerido de venta por mayoreo es una cadena numérica (decimal).',
    },
  )
  readonly suggestedSalePriceMany?: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'La cantidad sugerida de venta por mayoreo es una cadena numérica (decimal).',
    },
  )
  readonly suggestedSaleQuantityMany?: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'El precio sugerido de venta especial es una cadena numérica (decimal).',
    },
  )
  readonly suggestedSalePriceSpecial?: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'La cantidad de origen en existencia es una cadena numérica (decimal).',
    },
  )
  readonly originQuantityOnHand?: string;

  @IsOptional()
  @IsEnum(LocationEnum, { message: 'La ubicación sugerida no es válida.' })
  readonly suggestedLocation?: LocationEnum;
}

/**
 * `TransferItemCommand` — una línea de producto+lote a transferir (sección 1.2 de la spec).
 */
export class TransferItemCommand {
  @IsNotEmpty({ message: 'El id local de origen del producto es obligatorio.' })
  @IsNumberString(
    {},
    {
      message:
        'El id local de origen del producto es una cadena numérica (bigint).',
    },
  )
  readonly originLocalProductId: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'El id local de origen del lote es una cadena numérica (bigint).',
    },
  )
  readonly originLocalLotId?: string;

  @IsOptional()
  @IsNumberString(
    {},
    {
      message:
        'El id local de origen del renglón de inventario es una cadena numérica (bigint).',
    },
  )
  readonly originLocalInventoryItemId?: string;

  @ValidateNested()
  @Type(() => ProductBlockCommand)
  readonly product: ProductBlockCommand;

  @ValidateNested()
  @Type(() => LotBlockCommand)
  readonly lot: LotBlockCommand;

  @ValidateNested()
  @Type(() => InventoryBlockCommand)
  readonly inventory: InventoryBlockCommand;
}
