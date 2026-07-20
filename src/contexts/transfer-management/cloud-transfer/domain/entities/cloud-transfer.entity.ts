import type { CloudEstablishmentEntity } from "src/contexts/establishment-management/cloud-establishment/domain/entities/cloud-establishment.entity";
import type { CloudTransferStatusEnum } from "../enums/CloudTransferStatusEnum";
import type { CloudBranchOfficeEntity } from "src/contexts/establishment-management/cloud-branch-office/domain/entities/cloud-branch-office.entity";

export class CloudTransferEntity {
    private _cloudTransferId: bigint;
    private _cloudEstablishmentId: bigint;
    private _fromCloudBranchId: bigint;
    private _toCloudBranchId: bigint;
    private _localTransferId: bigint;
    private _payload: any;
    private _status: CloudTransferStatusEnum;
    private _cloudEstablishment: CloudEstablishmentEntity | null;
    private _fromCloudBranch: CloudBranchOfficeEntity | null;
    private _toCloudBranch: CloudBranchOfficeEntity | null;
    private _createdAt: Date;
    private _updatedAt: Date | null;
    private _deletedAt: Date | null;

    private constructor(
        cloudTransferId: bigint,
        cloudEstablishmentId: bigint,
        fromCloudBranchId: bigint,
        toCloudBranchId: bigint,
        localTransferId: bigint,
        payload: any,
        status: CloudTransferStatusEnum,
        cloudEstablishment: CloudEstablishmentEntity | null,
        fromCloudBranch: CloudBranchOfficeEntity | null,
        toCloudBranch: CloudBranchOfficeEntity | null,
        createdAt: Date,
        updatedAt: Date | null,
        deletedAt: Date | null,
    ){
        this._cloudTransferId = cloudTransferId;
        this._cloudEstablishmentId = cloudEstablishmentId;
        this._fromCloudBranchId = fromCloudBranchId;
        this._toCloudBranchId = toCloudBranchId;
        this._localTransferId = localTransferId;
        this._payload = payload;
        this._status = status;
        this._cloudEstablishment = cloudEstablishment;
        this._fromCloudBranch = fromCloudBranch;
        this._toCloudBranch = toCloudBranch;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
    }

    public static create(
        cloudEstablishmentId: bigint,
        fromCloudBranchId: bigint,
        toCloudBranchId: bigint,
        localTransferId: bigint,
        payload: any,
        status: CloudTransferStatusEnum,
    ){
        const entity = new CloudTransferEntity(
            BigInt(0),
            cloudEstablishmentId,
            fromCloudBranchId,
            toCloudBranchId,
            localTransferId,
            payload,
            status,
            null,
            null,
            null,
            new Date(),
            null,
            null
        );
        return entity;
    }

    public static reconstitute(
        cloudTransferId: bigint,
        cloudEstablishmentId: bigint,
        fromCloudBranchId: bigint,
        toCloudBranchId: bigint,
        localTransferId: bigint,
        payload: any,
        status: CloudTransferStatusEnum,
        cloudEstablishment: CloudEstablishmentEntity | null,
        fromCloudBranch: CloudBranchOfficeEntity | null,
        toCloudBranch: CloudBranchOfficeEntity | null,
        createdAt: Date,
        updatedAt: Date | null,
        deletedAt: Date | null,
    ){
        const entity = new CloudTransferEntity(
            cloudTransferId,
            cloudEstablishmentId,
            fromCloudBranchId,
            toCloudBranchId,
            localTransferId,
            payload,
            status,
            cloudEstablishment,
            fromCloudBranch,
            toCloudBranch,
            createdAt,
            updatedAt,
            deletedAt
        );
        return entity;
    }

    public get cloudTransferId(){ return this._cloudTransferId; }
    public get cloudEstablishmentId(){ return this._cloudEstablishmentId; }
    public get fromCloudBranchId(){ return this._fromCloudBranchId; }
    public get toCloudBranchId(){ return this._toCloudBranchId; }
    public get localTransferId(){ return this._localTransferId; }
    public get payload(){ return this._payload; }
    public get status(){ return this._status; }
    public get cloudEstablishment(){ return this._cloudEstablishment; }
    public get fromCloudBranch(){ return this._fromCloudBranch; }
    public get toCloudBranch(){ return this._toCloudBranch; }
    public get createdAt(){ return this._createdAt; }
    public get updatedAt(){ return this._updatedAt; }
    public get deletedAt(){ return this._deletedAt; }

    public updateToCloudBranchId(toCloudBranchId: bigint){
        this._toCloudBranchId = toCloudBranchId;
    }
    public updateToCloudBranch(toCloudBranch: CloudBranchOfficeEntity | null){
        this._toCloudBranch = toCloudBranch;
    }
    public updatePayload(payload: any){
        this._payload = payload;
    }
    public updateStatus(status: CloudTransferStatusEnum){
        this._status = status;
    }

}