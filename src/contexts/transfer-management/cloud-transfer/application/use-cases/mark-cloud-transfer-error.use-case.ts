import { TransactionDBRepository } from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';
import { DInvalidException } from 'src/shared/domain/exceptions/basics/d-invalid.exception';
import { CloudTransferRepository } from '../../domain/repositories/cloud-transfer.repository';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { FindCloudTransferByIdUseCase } from './find-cloud-transfer-by-id.use-case';
import { MarkErrorCloudTransferDTO } from '../dtos/mark-error-cloud-transfer.dto';

export class MarkCloudTransferErrorUseCase {
  constructor(
    readonly cloudTransferRepository: CloudTransferRepository,
    readonly findCloudTransferByIdUseCase: FindCloudTransferByIdUseCase,
    readonly transactionDB: TransactionDBRepository,
  ) {}

  async execute(dto: MarkErrorCloudTransferDTO): Promise<CloudTransferEntity> {
    return await this.transactionDB.runInTransaction(async () => {
      const cloudTransfer = await this.findCloudTransferByIdUseCase.execute(
        dto.cloudTransferId,
      );

      if (cloudTransfer.toCloudBranchId !== dto.actingBranchId) {
        throw new DInvalidException(
          'Solo la sucursal destino puede realizar esta acción.',
        );
      }

      cloudTransfer.markAsError(dto.errorMessage);

      const saved = await this.cloudTransferRepository.save(cloudTransfer);
      saved.updateFromCloudBranch(cloudTransfer.fromCloudBranch);
      saved.updateToCloudBranch(cloudTransfer.toCloudBranch);
      saved.updateCloudEstablishment(cloudTransfer.cloudEstablishment);
      return saved;
    });
  }
}
