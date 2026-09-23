import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany, Index, } from 'typeorm';
import { TemplateOrmEntity } from '../../../../../shared/infraestructure/typeorm/template.orm-entity';
import { CloudEstablishmentOrmEntity } from '../../../cloud-establishment/infrastructure/entities/cloud-establishment.orm-entity';
import { CloudTransferOrmEntity } from 'src/contexts/transfer-management/cloud-transfer/infrastructure/entities/cloud-transfer.orm-entity';

@Entity('cloud_branch_office')
@Index('idx_cloud_est_local_branch', ['cloudEstablishmentId', 'localBranchOfficeId'])
export class CloudBranchOfficeOrmEntity extends TemplateOrmEntity {
  @PrimaryGeneratedColumn('increment',{ name: 'cloud_branch_office_id', type: 'bigint' })
  cloudBranchOfficeId!: bigint;
  @Column({ type: 'bigint', name: 'local_branch_office_id', nullable: false })
  localBranchOfficeId!: bigint;
  @Column({ type: 'bigint', name: 'cloud_establishment_id' })
  cloudEstablishmentId!: bigint;
  @Column({ type: 'varchar', length: 250, nullable: false })
  name!: string;
  @Column({ type: 'boolean', name: 'is_active', nullable: false, default: true })
  isActive!: boolean;
  @ManyToOne(() => CloudEstablishmentOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cloud_establishment_id' })
  cloudEstablishment!: CloudEstablishmentOrmEntity | null;
  @OneToMany(()=> CloudTransferOrmEntity, (item)=> item.fromCloudBranch)
  fromCloudTransfer!: CloudTransferOrmEntity[]|null;
  @OneToMany(()=> CloudTransferOrmEntity, (item)=> item.toCloudBranch)
  toCloudTransfer!: CloudTransferOrmEntity[]|null;
}
