import { ICloudEstablishment } from "src/contexts/establishment-management/cloud-establishment/presentation/interfaces/ICloudEstablishment";

export interface ICloudBranchOffice {
    cloudBranchOfficeId: string,
    cloudEstablishmentId: string,
    localBranchOfficeId: string,
    name: string,
    createdAt: Date,
    updatedAt: Date | null,
    deletedAt: Date | null,
    cloudEstablishment: ICloudEstablishment | null,
}