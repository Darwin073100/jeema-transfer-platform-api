import { CloudEstablishmentRepository } from 'src/contexts/establishment-management/cloud-establishment/domain/repositories/cloud-establishment.repository';
import { CloudBranchOfficeEntity } from '../../domain/entities/cloud-branch-office.entity';
import { DNotFoundException } from 'src/shared/domain/exceptions/basics/d-not-found.exception';

/**
 * Lista las sucursales inscritas en un establecimiento a partir de su enrollmentKey.
 *
 * Caso de uso real: la app local de una sucursal solo conoce con certeza el
 * enrollmentKey del establecimiento (su credencial de inscripción) y necesita
 * poder listar las demás sucursales del mismo establecimiento para elegir el
 * destino (toCloudBranchId) al crear un traspaso.
 *
 * No se agrega ningún método nuevo a CloudBranchOfficeRepository: la data ya
 * viene resuelta desde CloudEstablishmentRepository.findByEnrollmentKey, que
 * carga cloudBranchOffices en la misma query (ver typeorm-cloud-establishment.repository.ts).
 */
export class FindCloudBranchOfficesByEnrollmentKeyUseCase {
  constructor(
    readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
  ) {}

  async execute(enrollmentKey: string): Promise<CloudBranchOfficeEntity[]> {
    const establishment =
      await this.cloudEstablishmentRepository.findByEnrollmentKey(
        enrollmentKey,
      );
    if (!establishment) {
      throw new DNotFoundException(
        'No se encontró un establecimiento en la nube con esa clave de inscripción.',
      );
    }

    return establishment.cloudBranchOffices ?? [];
  }
}
