import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TransferItemCommand } from './transfer-item.command';

export class CreateCloudTransferCommand {
  @IsNotEmpty({ message: 'El id de la sucursal de origen es obligatorio.' })
  @IsNumberString(
    {},
    { message: 'El id de la sucursal de origen es una cadena numérica.' },
  )
  readonly fromCloudBranchId: string;

  @IsNotEmpty({ message: 'El id de la sucursal de destino es obligatorio.' })
  @IsNumberString(
    {},
    { message: 'El id de la sucursal de destino es una cadena numérica.' },
  )
  readonly toCloudBranchId: string;

  @IsNotEmpty({ message: 'El id local del traspaso es obligatorio.' })
  @IsNumberString(
    {},
    { message: 'El id local del traspaso es una cadena numérica.' },
  )
  readonly localTransferId: string;

  @IsOptional()
  @IsString({ message: 'La nota de envío debe ser una cadena.' })
  @MaxLength(500, {
    message: 'La nota de envío no debe ser mayor a 500 caracteres.',
  })
  readonly shipmentNotes?: string;

  @IsArray({ message: 'Los items deben ser un arreglo.' })
  @ArrayMinSize(1, { message: 'El traspaso debe incluir al menos un item.' })
  @ValidateNested({ each: true })
  @Type(() => TransferItemCommand)
  readonly items: TransferItemCommand[];
}
