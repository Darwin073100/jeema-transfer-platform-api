import { DNotFoundException } from 'src/shared/domain/exceptions/basics/d-not-found.exception';
import { CloudTransferRepository } from '../../domain/repositories/cloud-transfer.repository';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';

export class FindCloudTransferByIdUseCase {
  constructor(readonly cloudTransferRepository: CloudTransferRepository) {}

  async execute(id: bigint): Promise<CloudTransferEntity> {
    const cloudTransfer = await this.cloudTransferRepository.findById(id);
    if (!cloudTransfer) {
      throw new DNotFoundException('No se encontró el traspaso.');
    }
    return cloudTransfer;
  }
}
