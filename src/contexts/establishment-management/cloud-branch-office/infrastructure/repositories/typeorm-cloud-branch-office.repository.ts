import { Inject, Injectable } from "@nestjs/common";
import { QueryFailedError, Repository } from "typeorm";
import { CloudBranchOfficeOrmEntity } from "../entities/cloud-branch-office.orm-entity";
import { CloudBranchOfficeRepository } from "../../domain/repositories/cloud-branch-office.repository";
import { DataSource } from "typeorm";
import { CloudBranchOfficeEntity } from "../../domain/entities/cloud-branch-office.entity";
import { CloudBranchOfficeMapper } from "../mappers/cloud-branch-office.mapper";
import { TRANSACTION_DB_REPOSITORIO, TransactionDBRepository } from "src/config/database/typeorm/transaction/domain/repositories/transaction-repository";
import { DAlreadyExistException } from "src/shared/domain/exceptions/basics/d-already-exist.exception";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";

@Injectable()
export class TypeormCloudBranchOfficeRepository implements CloudBranchOfficeRepository {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(TRANSACTION_DB_REPOSITORIO)
    private readonly tDB: TransactionDBRepository,
  ) {}

  private repo(): Repository<CloudBranchOfficeOrmEntity> {
    return this.tDB.getManager().getRepository(CloudBranchOfficeOrmEntity);
  }

  async save(entity: CloudBranchOfficeEntity): Promise<CloudBranchOfficeEntity> {
    try {
      let branchExist = await this.repo().findOneBy({cloudBranchOfficeId: entity.cloudBranchOfficeId});
      if(branchExist){
        branchExist = {
          ...branchExist,
          name: branchExist.name,
          deletedAt: branchExist.deletedAt
        }
        // Guardar la entidad
        const resp = await this.repo().save(branchExist); // El cascade se encargará de guardar/actualizar la dirección

        // Convertir una entidad de Typeorm a una entidad de dominio
        const domainEntity = CloudBranchOfficeMapper.toDomain(resp);

        return domainEntity;
      }

      // Conversion de una entidad de dominio a una entidad de Typeorm
      const branchOrmEntity = CloudBranchOfficeMapper.toOrm(entity);


      // Guardar la entidad
      const resp = await this.repo().save(branchOrmEntity); // El cascade se encargará de guardar/actualizar la dirección

      // Convertir una entidad de Typeorm a una entidad de dominio
      const domainEntity = CloudBranchOfficeMapper.toDomain(resp);

      return domainEntity;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error as any;
        if (pgError.code === '23505') {
          throw new DAlreadyExistException('Ya existe una sucursal registrada con ese identificador local en este establecimiento.');
        }
        if (pgError.code === '23503') {
          throw new DNotFoundException('El establecimiento asociado no existe.');
        }
      }
      throw error;
    }
  }

  async findById(id: bigint): Promise<CloudBranchOfficeEntity | null> {
    const branchOrmEntity = await this.repo().findOne({
      where: { cloudBranchOfficeId: id },
      relations: {
        cloudEstablishment: true,
      }
    });

    if (!branchOrmEntity) {
      return null;
    }

    const branchOfficeEntity = CloudBranchOfficeMapper.toDomain(branchOrmEntity);
    return branchOfficeEntity;
  }

  delete(entityId: bigint): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  findAll(): Promise<CloudBranchOfficeEntity[]> {
    throw new Error("Method not implemented.");
  }

  async existById(cloudBranchOfficeId: bigint): Promise<CloudBranchOfficeEntity | null> {
    const result = await this.repo().findOneBy({
      cloudBranchOfficeId
    });
    return result? CloudBranchOfficeMapper.toDomain(result): null;
  }
}