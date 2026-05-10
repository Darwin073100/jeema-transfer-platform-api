import { CloudEstablishmentEntity } from "../../../cloud-establishment/domain/entities/cloud-establishment.entity";
import { CloudBranchOfficeNameVO } from "../value-objects/cloud-branch-office-name.vo";

/**
 * BranchOffice es una Entidad Raíz de Agregado.
 * Es el punto de consistencia transaccional para la sucursal y su dirección.
 * Contiene la identidad de la sucursal y encapsula la lógica de negocio.
 */
export class CloudBranchOfficeEntity {
    private readonly _cloudBranchOfficeId: bigint;
    private _cloudEstablishmentId: bigint; // ID del Establishment al que pertenece
    private _localBranchOfficeId: bigint;
    private _name: CloudBranchOfficeNameVO;
    private readonly _createdAt: Date;
    private _updatedAt: Date | null;
    private _deletedAt: Date | null;
    private _cloudEstablishment: CloudEstablishmentEntity | null;
    // El constructor es privado para forzar el uso de métodos de fábrica para la creación.
    // Esto asegura que la entidad solo se cree en un estado válido.
    private constructor(
        cloudBranchOfficeId: bigint,
        cloudEstablishmentId: bigint,
        localBranchOfficeId: bigint,
        name: CloudBranchOfficeNameVO,
        createdAt: Date,
        updatedAt: Date | null,
        deletedAt: Date | null,
        cloudEstablishment: CloudEstablishmentEntity | null,
    ) {
        this._cloudBranchOfficeId = cloudBranchOfficeId;
        this._cloudEstablishmentId = cloudEstablishmentId;
        this._localBranchOfficeId = localBranchOfficeId;
        this._name = name;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
        this._cloudEstablishment = cloudEstablishment;
    }

    get cloudBranchOfficeId(): bigint { return this._cloudBranchOfficeId; }
    get localBranchOfficeId(): bigint { return this._localBranchOfficeId; }
    get name(): string { return this._name.value; }
    get cloudEstablishmentId(): bigint { return this._cloudEstablishmentId; }
    get cloudEstablishment(): CloudEstablishmentEntity | null { return this._cloudEstablishment; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }
    get deletedAt(): Date | null { return this._deletedAt; }

    public static create(
        name: string,
        cloudEstablishmentId: bigint,
        localBranchOfficeId: bigint,
    ): CloudBranchOfficeEntity {
        const cloudBranchOffice = new CloudBranchOfficeEntity(
            BigInt(0),
            cloudEstablishmentId,
            localBranchOfficeId,
            CloudBranchOfficeNameVO.create(name),
            new Date(),
            null,
            null,
            null
        );
        return cloudBranchOffice;
    }

    public static reconstitute(
        cloudBranchOfficeId: bigint,
        cloudEstablishmentId: bigint,
        localBranchOfficeId: bigint,
        name: string,
        createdAt: Date,
        updatedAt: Date | null,
        deletedAt: Date | null,
        cloudEstablishment: CloudEstablishmentEntity | null,
    ): CloudBranchOfficeEntity {
        return new CloudBranchOfficeEntity(
            cloudBranchOfficeId,
            cloudEstablishmentId,
            localBranchOfficeId,
            CloudBranchOfficeNameVO.create(name),
            createdAt,
            updatedAt,
            deletedAt,
            cloudEstablishment
        );
    }

    public updateName(name: string) {
        this._name = CloudBranchOfficeNameVO.create(name);
        this._updatedAt = new Date();
    }
}