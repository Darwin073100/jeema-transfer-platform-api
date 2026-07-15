import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudEstablishmentOrmEntity } from "./infrastructure/entities/cloud-establishment.orm-entity";
import { CLOUD_ESTABLISHMENT_REPOSITORY, CloudEstablishmentRepository } from "./domain/repositories/cloud-establishment.repository";
import { TypeormCloudEstablishmentRepository } from "./infrastructure/repositories/typeorm-cloud-establishment.repository";
import { FindCloudEstablishmentByIdUseCase } from "./application/use-cases/find-cloud-establishment-by-id.use-case";
import { RegisterCloudEstablishmentUseCase } from "./application/use-cases/register-cloud-establishment.use-case";
import { UpdateCloudEstablishmentUseCase } from "./application/use-cases/update-establishment.use-case";
import { CloudEstablishmentController } from "./presentation/controllers/cloud-establishment.controller";
import { TransactionDBModule } from "src/config/database/typeorm/transaction/transaction-db.module";
import { GenerateEnrollmentKeyUseCase } from "./application/use-cases/generate-enrollment-key.use-case";
import { DeleteCloudEstablishmentPhisicalUseCase } from "./application/use-cases/delete-cloud-establishment-phisical.use-case";

@Module({
    imports: [
        TypeOrmModule.forFeature([CloudEstablishmentOrmEntity]),
        TransactionDBModule
    ],
    controllers: [CloudEstablishmentController],
    providers: [
        {
            provide: CLOUD_ESTABLISHMENT_REPOSITORY,
            useClass: TypeormCloudEstablishmentRepository,
        },
        {
            provide: FindCloudEstablishmentByIdUseCase,
            useFactory: (repo: CloudEstablishmentRepository) => {
                return new FindCloudEstablishmentByIdUseCase(repo)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY
            ]
        },
        {
            provide: RegisterCloudEstablishmentUseCase,
            useFactory: (repo: CloudEstablishmentRepository) => {
                return new RegisterCloudEstablishmentUseCase(repo)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY
            ]
        },
        {

            provide: DeleteCloudEstablishmentPhisicalUseCase,
            useFactory: (repo: CloudEstablishmentRepository) => {
                return new DeleteCloudEstablishmentPhisicalUseCase(repo)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY
            ]
        },
        {
            provide: UpdateCloudEstablishmentUseCase,
            useFactory: (repo: CloudEstablishmentRepository) => {
                return new UpdateCloudEstablishmentUseCase(repo)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY
            ]
        },
        {
            provide: GenerateEnrollmentKeyUseCase,
            useFactory: (repo: CloudEstablishmentRepository) => {
                return new GenerateEnrollmentKeyUseCase(repo)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY
            ]
        },
    ],
    
    exports: [
        CLOUD_ESTABLISHMENT_REPOSITORY
    ],
})
export class CloudEstablishmentModule { }