import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";
import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { CloudEstablishmentRepository } from "../../domain/repositories/cloud-establishment.repository";

export class FindCloudEstablishmentByIdUseCase {
  constructor(
    private readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
  ) {}

  public async execute(id: bigint): Promise<CloudEstablishmentEntity> {
    const establishment = await this.cloudEstablishmentRepository.findById(id);
    if(!establishment){
      throw new DNotFoundException('No se encontró el establecimiento.');
    }
    return establishment;
  }
}