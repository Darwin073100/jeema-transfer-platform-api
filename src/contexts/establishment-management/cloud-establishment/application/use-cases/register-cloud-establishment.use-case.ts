import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { CloudEstablishmentRepository } from "../../domain/repositories/cloud-establishment.repository";
import { RegisterCloudEstablishmentDto } from "../dtos/register-cloud-establishment.dto";

export class RegisterCloudEstablishmentUseCase {
  constructor(
    private readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
  ) {}

  public async execute(command: RegisterCloudEstablishmentDto): Promise<CloudEstablishmentEntity> {
    const newEstablishment = CloudEstablishmentEntity.create(command.name, command.enrollmentKey);
    const savedEntity = await this.cloudEstablishmentRepository.save(newEstablishment);
    return savedEntity;
  }
}