import { CloudEstablishmentRepository } from "src/contexts/establishment-management/cloud-establishment/domain/repositories/cloud-establishment.repository";
import { CloudBranchOfficeRepository } from "../../domain/repositories/cloud-branch-office.repository";
import { TransactionDBRepository } from "src/config/database/typeorm/transaction/domain/repositories/transaction-repository";
import { RegisterCloudBranchAndCloudEstablishmentDTO } from "../dtos/register-branch-and-establishment.dto";
import { CloudEstablishmentEntity } from "src/contexts/establishment-management/cloud-establishment/domain/entities/cloud-establishment.entity";
import { CloudBranchOfficeEntity } from "../../domain/entities/cloud-branch-office.entity";

export class RegisterCloudBranchAndCloudEstablishmentUseCase {
    constructor(
        readonly cloudBranchOfficeRepository: CloudBranchOfficeRepository,
        readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
        readonly transactionDB: TransactionDBRepository,
    ){}

    async exceute(dto: RegisterCloudBranchAndCloudEstablishmentDTO){
        try {
            // Englobar la logica en una transacción para evitar inconsistencia a la hora de persistir
            return await this.transactionDB.runInTransaction(async ()=> {
                // Creación de la entidad a guardar
                const establishment = CloudEstablishmentEntity.create(dto.establishmentName, dto.enrollmentKey);
                // Guardar el establecimiento
                const establishmentResult = await this.cloudEstablishmentRepository.save(establishment);
                // Creación de la entidad a guardar utilizando el id del establecimiento ya guardado
                const branchOffice = CloudBranchOfficeEntity.create(dto.branchOfficeName, establishmentResult.cloudEstablishmentId, dto.localBranchOfficeId);
                // Guardar la sucursal
                const branchOfficeResult = await this.cloudBranchOfficeRepository.save(branchOffice);

                // Asignamos el establecimiento a la entidad de retorno
                branchOfficeResult.updateEstablishment(establishmentResult);
                // REtornamos la sucursal y el establecimiento
                return branchOfficeResult;
            }) as CloudBranchOfficeEntity;
        } catch (error) {
            throw error;
        }
    }

}