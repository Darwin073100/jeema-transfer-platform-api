import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, ManyToOne, } from 'typeorm';
import { TemplateOrmEntity } from '../../../../../shared/infraestructure/typeorm/template.orm-entity';
import { CloudEstablishmentOrmEntity } from '../../../cloud-establishment/infrastructure/entities/cloud-establishment.orm-entity';

@Entity('cloud_branch_office')
export class CloudBranchOfficeOrmEntity extends TemplateOrmEntity {
  @PrimaryGeneratedColumn('increment',{ name: 'cloud_branch_office_id', type: 'bigint' })
  cloudBranchOfficeId: bigint;
  @Column({ type: 'bigint', name: 'local_branch_office_id', nullable: false })
  localBranchOfficeId: bigint;
  @Column({ type: 'bigint', name: 'cloud_establishment_id' })
  cloudEstablishmentId: bigint;
  @Column({ type: 'varchar', length: 250, nullable: false })
  name: string;
  @ManyToOne(() => CloudEstablishmentOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cloud_establishment_id' })
  cloudEstablishment: CloudEstablishmentOrmEntity | null;
}
