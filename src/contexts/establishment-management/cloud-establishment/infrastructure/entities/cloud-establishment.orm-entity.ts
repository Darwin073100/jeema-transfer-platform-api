import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TemplateOrmEntity } from '../../../../../shared/infraestructure/typeorm/template.orm-entity';
import { CloudBranchOfficeOrmEntity } from '../../../cloud-branch-office/infrastructure/entities/cloud-branch-office.orm-entity';

/**
 * CloudEstablishmentOrmEntity es una entidad de TypeORM que representa la tabla
 * 'cloud_establishment' en la base de datos.
 *
 * Esta clase NO es parte de la capa de Dominio. Es una representación de infraestructura
 * para la persistencia. Contiene decoradores específicos de TypeORM.
 */
@Entity('cloud_establishment') // Mapea esta clase a la tabla 'cloud_establishment'
export class CloudEstablishmentOrmEntity extends TemplateOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'cloud_establishment_id' })
  cloudEstablishmentId: bigint; // Usamos bigint para corresponder con bigserial de PostgreSQL
  @Column({ type: 'varchar', length: 250, unique: true, nullable: false })
  name: string;
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  enrollmentKey: string;
  @OneToMany(()=> CloudBranchOfficeOrmEntity, cloudBranchOffice=> cloudBranchOffice.cloudEstablishment)
  cloudBranchOffices: CloudBranchOfficeOrmEntity[]|null;
}