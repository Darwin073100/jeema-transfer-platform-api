import { BadRequestException, Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegisterCloudBranchAndCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-branch-and-cloud-establishment.use-case";
import { RegisterCloudBranchAndCloudEstablishmentComand } from "../commands/register-branch-and-establishment.command";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";
import { CloudBranchOfficeHttpMapper } from "../mappers/cloud-branch-office.http-mapper";
import { RegisterCloudBranchCommand } from "../commands/register-branch.command";
import { RegisterCloudBranchUseCase } from "../../application/use-cases/register-cloud-branch.use-case";
import { RegisterCloudBranchAndCloudEstablishmentDTO } from "../../application/dtos/register-branch-and-establishment.dto";
import { RegisterCloudBranchDTO } from "../../application/dtos/register-branch.dto";

const CLOUD_BRANCH_OFFICE_EXAMPLE = {
    cloudEstablishmentId: '1',
    cloudBranchOfficeId: '1',
    localBranchOfficeId: '1',
    name: 'Sucursal Matriz',
    createdAt: '2026-09-06T07:49:35.739Z',
    deletedAt: null,
    updatedAt: '2026-09-06T07:49:35.739Z',
    cloudEstablishment: {
        cloudEstablishmentId: '1',
        name: 'Farmacia Central',
        enrollmentKey: '512-2026-1846723200123',
        createdAt: '2026-09-06T07:49:35.739Z',
        deletedAt: null,
        updatedAt: null,
        cloudBranchOffices: [],
    },
};

@ApiTags('Cloud Branch Offices')
@Controller('cloud-branch-offices')
export class CloudBranchOfficeController {
    constructor(
        private readonly registerCloudBranchAndCloudEstablishmentUseCase: RegisterCloudBranchAndCloudEstablishmentUseCase,
        private readonly registerCloudBranchUseCase: RegisterCloudBranchUseCase,
    ) { }

    @Post('all')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Registrar un establecimiento y su primera sucursal',
        description: 'Crea el establecimiento y, en la misma transacción, la sucursal local que inicia el proceso de inscripción.',
    })
    @ApiCreatedResponse({ description: 'Establecimiento y sucursal creados.', schema: { example: CLOUD_BRANCH_OFFICE_EXAMPLE } })
    @ApiBadRequestResponse({ description: 'La clave de inscripción/nombre del establecimiento ya existen, o el body no pasó las validaciones.' })
    async registerCloudBranchAndCloudEstablishment(@Body() command: RegisterCloudBranchAndCloudEstablishmentComand) {
        try {
            const dto: RegisterCloudBranchAndCloudEstablishmentDTO = {
                ...command,
                localBranchOfficeId: BigInt(command.localBranchOfficeId),
            };
            const result = await this.registerCloudBranchAndCloudEstablishmentUseCase.execute(dto);
            return CloudBranchOfficeHttpMapper.toHttpResponse(result);
        } catch (error) {
            if (error instanceof DNotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof DAlreadyExistException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Inscribir una sucursal a un establecimiento existente',
        description: 'Registra una sucursal adicional en un establecimiento ya existente, validando la enrollmentKey.',
    })
    @ApiCreatedResponse({ description: 'Sucursal creada.', schema: { example: CLOUD_BRANCH_OFFICE_EXAMPLE } })
    @ApiBadRequestResponse({ description: 'El body no pasó las validaciones.' })
    @ApiNotFoundResponse({ description: 'No existe un establecimiento con esa enrollmentKey.' })
    async registerCloudBranch(@Body() command: RegisterCloudBranchCommand) {
        try {
            const dto: RegisterCloudBranchDTO = {
                ...command,
                localBranchOfficeId: BigInt(command.localBranchOfficeId),
            };
            const result = await this.registerCloudBranchUseCase.execute(dto);
            return CloudBranchOfficeHttpMapper.toHttpResponse(result);
        } catch (error) {
            if (error instanceof DNotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof DAlreadyExistException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}