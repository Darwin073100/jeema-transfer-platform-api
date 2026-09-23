import { IsNotEmpty, IsNumberString } from 'class-validator';

export class StartProcessingCloudTransferCommand {
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
}
