import { CloudBranchOfficeMapper } from 'src/contexts/establishment-management/cloud-branch-office/infrastructure/mappers/cloud-branch-office.mapper';
import { CloudEstablishmentMapper } from 'src/contexts/establishment-management/cloud-establishment/infrastructure/mappers/cloud-establishment.mapper';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { CloudTransferOrmEntity } from '../entities/cloud-transfer.orm-entity';

/**
 * CloudTransferMapper es una clase que se encarga de transformar
 * entre la entidad de dominio CloudTransfer y la entidad ORM CloudTransferOrmEntity.
 *
 * Este mapper es esencial para mantener la separación entre el dominio
 * y la capa de infraestructura, permitiendo que cada uno evolucione
 * de manera independiente.
 */
export class CloudTransferMapper {
  public static toOrm(
    domainEntity: CloudTransferEntity,
  ): CloudTransferOrmEntity {
    const ormEntity = new CloudTransferOrmEntity();
    ormEntity.cloudTransferId = domainEntity.cloudTransferId;
    ormEntity.cloudEstablishmentId = domainEntity.cloudEstablishmentId;
    ormEntity.fromCloudBranchId = domainEntity.fromCloudBranchId;
    ormEntity.toCloudBranchId = domainEntity.toCloudBranchId;
    ormEntity.localTransferId = domainEntity.localTransferId;
    ormEntity.payload = domainEntity.payload;
    ormEntity.status = domainEntity.status;
    ormEntity.notes = domainEntity.notes;
    ormEntity.errorMessage = domainEntity.errorMessage;
    ormEntity.inTransitAt = domainEntity.inTransitAt;
    ormEntity.approvedAt = domainEntity.approvedAt;
    ormEntity.receivedAt = domainEntity.receivedAt;
    ormEntity.cancelledAt = domainEntity.cancelledAt;
    ormEntity.errorAt = domainEntity.errorAt;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    ormEntity.deletedAt = domainEntity.deletedAt;
    return ormEntity;
  }

  public static toDomain(
    ormEntity: CloudTransferOrmEntity,
  ): CloudTransferEntity {
    return CloudTransferEntity.reconstitute(
      // TypeORM/pg devuelven las columnas `bigint` como `string` en tiempo de ejecución
      // (el tipo `bigint` de la entidad ORM es solo una anotación a nivel de TS). Se fuerza
      // el cast aquí para que el dominio reciba siempre un `bigint` real: los use-cases de
      // transición comparan `actingBranchId` contra estos campos con `===`/`!==`, y una
      // comparación `bigint !== string` siempre es `true` aunque representen el mismo id.
      BigInt(ormEntity.cloudTransferId),
      BigInt(ormEntity.cloudEstablishmentId),
      BigInt(ormEntity.fromCloudBranchId),
      BigInt(ormEntity.toCloudBranchId),
      BigInt(ormEntity.localTransferId),
      ormEntity.payload,
      ormEntity.status,
      ormEntity.notes,
      ormEntity.errorMessage,
      ormEntity.inTransitAt,
      ormEntity.approvedAt,
      ormEntity.receivedAt,
      ormEntity.cancelledAt,
      ormEntity.errorAt,
      ormEntity.cloudEstablishment
        ? CloudEstablishmentMapper.toDomain(ormEntity.cloudEstablishment)
        : null,
      ormEntity.fromCloudBranch
        ? CloudBranchOfficeMapper.toDomain(ormEntity.fromCloudBranch)
        : null,
      ormEntity.toCloudBranch
        ? CloudBranchOfficeMapper.toDomain(ormEntity.toCloudBranch)
        : null,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt,
    );
  }
}
