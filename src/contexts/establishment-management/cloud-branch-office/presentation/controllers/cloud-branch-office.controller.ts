import { BadRequestException, Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from "@nestjs/common";
import { RegisterCloudBranchAndCloudEstablishmentUseCase } from "../../application/use-cases/register-cloud-branch-and-cloud-establishment.use-case";
import { RegisterCloudBranchAndCloudEstablishmentComand } from "../commands/register-branch-and-establishment.command";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";
import { CloudBranchOfficeHttpMapper } from "../mappers/cloud-branch-office.http-mapper";
import { RegisterCloudBranchCommand } from "../commands/register-branch.command";
import { RegisterCloudBranchUseCase } from "../../application/use-cases/register-cloud-branch.use-case";
import { RegisterCloudBranchAndCloudEstablishmentDTO } from "../../application/dtos/register-branch-and-establishment.dto";
import { RegisterCloudBranchDTO } from "../../application/dtos/register-branch.dto";

@Controller('cloud-branch-offices')
export class CloudBranchOfficeController {
    constructor(
        private readonly registerCloudBranchAndCloudEstablishmentUseCase: RegisterCloudBranchAndCloudEstablishmentUseCase,
        private readonly registerCloudBranchUseCase: RegisterCloudBranchUseCase,
    ) { }

    @Post('all')
    @HttpCode(HttpStatus.CREATED)
    async registerCloudBranchAndCloudEstablishment(@Body() command: RegisterCloudBranchAndCloudEstablishmentComand) {
        console.log(command);
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