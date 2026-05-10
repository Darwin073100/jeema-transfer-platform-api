import { CloudEstablishmentMapper } from "../../../cloud-establishment/infrastructure/mappers/cloud-establishment.mapper";
import { CloudBranchOfficeEntity } from "../../domain/entities/cloud-branch-office.entity";
import { CloudBranchOfficeOrmEntity } from "../entities/cloud-branch-office.orm-entity";

/**
 * CloudBranchOfficeMapper es una clase que se encarga de transformar
 * entre la entidad de dominio CloudBranchOffice y la entidad ORM CloudBranchOfficeOrmEntity.
 * 
 * Este mapper es esencial para mantener la separación entre el dominio
 * y la capa de infraestructura, permitiendo que cada uno evolucione
 * de manera independiente.
 */
export class CloudBranchOfficeMapper {
  public static toOrm(domainEntity: CloudBranchOfficeEntity): CloudBranchOfficeOrmEntity {
    const ormEntity = new CloudBranchOfficeOrmEntity();
    ormEntity.cloudBranchOfficeId = domainEntity.cloudBranchOfficeId;
    ormEntity.name = domainEntity.name;
    ormEntity.cloudEstablishmentId = domainEntity.cloudEstablishmentId;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    ormEntity.deletedAt = domainEntity.deletedAt;
    ormEntity.cloudEstablishment = domainEntity.cloudEstablishment ? CloudEstablishmentMapper.toOrm(domainEntity.cloudEstablishment) : null;
    return ormEntity;
  }

  public static toDomain(ormEntity: CloudBranchOfficeOrmEntity): CloudBranchOfficeEntity {
    // Reconstituir la entidad de dominio
    return CloudBranchOfficeEntity.reconstitute(
      ormEntity.cloudBranchOfficeId,
      ormEntity.cloudEstablishmentId,
      ormEntity.localBranchOfficeId,
      ormEntity.name,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt,
      ormEntity.cloudEstablishment ? CloudEstablishmentMapper.toDomain(ormEntity.cloudEstablishment) : null,
    );
  }
}
