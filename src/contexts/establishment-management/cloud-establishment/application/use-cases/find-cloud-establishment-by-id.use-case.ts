import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { CloudEstablishmentRepository } from "../../domain/repositories/cloud-establishment.repository";

export class FindCloudEstablishmentByIdUseCase {
  constructor(
    private readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
  ) {}

  public async execute(id: bigint): Promise<CloudEstablishmentEntity | null> {
    const establishment = await this.cloudEstablishmentRepository.findById(id);
    return establishment;
  }
}