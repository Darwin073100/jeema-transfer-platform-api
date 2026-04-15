import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CloudBranchOfficeOrmEntity } from "../entities/cloud-branch-office.orm-entity";
import { CloudBranchOfficeRepository } from "../../domain/repositories/cloud-branch-office.repository";
import { DataSource } from "typeorm";
import { CloudBranchOfficeEntity } from "../../domain/entities/cloud-branch-office.entity";
import { CloudBranchOfficeMapper } from "../mappers/cloud-branch-office.mapper";
import { TRANSACTION_DB_REPOSITORIO, TransactionDBRepository } from "src/config/database/typeorm/transaction/domain/repositories/transaction-repository";

@Injectable()
export class TypeormCloudBranchOfficeRepository implements CloudBranchOfficeRepository {
  private readonly ormBranchOfficeRepository: Repository<CloudBranchOfficeOrmEntity>;
  private readonly transactionDB: Repository<CloudBranchOfficeOrmEntity>;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(TRANSACTION_DB_REPOSITORIO)
    private readonly tDB: TransactionDBRepository,
  ) {
    this.ormBranchOfficeRepository = this.dataSource.getRepository<CloudBranchOfficeOrmEntity>(CloudBranchOfficeOrmEntity);
    this.transactionDB = this.tDB.getManager().getRepository(CloudBranchOfficeOrmEntity);
  }

  async save(entity: CloudBranchOfficeEntity): Promise<CloudBranchOfficeEntity> {
    try {
      let branchExist = await this.ormBranchOfficeRepository.findOneBy({cloudBranchOfficeId: entity.cloudBranchOfficeId});
      if(branchExist){
        branchExist = {
          ...branchExist,
          name: branchExist.name,
          deletedAt: branchExist.deletedAt
        }
        // Guardar la entidad
        const resp = await this.transactionDB.save(branchExist); // El cascade se encargará de guardar/actualizar la dirección
        
        // Convertir una entidad de Typeorm a una entidad de dominio
        const domainEntity = CloudBranchOfficeMapper.toDomain(resp);

        return domainEntity;
      }
    
      // Conversion de una entidad de dominio a una entidad de Typeorm
      const branchOrmEntity = CloudBranchOfficeMapper.toOrm(entity);
      
      
      // Guardar la entidad
      const resp = await this.transactionDB.save(branchOrmEntity); // El cascade se encargará de guardar/actualizar la dirección
      
      // Convertir una entidad de Typeorm a una entidad de dominio
      const domainEntity = CloudBranchOfficeMapper.toDomain(resp);

      return domainEntity;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: bigint): Promise<CloudBranchOfficeEntity | null> {
    const branchOrmEntity = await this.ormBranchOfficeRepository.findOne({
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
    const result = await this.ormBranchOfficeRepository.findOneBy({
      cloudBranchOfficeId
    });
    return result? CloudBranchOfficeMapper.toDomain(result): null;
  }
}