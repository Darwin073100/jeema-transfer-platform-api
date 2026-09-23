import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';

export class ErrorCloudTransferCommand {
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

  @IsNotEmpty({ message: 'El mensaje de error es obligatorio.' })
  @IsString({ message: 'El mensaje de error debe ser una cadena.' })
  @MaxLength(1000, {
    message: 'El mensaje de error no debe ser mayor a 1000 caracteres.',
  })
  readonly errorMessage: string;
}
