import { CloudBranchOfficeOrmEntity } from "../../../contexts/establishment-management/cloud-branch-office/infrastructure/entities/cloud-branch-office.orm-entity";
import { CloudEstablishmentOrmEntity } from "../../../contexts/establishment-management/cloud-establishment/infrastructure/entities/cloud-establishment.orm-entity";
import { CloudTransferOrmEntity } from "../../../contexts/transfer-management/cloud-transfer/infrastructure/entities/cloud-transfer.orm-entity";

// Lista de entidades de typeorm centralizada.
export const entities = [
    CloudEstablishmentOrmEntity, CloudBranchOfficeOrmEntity, CloudTransferOrmEntity,
];