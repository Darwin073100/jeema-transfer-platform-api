import { CloudBranchOfficeEntity } from "../../../cloud-branch-office/domain/entities/cloud-branch-office.entity";
import { CloudEstablishmentEnrollmentVO } from "../value-objects/cloud-establishment-enrollment-key.vo";
import { CloudEstablishmentNameVO } from "../value-objects/cloud-establishment-name.vo";

export class CloudEstablishmentEntity {
    private readonly _cloudEstablishmentId: bigint;
    private _name: CloudEstablishmentNameVO;
    private _enrollmentKey: CloudEstablishmentEnrollmentVO;
    private readonly _createdAt: Date;
    private _updatedAt: Date | null;
    private _deletedAt: Date | null;
    private _cloudBranchOffices: CloudBranchOfficeEntity[] | null;

    private constructor(
    cloudEstablishmentId: bigint,
    name: CloudEstablishmentNameVO,
    enrollmentKey: CloudEstablishmentEnrollmentVO,
    createdAt: Date,
    updatedAt: Date | null,
    deletedAt: Date | null,
    cloudBranchOffices: CloudBranchOfficeEntity[] | null,
    ) {
        this._cloudEstablishmentId = cloudEstablishmentId;
        this._name = name;
        this._enrollmentKey = enrollmentKey;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
        this._cloudBranchOffices = cloudBranchOffices;
    }

    /**
   * Crea una nueva instancia de Cloud Establishment.
   * @param name El nombre del Cloud Establishment.
   * @param enrollmentKey La llave del Cloud Establishment.
   * @returns Una nueva instancia de Cloud Establishment.
   */
  static create(name: string, enrollmentKey: string): CloudEstablishmentEntity {
    const establishment = new CloudEstablishmentEntity(
      BigInt(0),
      CloudEstablishmentNameVO.create(name),
      CloudEstablishmentEnrollmentVO.create(enrollmentKey),
      new Date(), // createdAt
      null, // updatedAt
      null, // deletedAt
      null,
    );
    return establishment;
  }

  static reconstitute(
    establishmentId: bigint,
    name: string,
    enrollmentKey: string,
    createdAt: Date,
    updatedAt: Date | null,
    deletedAt: Date | null,
    cloudBranchOffices: CloudBranchOfficeEntity[] | null,
  ): CloudEstablishmentEntity {
    return new CloudEstablishmentEntity(
      establishmentId, 
      CloudEstablishmentNameVO.create(name), 
      CloudEstablishmentEnrollmentVO.create(enrollmentKey),
      createdAt, 
      updatedAt, 
      deletedAt, 
      cloudBranchOffices, 
    );
  }

  // Getters
  get cloudEstablishmentId(): bigint {
    return this._cloudEstablishmentId;
  }
  get name(): string {
    return this._name.value;
  }
  get enrollmentKey(): string {
    return this._enrollmentKey.value;
  }
  get cloudBranchOffices(): CloudBranchOfficeEntity[] | null {
    return this._cloudBranchOffices;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date | null {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public updateName(name: string){
    this._name = CloudEstablishmentNameVO.create(name);
    this._updatedAt= new Date();
  }
  public updateEnrollmentKey(enrollmentKey: string){
    this._enrollmentKey = CloudEstablishmentEnrollmentVO.create(enrollmentKey);
    this._updatedAt= new Date();
  }
}

