import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudBranchOfficeOrmEntity } from "./infrastructure/entities/cloud-branch-office.orm-entity";
import { TypeormCloudBranchOfficeRepository } from "./infrastructure/repositories/typeorm-cloud-branch-office.repository";
import { CLOUD_BRANCH_OFFICE_REPOSITORY } from "./domain/repositories/cloud-branch-office.repository";

@Module({
    imports:[
        TypeOrmModule.forFeature([CloudBranchOfficeOrmEntity])
    ],
    controllers: [],
    providers: [
        {
            provide: CLOUD_BRANCH_OFFICE_REPOSITORY,
            useClass: TypeormCloudBranchOfficeRepository,
        }
    ],
    exports: []
})
export class CloudBranchOfficeModule{}