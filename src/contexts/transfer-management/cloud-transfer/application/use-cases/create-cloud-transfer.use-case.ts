import { CloudBranchOfficeRepository } from 'src/contexts/establishment-management/cloud-branch-office/domain/repositories/cloud-branch-office.repository';
import { TransactionDBRepository } from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';
import { DNotFoundException } from 'src/shared/domain/exceptions/basics/d-not-found.exception';
import { DInvalidException } from 'src/shared/domain/exceptions/basics/d-invalid.exception';
import { DAlreadyExistException } from 'src/shared/domain/exceptions/basics/d-already-exist.exception';
import { CloudTransferRepository } from '../../domain/repositories/cloud-transfer.repository';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { CloudTransferStatusEnum } from '../../domain/enums/CloudTransferStatusEnum';
import { CreateCloudTransferDTO } from '../dtos/create-cloud-transfer.dto';

export class CreateCloudTransferUseCase {
  constructor(
    readonly cloudTransferRepository: CloudTransferRepository,
    readonly cloudBranchOfficeRepository: CloudBranchOfficeRepository,
    readonly transactionDB: TransactionDBRepository,
  ) {}

  async execute(dto: CreateCloudTransferDTO): Promise<CloudTransferEntity> {
    return await this.transactionDB.runInTransaction(async () => {
      if (dto.fromCloudBranchId === dto.toCloudBranchId) {
        throw new DInvalidException(
          'La sucursal de origen y la sucursal de destino no pueden ser la misma.',
        );
      }
      if (!dto.items || dto.items.length === 0) {
        throw new DInvalidException(
          'El traspaso debe incluir al menos un item.',
        );
      }

      const fromCloudBranch = await this.cloudBranchOfficeRepository.findById(
        dto.fromCloudBranchId,
      );
      if (!fromCloudBranch) {
        throw new DNotFoundException('La sucursal de origen no existe.');
      }
      const toCloudBranch = await this.cloudBranchOfficeRepository.findById(
        dto.toCloudBranchId,
      );
      if (!toCloudBranch) {
        throw new DNotFoundException('La sucursal de destino no existe.');
      }

      // Se compara como string en vez de con `!==` directo sobre bigint: algunos mappers de
      // infraestructura (p. ej. CloudBranchOfficeMapper) no fuerzan el cast a bigint de las
      // columnas `bigint` de TypeORM, que en tiempo de ejecución pueden llegar como `string`.
      if (
        String(fromCloudBranch.cloudEstablishmentId) !==
        String(toCloudBranch.cloudEstablishmentId)
      ) {
        throw new DInvalidException(
          'Ambas sucursales deben pertenecer al mismo establecimiento.',
        );
      }

      const alreadyExists =
        await this.cloudTransferRepository.findByFromCloudBranchIdAndLocalTransferId(
          dto.fromCloudBranchId,
          dto.localTransferId,
        );
      if (alreadyExists) {
        throw new DAlreadyExistException(
          'Ya existe un traspaso con ese identificador local para esta sucursal de origen.',
        );
      }

      const payload = {
        shipmentNotes: dto.shipmentNotes ?? null,
        items: dto.items,
      };

      const cloudTransfer = CloudTransferEntity.create(
        // Cast defensivo: ver nota sobre bigint-como-string más arriba.
        BigInt(fromCloudBranch.cloudEstablishmentId),
        dto.fromCloudBranchId,
        dto.toCloudBranchId,
        dto.localTransferId,
        payload,
        CloudTransferStatusEnum.PENDING,
      );

      const savedCloudTransfer =
        await this.cloudTransferRepository.save(cloudTransfer);

      savedCloudTransfer.updateFromCloudBranch(fromCloudBranch);
      savedCloudTransfer.updateToCloudBranch(toCloudBranch);
      savedCloudTransfer.updateCloudEstablishment(
        fromCloudBranch.cloudEstablishment,
      );

      return savedCloudTransfer;
    });
  }
}
