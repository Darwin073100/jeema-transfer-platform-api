import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { ICloudEstablishment } from "../interfaces/ICloudEstablishment";

export class CloudEstablishmentHttpMapper {
    static toHttpREsponse(entity: CloudEstablishmentEntity): ICloudEstablishment{
        return {
            cloudEstablishmentId: entity.cloudEstablishmentId.toString(),
            name: entity.name,
            enrollmentKey: entity.enrollmentKey,
            createdAt: entity.createdAt,
            deletedAt: entity.deletedAt,
            updatedAt: entity.updatedAt,
            cloudBranchOffices: [],
        }
    }
}