import { CloudBranchOfficeOrmEntity } from 'src/contexts/establishment-management/cloud-branch-office/infrastructure/entities/cloud-branch-office.orm-entity';
import { CloudEstablishmentOrmEntity } from 'src/contexts/establishment-management/cloud-establishment/infrastructure/entities/cloud-establishment.orm-entity';
import { TemplateOrmEntity } from 'src/shared/infraestructure/typeorm/template.orm-entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CloudTransferStatusEnum } from '../../domain/enums/CloudTransferStatusEnum';

@Entity({ name: 'cloud_transfer' })
@Index(['toCloudBranchId', 'status'])
@Index(['fromCloudBranchId', 'localTransferId'], { unique: true })
export class CloudTransferOrmEntity extends TemplateOrmEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    name: 'cloud_transfer_id',
  })
  cloudTransferId!: bigint;
  @Column({ type: 'bigint', name: 'cloud_establishment_id' })
  cloudEstablishmentId!: bigint;
  @Column({ type: 'bigint', name: 'from_cloud_branch_id' })
  fromCloudBranchId!: bigint;
  @Column({ type: 'bigint', name: 'to_cloud_branch_id' })
  toCloudBranchId!: bigint;
  @Column({ type: 'bigint', name: 'local_transfer_id' })
  localTransferId!: bigint;
  @Column({ type: 'jsonb', name: 'payload' })
  payload!: any;
  @Column('enum', {
    enum: CloudTransferStatusEnum,
    name: 'status',
    default: CloudTransferStatusEnum.PENDING,
  })
  status!: CloudTransferStatusEnum;
  @Column({ type: 'text', name: 'notes', nullable: true })
  notes!: string | null;
  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage!: string | null;
  @Column({ type: 'timestamptz', name: 'in_transit_at', nullable: true })
  inTransitAt!: Date | null;
  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt!: Date | null;
  @Column({ type: 'timestamptz', name: 'received_at', nullable: true })
  receivedAt!: Date | null;
  @Column({ type: 'timestamptz', name: 'cancelled_at', nullable: true })
  cancelledAt!: Date | null;
  @Column({ type: 'timestamptz', name: 'error_at', nullable: true })
  errorAt!: Date | null;
  @ManyToOne(() => CloudEstablishmentOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cloud_establishment_id' })
  cloudEstablishment!: CloudEstablishmentOrmEntity | null;
  @ManyToOne(() => CloudBranchOfficeOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_cloud_branch_id' })
  fromCloudBranch!: CloudBranchOfficeOrmEntity | null;
  @ManyToOne(() => CloudBranchOfficeOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_cloud_branch_id' })
  toCloudBranch!: CloudBranchOfficeOrmEntity | null;
}
