import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudEstablishmentOrmEntity } from "./infrastructure/entities/cloud-establishment.orm-entity";
import { CLOUD_ESTABLISHMENT_REPOSITORY, CloudEstablishmentRepository } from "./domain/repositories/cloud-establishment.repository";
import { TypeormCloudEstablishmentRepository } from "./infrastructure/repositories/typeorm-cloud-establishment.repository";
import { FindCloudEstablishmentByIdUseCase } from "./application/use-cases/find-cloud-establishment-by-id.use-case";
import { RegisterCloudEstablishmentUseCase } from "./application/use-cases/register-cloud-establishment.use-case";
import { UpdateCloudEstablishmentUseCase } from "./application/use-cases/update-establishment.use-case";
import { CloudEstablishmentController } from "./presentation/controllers/cloud-establishment.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([CloudEstablishmentOrmEntity])
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
            provide: UpdateCloudEstablishmentUseCase,
            useFactory: (repo: CloudEstablishmentRepository) => {
                return new UpdateCloudEstablishmentUseCase(repo)
            },
            inject: [
                CLOUD_ESTABLISHMENT_REPOSITORY
            ]
        },
    ],
    exports: [],
})
export class CloudEstablishmentModule { }