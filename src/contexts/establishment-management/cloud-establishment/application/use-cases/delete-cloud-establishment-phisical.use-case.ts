import { CloudEstablishmentRepository } from "../../domain/repositories/cloud-establishment.repository";

export class DeleteCloudEstablishmentPhisicalUseCase {
    constructor( private readonly cloudEstablishmentRepository: CloudEstablishmentRepository){}

    async execute(entityId: bigint){
        return this.cloudEstablishmentRepository.delete(entityId);
    }
}