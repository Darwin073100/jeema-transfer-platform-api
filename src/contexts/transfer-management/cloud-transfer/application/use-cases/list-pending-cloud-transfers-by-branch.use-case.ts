import { CloudBranchOfficeRepository } from 'src/contexts/establishment-management/cloud-branch-office/domain/repositories/cloud-branch-office.repository';
import { DNotFoundException } from 'src/shared/domain/exceptions/basics/d-not-found.exception';
import { CloudTransferRepository } from '../../domain/repositories/cloud-transfer.repository';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { CloudTransferStatusEnum } from '../../domain/enums/CloudTransferStatusEnum';

export class ListPendingCloudTransfersByBranchUseCase {
  constructor(
    readonly cloudTransferRepository: CloudTransferRepository,
    readonly cloudBranchOfficeRepository: CloudBranchOfficeRepository,
  ) {}

  async execute(toCloudBranchId: bigint): Promise<CloudTransferEntity[]> {
    const toCloudBranch =
      await this.cloudBranchOfficeRepository.existById(toCloudBranchId);
    if (!toCloudBranch) {
      throw new DNotFoundException('La sucursal destino no existe.');
    }

    return this.cloudTransferRepository.findByToCloudBranchIdAndStatuses(
      toCloudBranchId,
      [
        CloudTransferStatusEnum.PENDING,
        CloudTransferStatusEnum.IN_TRANSIT,
        CloudTransferStatusEnum.ERROR,
      ],
    );
  }
}
