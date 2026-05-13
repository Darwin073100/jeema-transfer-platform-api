import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from "@nestjs/common";
import { RegisterCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-establishment.use-case";
import { RegisterCloudEstablishmentCommand } from "../commands/register-cloud-establishment.command";
import { CloudEstablishmentHttpMapper } from "../mappers/cloud-establishment.http-mapper";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";
import { FindCloudEstablishmentByIdUseCase } from "../../application/use-cases/find-cloud-establishment-by-id.use-case";
import { ParseBigIntPipe } from "src/shared/pipes/parse-bigint.pipe";

@Controller('cloud-establishments')
export class CloudEstablishmentController {
    constructor(
        private readonly registerCloudEstablishmentUseCase: RegisterCloudEstablishmentUseCase,
        private readonly findCloudEstablishmentByIdUseCase: FindCloudEstablishmentByIdUseCase,
    ){}
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async registerCloudEstablishment(@Body() command: RegisterCloudEstablishmentCommand){
        try {
            const result = await this.registerCloudEstablishmentUseCase.execute(command);
            return CloudEstablishmentHttpMapper.toHttpREsponse(result);
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
            return CloudEstablishmentHttpMapper.toHttpREsponse(result);
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