import { Inject, Injectable } from '@nestjs/common';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { CloudTransferRepository } from '../../domain/repositories/cloud-transfer.repository';
import { CloudTransferOrmEntity } from '../entities/cloud-transfer.orm-entity';
import { CloudTransferEntity } from '../../domain/entities/cloud-transfer.entity';
import { CloudTransferMapper } from '../mappers/cloud-transfer.mapper';
import { CloudTransferStatusEnum } from '../../domain/enums/CloudTransferStatusEnum';
import {
  TRANSACTION_DB_REPOSITORIO,
  TransactionDBRepository,
} from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';
import { DAlreadyExistException } from 'src/shared/domain/exceptions/basics/d-already-exist.exception';
import { DNotFoundException } from 'src/shared/domain/exceptions/basics/d-not-found.exception';

@Injectable()
export class TypeormCloudTransferRepository implements CloudTransferRepository {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(TRANSACTION_DB_REPOSITORIO)
    private readonly tDB: TransactionDBRepository,
  ) {}

  private repo(): Repository<CloudTransferOrmEntity> {
    return this.tDB.getManager().getRepository(CloudTransferOrmEntity);
  }

  async save(entity: CloudTransferEntity): Promise<CloudTransferEntity> {
    try {
      let ormEntity = await this.repo().findOne({
        where: { cloudTransferId: entity.cloudTransferId },
      });

      if (ormEntity) {
        // Actualizar entidad existente (solo los campos que pueden mutar tras la creación).
        ormEntity.status = entity.status;
        ormEntity.notes = entity.notes;
        ormEntity.errorMessage = entity.errorMessage;
        ormEntity.inTransitAt = entity.inTransitAt;
        ormEntity.approvedAt = entity.approvedAt;
        ormEntity.receivedAt = entity.receivedAt;
        ormEntity.cancelledAt = entity.cancelledAt;
        ormEntity.errorAt = entity.errorAt;
        ormEntity.updatedAt = entity.updatedAt;
        ormEntity.deletedAt = entity.deletedAt;
      } else {
        ormEntity = CloudTransferMapper.toOrm(entity);
      }

      const savedOrmEntity = await this.repo().save(ormEntity);
      return CloudTransferMapper.toDomain(savedOrmEntity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error as any;
        if (pgError.code === '23505') {
          throw new DAlreadyExistException(
            'Ya existe un traspaso con ese identificador local para esta sucursal de origen.',
          );
        }
        if (pgError.code === '23503') {
          throw new DNotFoundException(
            'La sucursal o el establecimiento asociado no existe.',
          );
        }
      }
      throw error;
    }
  }

  async findById(id: bigint): Promise<CloudTransferEntity | null> {
    const ormEntity = await this.repo().findOne({
      where: { cloudTransferId: id },
      relations: {
        cloudEstablishment: true,
        fromCloudBranch: true,
        toCloudBranch: true,
      },
    });

    if (!ormEntity) {
      return null;
    }

    return CloudTransferMapper.toDomain(ormEntity);
  }

  delete(entityId: bigint): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<CloudTransferEntity[]> {
    throw new Error('Method not implemented.');
  }

  async existById(
    cloudTransferId: bigint,
  ): Promise<CloudTransferEntity | null> {
    const ormEntity = await this.repo().findOneBy({ cloudTransferId });
    return ormEntity ? CloudTransferMapper.toDomain(ormEntity) : null;
  }

  async findByToCloudBranchIdAndStatuses(
    toCloudBranchId: bigint,
    statuses: CloudTransferStatusEnum[],
  ): Promise<CloudTransferEntity[]> {
    const ormEntities = await this.repo().find({
      where: { toCloudBranchId, status: In(statuses) },
      relations: {
        cloudEstablishment: true,
        fromCloudBranch: true,
        toCloudBranch: true,
      },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map((item) => CloudTransferMapper.toDomain(item));
  }

  async findByFromCloudBranchIdAndLocalTransferId(
    fromCloudBranchId: bigint,
    localTransferId: bigint,
  ): Promise<CloudTransferEntity | null> {
    const ormEntity = await this.repo().findOneBy({
      fromCloudBranchId,
      localTransferId,
    });
    return ormEntity ? CloudTransferMapper.toDomain(ormEntity) : null;
  }
}
