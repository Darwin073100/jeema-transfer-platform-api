import { BadRequestException, Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from "@nestjs/common";
import { RegisterCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-establishment.use-case";
import { RegisterCloudEstablishmentCommand } from "../commands/register-cloud-establishment.command";
import { CloudEstablishmentHttpMapper } from "../mappers/cloud-establishment.http-mapper";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";

@Controller('cloud-establishments')
export class CloudEstablishmentController {
    constructor(
        private readonly registerCloudEstablishmentUseCase: RegisterCloudEstablishmentUseCase
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

}