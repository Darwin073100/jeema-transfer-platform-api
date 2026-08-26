import { CloudBranchOfficeOrmEntity } from "src/contexts/establishment-management/cloud-branch-office/infrastructure/entities/cloud-branch-office.orm-entity";
import { CloudEstablishmentOrmEntity } from "src/contexts/establishment-management/cloud-establishment/infrastructure/entities/cloud-establishment.orm-entity";
import { TemplateOrmEntity } from "src/shared/infraestructure/typeorm/template.orm-entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CloudTransferStatusEnum } from "../../domain/enums/CloudTransferStatusEnum";

@Entity({name: 'cloud_transfer'})
export class CloudTransferOrmEntity extends TemplateOrmEntity{
    @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'cloud_transfer_id' })
    cloudTransferId!: bigint;
    @Column({type: 'bigint', name: 'cloud_establishment_id'})
    cloudEstablishmentId!: bigint;
    @Column({type: 'bigint', name: 'from_cloud_branch_id'})
    fromCloudBranchId!: bigint;
    @Column({type: 'bigint', name: 'to_cloud_branch_id'})
    toCloudBranchId!: bigint;
    @Column({type: 'bigint', name: 'local_transfer_id'})
    localTransferId!: bigint;
    @Column({type: 'jsonb', name: 'payload'})
    payload!: any;
    @Column('enum',{enum: CloudTransferStatusEnum, name: 'status' })
    status!: CloudTransferStatusEnum;
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