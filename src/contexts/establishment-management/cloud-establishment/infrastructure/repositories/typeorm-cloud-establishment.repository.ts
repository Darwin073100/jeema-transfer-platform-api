import { Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { CloudEstablishmentRepository } from '../../domain/repositories/cloud-establishment.repository';
import { CloudEstablishmentOrmEntity } from '../entities/cloud-establishment.orm-entity';
import { DAlreadyExistException } from '../../../../../shared/domain/exceptions/basics/d-already-exist.exception';
import { DNotFoundException } from '../../../../../shared/domain/exceptions/basics/d-not-found.exception';
import { CloudEstablishmentMapper } from '../mappers/cloud-establishment.mapper';
import { CloudEstablishmentEntity } from '../../domain/entities/cloud-establishment.entity';
import { TRANSACTION_DB_REPOSITORIO, TransactionDBRepository } from 'src/config/database/typeorm/transaction/domain/repositories/transaction-repository';

@Injectable()
export class TypeormCloudEstablishmentRepository implements CloudEstablishmentRepository {
  private readonly repository: Repository<CloudEstablishmentOrmEntity>;
  private readonly transactionDB: Repository<CloudEstablishmentOrmEntity>;

  constructor(
    private readonly datasource: DataSource,
    @Inject(TRANSACTION_DB_REPOSITORIO)
    private readonly tDB: TransactionDBRepository,
  ) {
    this.repository = this.datasource.getRepository(CloudEstablishmentOrmEntity);
    this.transactionDB = this.tDB.getManager().getRepository(CloudEstablishmentOrmEntity);
  }

  /**
   * Guarda o actualiza un centro educativo en la base de datos.
   * Realiza la conversión entre la entidad de dominio y la entidad ORM.
   *
   * @param cloudEstablishment La instancia de EducationalCenter a guardar.
   */
  async save(cloudEstablishment: CloudEstablishmentEntity): Promise<CloudEstablishmentEntity> {
    try {
      let ormEntity = await this.repository.findOne({
        where: { cloudEstablishmentId: cloudEstablishment.cloudEstablishmentId }, // TypeORM puede necesitar un cast para bigint en algunos casos
      });

      if (ormEntity) {
        // Actualizar entidad existente
        ormEntity.name = cloudEstablishment.name;
        ormEntity.enrollmentKey = cloudEstablishment.enrollmentKey;
        ormEntity.updatedAt = cloudEstablishment.updatedAt;
        ormEntity.deletedAt = cloudEstablishment.deletedAt;
      } else {
        // Crear nueva entidad
        ormEntity = CloudEstablishmentMapper.toOrm(cloudEstablishment);
      }

      const savedOrmEntity = await this.transactionDB.save(ormEntity);
      return CloudEstablishmentMapper.toDomain(savedOrmEntity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error as any;
        if (pgError.code === '23505') {
          throw new DAlreadyExistException('La clave de registro o el nombre del establecimiento ya existe.');
        }
        if (pgError.code === '23503') {
          throw new DNotFoundException('Establecimeinto no encontrado.');
        }
      }
      throw error;
    }
  }

  /**
   * Busca un establecimiento por su ID en la base de datos.
   * Realiza la conversión de la entidad ORM a la entidad de dominio.
   *
   * @param id El ID del establecimiento.
   * @returns Una Promesa que se resuelve con la instancia de EducationalCenter
   * si se encuentra, o `null` si no existe.
   */
  async findById(id: bigint): Promise<CloudEstablishmentEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { cloudEstablishmentId: id },
      relations: {
        cloudBranchOffices: true
      }
    });

    if (!ormEntity) {
      return null;
    }

    return CloudEstablishmentMapper.toDomain(ormEntity);
  }

  async findByEnrollmentKey(enrollmentKey: string): Promise<CloudEstablishmentEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { enrollmentKey },
      relations: {
        cloudBranchOffices: true
      }
    });

    if (!ormEntity) {
      return null;
    }

    return CloudEstablishmentMapper.toDomain(ormEntity);
  }

  async delete(entityId: bigint): Promise<boolean> {
    try {
      const exist = await this.repository.findOneBy({ cloudEstablishmentId: entityId });
      if (!exist) {
        throw new DNotFoundException(`No encontramos el establecimiento en la nube con id ${entityId}.`);
      }
      await this.repository.query(`DELETE FROM cloud_establishment WHERE(cloud_establishment_id=${entityId});`);

      return true;
    } catch (error) {
      throw error;
    }
  }

  findAll(): Promise<CloudEstablishmentEntity[]> {
    throw new Error('Method not implemented.');
  }

  async existById(cloudEstablishmentId: bigint): Promise<CloudEstablishmentEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { cloudEstablishmentId }
    });

    if (!ormEntity) {
      return null;
    }

    return CloudEstablishmentMapper.toDomain(ormEntity);
  }

  async existByEnrollmentKey(enrollmentKey: string): Promise<CloudEstablishmentEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { enrollmentKey }
    });

    if (!ormEntity) {
      return null;
    }

    return CloudEstablishmentMapper.toDomain(ormEntity);
  }
}