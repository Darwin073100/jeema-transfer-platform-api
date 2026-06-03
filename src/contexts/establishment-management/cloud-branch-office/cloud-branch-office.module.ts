import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudBranchOfficeOrmEntity } from "./infrastructure/entities/cloud-branch-office.orm-entity";
import { TypeormCloudBranchOfficeRepository } from "./infrastructure/repositories/typeorm-cloud-branch-office.repository";
import { CLOUD_BRANCH_OFFICE_REPOSITORY, CloudBranchOfficeRepository } from "./domain/repositories/cloud-branch-office.repository";
import { RegisterCloudBranchAndCloudEstablishmentUseCase } from "./application/use-cases/register-cloud-branch-and-cloud-establishment.use-case";
import { CLOUD_ESTABLISHMENT_REPOSITORY, CloudEstablishmentRepository } from "../cloud-establishment/domain/repositories/cloud-establishment.repository";
import { TRANSACTION_DB_REPOSITORIO, TransactionDBRepository } from "src/config/database/typeorm/transaction/domain/repositories/transaction-repository";
import { CloudEstablishmentModule } from "../cloud-establishment/cloud-establishment.module";
import { TransactionDBModule } from "src/config/database/typeorm/transaction/transaction-db.module";

@Module({
    imports:[
        TypeOrmModule.forFeature([CloudBranchOfficeOrmEntity]),
        CloudEstablishmentModule,
        TransactionDBModule
    ],
    controllers: [],
    providers: [
        {
            provide: CLOUD_BRANCH_OFFICE_REPOSITORY,
            useClass: TypeormCloudBranchOfficeRepository,
        },
        {
            provide: RegisterCloudBranchAndCloudEstablishmentUseCase,
            useFactory: (cloudEstablishmentRepo: CloudEstablishmentRepository, cloudBranchOfficeRepo: CloudBranchOfficeRepository, transactionDB: TransactionDBRepository)=> {
                return new RegisterCloudBranchAndCloudEstablishmentUseCase(cloudBranchOfficeRepo, cloudEstablishmentRepo, transactionDB)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY, CLOUD_BRANCH_OFFICE_REPOSITORY, TRANSACTION_DB_REPOSITORIO
            ]
        }
    ],
    exports: []
})
export class CloudBranchOfficeModule{}