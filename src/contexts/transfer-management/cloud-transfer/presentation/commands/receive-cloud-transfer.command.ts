import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ReceiveCloudTransferCommand {
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
  @IsString({ message: 'Las notas deben ser una cadena.' })
  @MaxLength(500, {
    message: 'Las notas no deben ser mayores a 500 caracteres.',
  })
  readonly notes?: string;
}
