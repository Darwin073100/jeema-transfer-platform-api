import { IsNotEmpty, IsNumberString, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterCloudBranchCommand {
    @IsNumberString({}, {message: 'El id de la sucursal local es una cadena numérica.'})
    @IsNotEmpty({message: 'El id de la sucursal local es necesario.'})
    readonly localBranchOfficeId: string;
    @IsString({ message: 'El nombre de la sucursal no puede ser un número.' })
    @IsNotEmpty({ message: 'El nombre de la sucursal no puede estar vacío.' })
    @MinLength(3, { message: 'El nombre de la sucursal debe tener como mínimo 3 caracteres.' })
    @MaxLength(250, { message: 'El nombre de la sucursal no debe ser mayor a 250 caracteres.' })
    readonly branchOfficeName: string;
    @IsString({ message: 'La clave de inscripción no puede ser un número.' })
    @IsNotEmpty({ message: 'La clave de inscripción no puede estar vacía.' })
    @MinLength(3, { message: 'La clave de inscripción debe tener como mínimo 3 caracteres.' })
    @MaxLength(250, { message: 'La clave de inscripción no debe ser mayor a 250 caracteres.' })
    readonly enrollmentKey: string;
}