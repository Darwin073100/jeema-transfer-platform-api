import { CloudBranchOfficeMapper } from "../../../cloud-branch-office/infrastructure/mappers/cloud-branch-office.mapper";
import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { CloudEstablishmentOrmEntity } from "../entities/cloud-establishment.orm-entity";

/**
 * CloudEstablishmentMapper es una clase que se encarga de transformar
 * entre la entidad de dominio CloudEstablishment y la entidad ORM CloudEstablishmentOrmEntity.
 * 
 * Este mapper es esencial para mantener la separación entre el dominio
 * y la capa de infraestructura, permitiendo que cada uno evolucione
 * de manera independiente.
 */
export class CloudEstablishmentMapper{
    static toOrm(domainEntity: CloudEstablishmentEntity): CloudEstablishmentOrmEntity{
        const ormEntity = new CloudEstablishmentOrmEntity();
        ormEntity.name = domainEntity.name;
        ormEntity.enrollmentKey = domainEntity.enrollmentKey;
        ormEntity.createdAt = domainEntity.createdAt;
        ormEntity.updatedAt = domainEntity.updatedAt;
        ormEntity.deletedAt = domainEntity.deletedAt;
        ormEntity.cloudBranchOffices = domainEntity.cloudBranchOffices? domainEntity.cloudBranchOffices.map(item => CloudBranchOfficeMapper.toOrm(item)): null;
        return ormEntity;
    } 

    static toDomain(ormEntity: CloudEstablishmentOrmEntity){
        return CloudEstablishmentEntity.reconstitute(
            ormEntity.cloudEstablishmentId,
            ormEntity.name,
            ormEntity.enrollmentKey,
            ormEntity.createdAt,
            ormEntity.updatedAt,
            ormEntity.deletedAt,
            ormEntity.cloudBranchOffices? ormEntity.cloudBranchOffices.map(item => CloudBranchOfficeMapper.toDomain(item)): null
        );
    }
}