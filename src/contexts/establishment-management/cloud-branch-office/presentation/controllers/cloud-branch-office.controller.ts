import { BadRequestException, Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from "@nestjs/common";
import { RegisterCloudBranchAndCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-branch-and-cloud-establishment.use-case";
import { RegisterCloudBranchAndCloudEstablishmentComand } from "../commands/register-branch-and-establishment.command";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";

@Controller('cloud-branch-offices')
export class CloudBranchOfficeController {
    constructor(
        private readonly registerCloudBranchAndCloudEstablishmentUseCase: RegisterCloudBranchAndCloudEstablishmentUseCase
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async registerCloudBranchAndCloudEstablishment(@Body() command: RegisterCloudBranchAndCloudEstablishmentComand) {
        try {
            const result = await this.registerCloudBranchAndCloudEstablishmentUseCase.exceute(command);
            return result;
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