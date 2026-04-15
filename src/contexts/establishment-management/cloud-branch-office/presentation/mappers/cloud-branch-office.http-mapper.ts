import { CloudEstablishmentHttpMapper } from "src/contexts/establishment-management/cloud-establishment/presentation/mappers/cloud-establishment.http-mapper";
import { CloudBranchOfficeEntity } from "../../domain/entities/cloud-branch-office.entity";
import { ICloudBranchOffice } from "../interfaces/ICloudBranchOffice";

export class CloudBranchOfficeHttpMapper {
    static toHttpResponse(entity: CloudBranchOfficeEntity): ICloudBranchOffice {
        return {
            cloudEstablishmentId: entity.cloudEstablishmentId.toString(),
            cloudBranchOfficeId: entity.cloudBranchOfficeId.toString(),
            localBranchOfficeId: entity.localBranchOfficeId.toString(),
            name: entity.name,
            createdAt: entity.createdAt,
            deletedAt: entity.deletedAt,
            updatedAt: entity.updatedAt,
            cloudEstablishment: entity.cloudEstablishment? CloudEstablishmentHttpMapper.toHttpResponse(entity.cloudEstablishment): null,
        }
    }
}