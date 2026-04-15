import { CloudBranchOfficeHttpMapper } from "src/contexts/establishment-management/cloud-branch-office/presentation/mappers/cloud-branch-office.http-mapper";
import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { ICloudEstablishment } from "../interfaces/ICloudEstablishment";

export class CloudEstablishmentHttpMapper {
    static toHttpResponse(entity: CloudEstablishmentEntity): ICloudEstablishment{
        return {
            cloudEstablishmentId: entity.cloudEstablishmentId.toString(),
            name: entity.name,
            enrollmentKey: entity.enrollmentKey,
            createdAt: entity.createdAt,
            deletedAt: entity.deletedAt,
            updatedAt: entity.updatedAt,
            cloudBranchOffices: entity.cloudBranchOffices? entity.cloudBranchOffices.map(item => CloudBranchOfficeHttpMapper.toHttpResponse(item)): [],
        }
    }
}