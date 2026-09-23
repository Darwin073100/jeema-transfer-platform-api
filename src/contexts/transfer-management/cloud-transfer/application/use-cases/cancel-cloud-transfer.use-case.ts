import { TransactionDBRepository } from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';
import { DInvalidException } from 'src/shared/domain/exceptions/basics/d-invalid.exception';
import { CloudTransferRepository } from '../../domain/repositories/cloud-transfer.repository';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { FindCloudTransferByIdUseCase } from './find-cloud-transfer-by-id.use-case';
import { CancelCloudTransferDTO } from '../dtos/cancel-cloud-transfer.dto';

export class CancelCloudTransferUseCase {
  constructor(
    readonly cloudTransferRepository: CloudTransferRepository,
    readonly findCloudTransferByIdUseCase: FindCloudTransferByIdUseCase,
    readonly transactionDB: TransactionDBRepository,
  ) {}

  async execute(dto: CancelCloudTransferDTO): Promise<CloudTransferEntity> {
    return await this.transactionDB.runInTransaction(async () => {
      const cloudTransfer = await this.findCloudTransferByIdUseCase.execute(
        dto.cloudTransferId,
      );

      const isFrom = cloudTransfer.fromCloudBranchId === dto.actingBranchId;
      const isTo = cloudTransfer.toCloudBranchId === dto.actingBranchId;
      if (!isFrom && !isTo) {
        throw new DInvalidException(
          'Solo la sucursal de origen o la de destino pueden cancelar este traspaso.',
        );
      }

      cloudTransfer.cancel(dto.reason);

      const saved = await this.cloudTransferRepository.save(cloudTransfer);
      saved.updateFromCloudBranch(cloudTransfer.fromCloudBranch);
      saved.updateToCloudBranch(cloudTransfer.toCloudBranch);
      saved.updateCloudEstablishment(cloudTransfer.cloudEstablishment);
      return saved;
    });
  }
}
