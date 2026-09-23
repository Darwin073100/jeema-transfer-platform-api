import type { CloudEstablishmentEntity } from 'src/contexts/establishment-management/cloud-establishment/domain/entities/cloud-establishment.entity';
import type { CloudTransferStatusEnum } from '../enums/CloudTransferStatusEnum';
import type { CloudBranchOfficeEntity } from 'src/contexts/establishment-management/cloud-branch-office/domain/entities/cloud-branch-office.entity';
import { DConflictException } from 'src/shared/domain/exceptions/basics/d-conflict.exception';
import { CloudTransferStatusEnum as StatusEnum } from '../enums/CloudTransferStatusEnum';

export class CloudTransferEntity {
  private _cloudTransferId: bigint;
  private _cloudEstablishmentId: bigint;
  private _fromCloudBranchId: bigint;
  private _toCloudBranchId: bigint;
  private _localTransferId: bigint;
  private _payload: any;
  private _status: CloudTransferStatusEnum;
  private _notes: string | null;
  private _errorMessage: string | null;
  private _inTransitAt: Date | null;
  private _approvedAt: Date | null;
  private _receivedAt: Date | null;
  private _cancelledAt: Date | null;
  private _errorAt: Date | null;
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
    notes: string | null,
    errorMessage: string | null,
    inTransitAt: Date | null,
    approvedAt: Date | null,
    receivedAt: Date | null,
    cancelledAt: Date | null,
    errorAt: Date | null,
    cloudEstablishment: CloudEstablishmentEntity | null,
    fromCloudBranch: CloudBranchOfficeEntity | null,
    toCloudBranch: CloudBranchOfficeEntity | null,
    createdAt: Date,
    updatedAt: Date | null,
    deletedAt: Date | null,
  ) {
    this._cloudTransferId = cloudTransferId;
    this._cloudEstablishmentId = cloudEstablishmentId;
    this._fromCloudBranchId = fromCloudBranchId;
    this._toCloudBranchId = toCloudBranchId;
    this._localTransferId = localTransferId;
    this._payload = payload;
    this._status = status;
    this._notes = notes;
    this._errorMessage = errorMessage;
    this._inTransitAt = inTransitAt;
    this._approvedAt = approvedAt;
    this._receivedAt = receivedAt;
    this._cancelledAt = cancelledAt;
    this._errorAt = errorAt;
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
    notes?: string | null,
  ) {
    const entity = new CloudTransferEntity(
      BigInt(0),
      cloudEstablishmentId,
      fromCloudBranchId,
      toCloudBranchId,
      localTransferId,
      payload,
      status,
      notes ?? null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      null,
      null,
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
    notes: string | null,
    errorMessage: string | null,
    inTransitAt: Date | null,
    approvedAt: Date | null,
    receivedAt: Date | null,
    cancelledAt: Date | null,
    errorAt: Date | null,
    cloudEstablishment: CloudEstablishmentEntity | null,
    fromCloudBranch: CloudBranchOfficeEntity | null,
    toCloudBranch: CloudBranchOfficeEntity | null,
    createdAt: Date,
    updatedAt: Date | null,
    deletedAt: Date | null,
  ) {
    const entity = new CloudTransferEntity(
      cloudTransferId,
      cloudEstablishmentId,
      fromCloudBranchId,
      toCloudBranchId,
      localTransferId,
      payload,
      status,
      notes,
      errorMessage,
      inTransitAt,
      approvedAt,
      receivedAt,
      cancelledAt,
      errorAt,
      cloudEstablishment,
      fromCloudBranch,
      toCloudBranch,
      createdAt,
      updatedAt,
      deletedAt,
    );
    return entity;
  }

  public get cloudTransferId() {
    return this._cloudTransferId;
  }
  public get cloudEstablishmentId() {
    return this._cloudEstablishmentId;
  }
  public get fromCloudBranchId() {
    return this._fromCloudBranchId;
  }
  public get toCloudBranchId() {
    return this._toCloudBranchId;
  }
  public get localTransferId() {
    return this._localTransferId;
  }
  public get payload() {
    return this._payload;
  }
  public get status() {
    return this._status;
  }
  public get notes() {
    return this._notes;
  }
  public get errorMessage() {
    return this._errorMessage;
  }
  public get inTransitAt() {
    return this._inTransitAt;
  }
  public get approvedAt() {
    return this._approvedAt;
  }
  public get receivedAt() {
    return this._receivedAt;
  }
  public get cancelledAt() {
    return this._cancelledAt;
  }
  public get errorAt() {
    return this._errorAt;
  }
  public get cloudEstablishment() {
    return this._cloudEstablishment;
  }
  public get fromCloudBranch() {
    return this._fromCloudBranch;
  }
  public get toCloudBranch() {
    return this._toCloudBranch;
  }
  public get createdAt() {
    return this._createdAt;
  }
  public get updatedAt() {
    return this._updatedAt;
  }
  public get deletedAt() {
    return this._deletedAt;
  }

  public updateToCloudBranch(toCloudBranch: CloudBranchOfficeEntity | null) {
    this._toCloudBranch = toCloudBranch;
  }
  public updateFromCloudBranch(
    fromCloudBranch: CloudBranchOfficeEntity | null,
  ) {
    this._fromCloudBranch = fromCloudBranch;
  }
  public updateCloudEstablishment(
    cloudEstablishment: CloudEstablishmentEntity | null,
  ) {
    this._cloudEstablishment = cloudEstablishment;
  }

  /**
   * `PENDING -> IN_TRANSIT` (llamada inicial de B) o `ERROR -> IN_TRANSIT` (reintento de B).
   */
  public startProcessing(): void {
    if (
      this._status !== StatusEnum.PENDING &&
      this._status !== StatusEnum.ERROR
    ) {
      throw new DConflictException(
        `No se puede iniciar el procesamiento de un traspaso en estado "${this._status}".`,
      );
    }
    this._status = StatusEnum.IN_TRANSIT;
    this._inTransitAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * `IN_TRANSIT -> RECEIVED`. Confirmación operativa de recepción física, todavía no se integra al inventario de B.
   */
  public markAsReceived(notes?: string): void {
    if (this._status !== StatusEnum.IN_TRANSIT) {
      throw new DConflictException(
        `No se puede confirmar la recepción de un traspaso en estado "${this._status}".`,
      );
    }
    this._status = StatusEnum.RECEIVED;
    this._receivedAt = new Date();
    if (notes) {
      this._notes = notes;
    }
    this._updatedAt = new Date();
  }

  /**
   * `RECEIVED -> APPROVED`. Estado terminal exitoso: B ya integró los datos en su BD local.
   */
  public approve(notes?: string): void {
    if (this._status !== StatusEnum.RECEIVED) {
      throw new DConflictException(
        `No se puede aprobar un traspaso en estado "${this._status}".`,
      );
    }
    this._status = StatusEnum.APPROVED;
    this._approvedAt = new Date();
    if (notes) {
      this._notes = notes;
    }
    this._updatedAt = new Date();
  }

  /**
   * `IN_TRANSIT -> ERROR`. Falló el procesamiento local del JSON en B.
   */
  public markAsError(errorMessage: string): void {
    if (this._status !== StatusEnum.IN_TRANSIT) {
      throw new DConflictException(
        `No se puede marcar como error un traspaso en estado "${this._status}".`,
      );
    }
    this._status = StatusEnum.ERROR;
    this._errorAt = new Date();
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();
  }

  /**
   * `PENDING|IN_TRANSIT|RECEIVED -> CANCELLED`. No es posible cancelar tras `APPROVED`
   * (ya se modificó el inventario local de B) ni tras `CANCELLED`.
   */
  public cancel(reason?: string): void {
    const cancellableFrom: CloudTransferStatusEnum[] = [
      StatusEnum.PENDING,
      StatusEnum.IN_TRANSIT,
      StatusEnum.RECEIVED,
    ];
    if (!cancellableFrom.includes(this._status)) {
      throw new DConflictException(
        `No se puede cancelar un traspaso en estado "${this._status}".`,
      );
    }
    this._status = StatusEnum.CANCELLED;
    this._cancelledAt = new Date();
    if (reason) {
      this._notes = reason;
    }
    this._updatedAt = new Date();
  }
}
