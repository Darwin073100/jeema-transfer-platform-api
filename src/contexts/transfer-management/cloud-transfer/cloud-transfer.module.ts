import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudTransferOrmEntity } from './infrastructure/entities/cloud-transfer.orm-entity';
import { TypeormCloudTransferRepository } from './infrastructure/repositories/typeorm-cloud-transfer.repository';
import {
  CLOUD_TRANSFER_REPOSITORY,
  CloudTransferRepository,
} from './domain/repositories/cloud-transfer.repository';
import {
  CLOUD_BRANCH_OFFICE_REPOSITORY,
  CloudBranchOfficeRepository,
} from '../../establishment-management/cloud-branch-office/domain/repositories/cloud-branch-office.repository';
import {
  TRANSACTION_DB_REPOSITORIO,
  TransactionDBRepository,
} from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';
import { CloudBranchOfficeModule } from '../../establishment-management/cloud-branch-office/cloud-branch-office.module';
import { TransactionDBModule } from 'src/config/database/typeorm/transaction/transaction-db.module';
import { CloudTransferController } from './presentation/controllers/cloud-transfer.controller';
import { CreateCloudTransferUseCase } from './application/use-cases/create-cloud-transfer.use-case';
import { ListPendingCloudTransfersByBranchUseCase } from './application/use-cases/list-pending-cloud-transfers-by-branch.use-case';
import { FindCloudTransferByIdUseCase } from './application/use-cases/find-cloud-transfer-by-id.use-case';
import { StartProcessingCloudTransferUseCase } from './application/use-cases/start-processing-cloud-transfer.use-case';
import { MarkCloudTransferReceivedUseCase } from './application/use-cases/mark-cloud-transfer-received.use-case';
import { ApproveCloudTransferUseCase } from './application/use-cases/approve-cloud-transfer.use-case';
import { MarkCloudTransferErrorUseCase } from './application/use-cases/mark-cloud-transfer-error.use-case';
import { CancelCloudTransferUseCase } from './application/use-cases/cancel-cloud-transfer.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([CloudTransferOrmEntity]),
    CloudBranchOfficeModule,
    TransactionDBModule,
  ],
  controllers: [CloudTransferController],
  providers: [
    {
      provide: CLOUD_TRANSFER_REPOSITORY,
      useClass: TypeormCloudTransferRepository,
    },
    {
      provide: FindCloudTransferByIdUseCase,
      useFactory: (cloudTransferRepo: CloudTransferRepository) => {
        return new FindCloudTransferByIdUseCase(cloudTransferRepo);
      },
      inject: [CLOUD_TRANSFER_REPOSITORY],
    },
    {
      provide: CreateCloudTransferUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        cloudBranchOfficeRepo: CloudBranchOfficeRepository,
        transactionDB: TransactionDBRepository,
      ) => {
        return new CreateCloudTransferUseCase(
          cloudTransferRepo,
          cloudBranchOfficeRepo,
          transactionDB,
        );
      },
      inject: [
        CLOUD_TRANSFER_REPOSITORY,
        CLOUD_BRANCH_OFFICE_REPOSITORY,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: ListPendingCloudTransfersByBranchUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        cloudBranchOfficeRepo: CloudBranchOfficeRepository,
      ) => {
        return new ListPendingCloudTransfersByBranchUseCase(
          cloudTransferRepo,
          cloudBranchOfficeRepo,
        );
      },
      inject: [CLOUD_TRANSFER_REPOSITORY, CLOUD_BRANCH_OFFICE_REPOSITORY],
    },
    {
      provide: StartProcessingCloudTransferUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        findByIdUseCase: FindCloudTransferByIdUseCase,
        transactionDB: TransactionDBRepository,
      ) => {
        return new StartProcessingCloudTransferUseCase(
          cloudTransferRepo,
          findByIdUseCase,
          transactionDB,
        );
      },
      inject: [
        CLOUD_TRANSFER_REPOSITORY,
        FindCloudTransferByIdUseCase,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: MarkCloudTransferReceivedUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        findByIdUseCase: FindCloudTransferByIdUseCase,
        transactionDB: TransactionDBRepository,
      ) => {
        return new MarkCloudTransferReceivedUseCase(
          cloudTransferRepo,
          findByIdUseCase,
          transactionDB,
        );
      },
      inject: [
        CLOUD_TRANSFER_REPOSITORY,
        FindCloudTransferByIdUseCase,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: ApproveCloudTransferUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        findByIdUseCase: FindCloudTransferByIdUseCase,
        transactionDB: TransactionDBRepository,
      ) => {
        return new ApproveCloudTransferUseCase(
          cloudTransferRepo,
          findByIdUseCase,
          transactionDB,
        );
      },
      inject: [
        CLOUD_TRANSFER_REPOSITORY,
        FindCloudTransferByIdUseCase,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: MarkCloudTransferErrorUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        findByIdUseCase: FindCloudTransferByIdUseCase,
        transactionDB: TransactionDBRepository,
      ) => {
        return new MarkCloudTransferErrorUseCase(
          cloudTransferRepo,
          findByIdUseCase,
          transactionDB,
        );
      },
      inject: [
        CLOUD_TRANSFER_REPOSITORY,
        FindCloudTransferByIdUseCase,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
    {
      provide: CancelCloudTransferUseCase,
      useFactory: (
        cloudTransferRepo: CloudTransferRepository,
        findByIdUseCase: FindCloudTransferByIdUseCase,
        transactionDB: TransactionDBRepository,
      ) => {
        return new CancelCloudTransferUseCase(
          cloudTransferRepo,
          findByIdUseCase,
          transactionDB,
        );
      },
      inject: [
        CLOUD_TRANSFER_REPOSITORY,
        FindCloudTransferByIdUseCase,
        TRANSACTION_DB_REPOSITORIO,
      ],
    },
  ],
  exports: [],
})
export class CloudTransferModule {}
