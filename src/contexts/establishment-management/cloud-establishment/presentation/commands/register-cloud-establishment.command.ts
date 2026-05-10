import { IsNotEmpty, IsString, MaxLength, Min, MinLength } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

/**
 * RegisterCloudEstablishmentCommand es un comando de la capa de Presentación. Se utiliza para la validación de las solicitudes HTTP
 * entrantes para el registro de un establesimiento.
 *
 * Contiene decoradores de 'class-validator' y '@nestjs/swagger' para la validación
 * y documentación automática de la API.
 */
export class RegisterCloudEstablishmentCommand {
  // @ApiProperty({
  //   description: 'El nombre de un establesimiento',
  //   example: 'Awesome Learning Academy',
  //   maxLength: 250,
  // })
  @IsString({ message: 'El nombre no puede ser un número.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener como mínimo 3 caracteres.' })
  @MaxLength(250, { message: 'El nombre no debe ser mayor a 250 caracteres.' })
  name: string;
  @IsString({ message: 'La clave de inscripción no puede ser un número.' })
  @IsNotEmpty({ message: 'La clave de inscripción no puede estar vacía.' })
  @MinLength(3, { message: 'La clave de inscripción debe tener como mínimo 3 caracteres.' })
  @MaxLength(250, { message: 'La clave de inscripción no debe ser mayor a 250 caracteres.' })
  enrollmentKey: string;
}