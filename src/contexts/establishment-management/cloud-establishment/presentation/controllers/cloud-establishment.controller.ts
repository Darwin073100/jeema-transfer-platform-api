import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { RegisterCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-establishment.use-case";
import { RegisterCloudEstablishmentCommand } from "../commands/register-cloud-establishment.command";
import { CloudEstablishmentHttpMapper } from "../mappers/cloud-establishment.http-mapper";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";
import { FindCloudEstablishmentByIdUseCase } from "../../application/use-cases/find-cloud-establishment-by-id.use-case";
import { ParseBigIntPipe } from "src/shared/pipes/parse-bigint.pipe";
import { GenerateEnrollmentKeyUseCase } from "../../application/use-cases/generate-enrollment-key.use-case";
import { DeleteCloudEstablishmentPhisicalUseCase } from "../../application/use-cases/delete-cloud-establishment-phisical.use-case";

const CLOUD_ESTABLISHMENT_EXAMPLE = {
    cloudEstablishmentId: '1',
    name: 'Farmacia Central',
    enrollmentKey: '512-2026-1846723200123',
    createdAt: '2026-09-06T07:49:35.739Z',
    updatedAt: null,
    deletedAt: null,
    cloudBranchOffices: [],
};

@ApiTags('Cloud Establishments')
@Controller('cloud-establishments')
export class CloudEstablishmentController {
    constructor(
        private readonly registerCloudEstablishmentUseCase: RegisterCloudEstablishmentUseCase,
        private readonly findCloudEstablishmentByIdUseCase: FindCloudEstablishmentByIdUseCase,
        private readonly generateEnrollmentKeyUseCase: GenerateEnrollmentKeyUseCase,
        private readonly deleteCloudEstablishmentPhisicalUseCase: DeleteCloudEstablishmentPhisicalUseCase
    ){}
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Registrar un establecimiento en la nube',
        description: 'Da de alta un establecimiento con una clave de inscripción (enrollmentKey) única, que luego se usa para inscribir sucursales.',
    })
    @ApiCreatedResponse({ description: 'Establecimiento creado.', schema: { example: CLOUD_ESTABLISHMENT_EXAMPLE } })
    @ApiBadRequestResponse({ description: 'El nombre o la clave de inscripción ya existen, o el body no pasó las validaciones.' })
    async registerCloudEstablishment(@Body() command: RegisterCloudEstablishmentCommand){
        try {
            const result = await this.registerCloudEstablishmentUseCase.execute(command);
            return CloudEstablishmentHttpMapper.toHttpResponse(result);
        } catch (error) {
            if(error instanceof DNotFoundException){
                throw new NotFoundException(error.message);
            }
            if(error instanceof DAlreadyExistException){
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    @Get('enrollment-keys')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generar una clave de inscripción candidata',
        description: 'Genera una enrollmentKey única (no reservada) para usarla al registrar un nuevo establecimiento.',
    })
    @ApiOkResponse({ description: 'Clave de inscripción generada.', schema: { example: { enrollmentKey: '512-2026-1846723200123' } } })
    async generateEnrollmentKey(){
        try {
            const result = await this.generateEnrollmentKeyUseCase.execute();
            return {
                enrollmentKey: result
            };
        } catch (error) {
            if(error instanceof DNotFoundException){
                throw new NotFoundException(error.message);
            }
            if(error instanceof DAlreadyExistException){
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    @Get(':cloudEstablishmentId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Buscar un establecimiento por id' })
    @ApiParam({ name: 'cloudEstablishmentId', description: 'Id del establecimiento (bigint)', example: '1' })
    @ApiOkResponse({ description: 'Establecimiento encontrado.', schema: { example: CLOUD_ESTABLISHMENT_EXAMPLE } })
    @ApiNotFoundResponse({ description: 'No existe un establecimiento con ese id.' })
    async findCloudEstablishmentById(@Param('cloudEstablishmentId', ParseBigIntPipe ) cloudEstablishmentId: bigint){
        try {
            const result = await this.findCloudEstablishmentByIdUseCase.execute(cloudEstablishmentId);
            return CloudEstablishmentHttpMapper.toHttpResponse(result);
        } catch (error) {
            if(error instanceof DNotFoundException){
                throw new NotFoundException(error.message);
            }
            if(error instanceof DAlreadyExistException){
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
    @Delete(':cloudEstablishmentId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar físicamente un establecimiento',
        description: 'Borrado físico (no soft-delete) del establecimiento y, por cascada, de sus sucursales.',
    })
    @ApiParam({ name: 'cloudEstablishmentId', description: 'Id del establecimiento (bigint)', example: '1' })
    @ApiOkResponse({ description: 'Establecimiento eliminado.' })
    @ApiNotFoundResponse({ description: 'No existe un establecimiento con ese id.' })
    async deleteCloudEstablishmentPhisical(@Param('cloudEstablishmentId', ParseBigIntPipe ) cloudEstablishmentId: bigint){
        try {
            await this.deleteCloudEstablishmentPhisicalUseCase.execute(cloudEstablishmentId);
        } catch (error) {
            if(error instanceof DNotFoundException){
                throw new NotFoundException(error.message);
            }
            if(error instanceof DAlreadyExistException){
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

}