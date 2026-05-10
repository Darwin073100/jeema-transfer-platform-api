import { DNotFoundException } from "../../../../../shared/domain/exceptions/basics/d-not-found.exception";
import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";
import { CloudEstablishmentRepository } from "../../domain/repositories/cloud-establishment.repository";
import { UpdateCloudEstablishmentDto } from "../dtos/update-establishment.dto";

export class UpdateCloudEstablishmentUseCase {
  constructor(
    private readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
  ) {}

  public async execute(command: UpdateCloudEstablishmentDto): Promise<CloudEstablishmentEntity> {
    //! Buscamos el establecimiento que se desea actualizar.
    const establishmentExist = await this.cloudEstablishmentRepository.existById(command.cloudEstablishmentId);
    
    //! Lanzamos exception para notificar que no se encontró el establecimiento.
    if(!establishmentExist){
      throw new DNotFoundException('No se encontró el establecimiento.');
    }

    //! Si viene el nombre actualizarlo en la entidad de dominio
    if(command.name){
      establishmentExist.updateName(command.name);
    }
    //Si viene la llave actualizarla en la entidad de dominio
    if(command.enrollmentKey){
      establishmentExist.updateEnrollmentKey(command.enrollmentKey);
    }

    const savedEntity = await this.cloudEstablishmentRepository.save(establishmentExist);

    return savedEntity;
  }
}