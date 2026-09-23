import { TemplateRepository } from 'src/shared/domain/repositories/template.repository';
import type { CloudTransferEntity } from '../entities/cloud-transfer.entity';
import type { CloudTransferStatusEnum } from '../enums/CloudTransferStatusEnum';

export const CLOUD_TRANSFER_REPOSITORY = Symbol('CLOUD_TRANSFER_REPOSITORY');

export interface CloudTransferRepository
  extends TemplateRepository<CloudTransferEntity> {
  findByToCloudBranchIdAndStatuses(
    toCloudBranchId: bigint,
    statuses: CloudTransferStatusEnum[],
  ): Promise<CloudTransferEntity[]>;
  findByFromCloudBranchIdAndLocalTransferId(
    fromCloudBranchId: bigint,
    localTransferId: bigint,
  ): Promise<CloudTransferEntity | null>;
}
