import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudBranchOfficeOrmEntity } from './infrastructure/entities/cloud-branch-office.orm-entity';
import { TypeormCloudBranchOfficeRepository } from './infrastructure/repositories/typeorm-cloud-branch-office.repository';
import {
  CLOUD_BRANCH_OFFICE_REPOSITORY,
  CloudBranchOfficeRepository,
} from './domain/repositories/cloud-branch-office.repository';
import { RegisterCloudBranchAndCloudEstablishmentUseCase } from './application/use-cases/register-cloud-branch-and-cloud-establishment.use-case';
import {
  CLOUD_ESTABLISHMENT_REPOSITORY,
  CloudEstablishmentRepository,
} from '../cloud-establishment/domain/repositories/cloud-establishment.repository';
import {
  TRANSACTION_DB_REPOSITORIO,
  TransactionDBRepository,
} from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';
import { CloudEstablishmentModule } from '../cloud-establishment/cloud-establishment.module';
import { TransactionDBModule } from 'src/config/database/typeorm/transaction/transaction-db.module';
import { CloudBranchOfficeController } from './presentation/controllers/cloud-branch-office.controller';
import { RegisterCloudBranchUseCase } from './application/use-cases/register-cloud-branch.use-case';
import { FindCloudBranchOfficesByEnrollmentKeyUseCase } from './application/use-cases/find-cloud-branch-offices-by-enrollment-key.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([CloudBranchOfficeOrmEntity]),
    CloudEstablishmentModule,
    TransactionDBModule,
  ],
  controllers: [CloudBranchOfficeController],
  providers: [
    {
      provide: CLOUD_BRANCH_OFFICE_REPOSITORY,
      useClass: TypeormCloudBranchOfficeRepository,
    },
    {
      provide: RegisterCloudBranchAndCloudEstablishmentUseCase,
      useFactory: (
        cloudBranchOfficeRepo: CloudBranchOfficeRepository,
        cloudEstablishmentRepo: CloudEstablishmentRepository,
        transactionDB: TransactionDBRepository,
      ) => {
        return new RegisterCloudBranchAndCloudEstablishmentUseCase(
          cloudBranchOfficeRepo,
          cloudEstablishmentRepo,
          transactionDB,
        );
      },
      inject: [
        CLOUD_BRANCH_OFFICE_REPOSITORY,
        CLOUD_ESTABLISHMENT_REPOSITORY,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: RegisterCloudBranchUseCase,
      useFactory: (
        cloudBranchOfficeRepo: CloudBranchOfficeRepository,
        cloudEstablishmentRepo: CloudEstablishmentRepository,
        transactionDB: TransactionDBRepository,
      ) => {
        return new RegisterCloudBranchUseCase(
          cloudBranchOfficeRepo,
          cloudEstablishmentRepo,
          transactionDB,
        );
      },
      inject: [
        CLOUD_BRANCH_OFFICE_REPOSITORY,
        CLOUD_ESTABLISHMENT_REPOSITORY,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: FindCloudBranchOfficesByEnrollmentKeyUseCase,
      useFactory: (cloudEstablishmentRepo: CloudEstablishmentRepository) => {
        return new FindCloudBranchOfficesByEnrollmentKeyUseCase(
          cloudEstablishmentRepo,
        );
      },
      inject: [CLOUD_ESTABLISHMENT_REPOSITORY],
    },
  ],
  exports: [CLOUD_BRANCH_OFFICE_REPOSITORY],
})
export class CloudBranchOfficeModule {}
