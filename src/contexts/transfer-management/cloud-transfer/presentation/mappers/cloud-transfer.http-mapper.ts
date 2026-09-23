import { CloudBranchOfficeHttpMapper } from 'src/contexts/establishment-management/cloud-branch-office/presentation/mappers/cloud-branch-office.http-mapper';
import { CloudEstablishmentHttpMapper } from 'src/contexts/establishment-management/cloud-establishment/presentation/mappers/cloud-establishment.http-mapper';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { ICloudTransfer } from '../interfaces/ICloudTransfer';

export class CloudTransferHttpMapper {
  static toHttpResponse(entity: CloudTransferEntity): ICloudTransfer {
    return {
      cloudTransferId: entity.cloudTransferId.toString(),
      cloudEstablishmentId: entity.cloudEstablishmentId.toString(),
      fromCloudBranchId: entity.fromCloudBranchId.toString(),
      toCloudBranchId: entity.toCloudBranchId.toString(),
      localTransferId: entity.localTransferId.toString(),
      payload: entity.payload,
      status: entity.status,
      notes: entity.notes,
      errorMessage: entity.errorMessage,
      inTransitAt: entity.inTransitAt,
      approvedAt: entity.approvedAt,
      receivedAt: entity.receivedAt,
      cancelledAt: entity.cancelledAt,
      errorAt: entity.errorAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      cloudEstablishment: entity.cloudEstablishment
        ? CloudEstablishmentHttpMapper.toHttpResponse(entity.cloudEstablishment)
        : null,
      fromCloudBranch: entity.fromCloudBranch
        ? CloudBranchOfficeHttpMapper.toHttpResponse(entity.fromCloudBranch)
        : null,
      toCloudBranch: entity.toCloudBranch
        ? CloudBranchOfficeHttpMapper.toHttpResponse(entity.toCloudBranch)
        : null,
    };
  }

  static toHttpResponseList(entities: CloudTransferEntity[]): ICloudTransfer[] {
    return entities.map((entity) =>
      CloudTransferHttpMapper.toHttpResponse(entity),
    );
  }
}
