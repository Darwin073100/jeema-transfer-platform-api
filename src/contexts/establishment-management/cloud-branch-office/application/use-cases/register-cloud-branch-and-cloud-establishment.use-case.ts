import { CloudEstablishmentRepository } from "src/contexts/establishment-management/cloud-establishment/domain/repositories/cloud-establishment.repository";
import { CloudBranchOfficeRepository } from "../../domain/repositories/cloud-branch-office.repository";

export class RegisterCloudBranchAndCloudEstablishmentUseCase {
    constructor(
        readonly cloudBranchOfficeRepository: CloudBranchOfficeRepository,
        readonly cloudEstablishmentRepository: CloudEstablishmentRepository
    ){}

    
}