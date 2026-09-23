import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CancelCloudTransferCommand {
  @IsNotEmpty({
    message: 'El id de la sucursal que realiza la acción es obligatorio.',
  })
  @IsNumberString(
    {},
    {
      message:
        'El id de la sucursal que realiza la acción es una cadena numérica.',
    },
  )
  readonly actingBranchId: string;

  @IsOptional()
  @IsString({ message: 'La razón de cancelación debe ser una cadena.' })
  @MaxLength(500, {
    message: 'La razón de cancelación no debe ser mayor a 500 caracteres.',
  })
  readonly reason?: string;
}
