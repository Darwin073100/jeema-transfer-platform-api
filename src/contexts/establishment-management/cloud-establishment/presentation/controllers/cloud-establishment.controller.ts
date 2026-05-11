import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { RegisterCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-establishment.use-case";
import { RegisterCloudEstablishmentCommand } from "../commands/register-cloud-establishment.command";
import { CloudEstablishmentHttpMapper } from "../mappers/cloud-establishment.http-mapper";

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
            throw error;
        }
    }

}