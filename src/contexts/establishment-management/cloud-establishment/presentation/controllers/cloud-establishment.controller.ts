import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from "@nestjs/common";
import { RegisterCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-establishment.use-case";
import { RegisterCloudEstablishmentCommand } from "../commands/register-cloud-establishment.command";
import { CloudEstablishmentHttpMapper } from "../mappers/cloud-establishment.http-mapper";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";
import { FindCloudEstablishmentByIdUseCase } from "../../application/use-cases/find-cloud-establishment-by-id.use-case";
import { ParseBigIntPipe } from "src/shared/pipes/parse-bigint.pipe";
import { GenerateEnrollmentKeyUseCase } from "../../application/use-cases/generate-enrollment-key.use-case";
import { DeleteCloudEstablishmentPhisicalUseCase } from "../../application/use-cases/delete-cloud-establishment-phisical.use-case";

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