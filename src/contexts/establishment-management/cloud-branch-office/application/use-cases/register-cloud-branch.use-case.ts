import { CloudEstablishmentRepository } from "src/contexts/establishment-management/cloud-establishment/domain/repositories/cloud-establishment.repository";
import { CloudBranchOfficeRepository } from "../../domain/repositories/cloud-branch-office.repository";
import { TransactionDBRepository } from "src/config/database/typeorm/transaction/domain/repositories/transaction-repository";
import { CloudBranchOfficeEntity } from "../../domain/entities/cloud-branch-office.entity";
import { RegisterCloudBranchDTO } from "../dtos/register-branch.dto";
import { DNotFoundException } from "src/shared/domain/exceptions/basics/d-not-found.exception";

export class RegisterCloudBranchUseCase {
    constructor(
        readonly cloudBranchOfficeRepository: CloudBranchOfficeRepository,
        readonly cloudEstablishmentRepository: CloudEstablishmentRepository,
        readonly transactionDB: TransactionDBRepository,
    ){}

    async exceute(dto: RegisterCloudBranchDTO){
        try {
            // Englobar la logica en una transacción para evitar inconsistencia a la hora de persistir
            return await this.transactionDB.runInTransaction(async ()=> {
                // Buscar el establecimiento de acuerdo al enrollmentKey
                const establishment =  await this.cloudEstablishmentRepository.existByEnrollmentKey(dto.enrollmentKey);
                if(!establishment){
                    throw new DNotFoundException('No se encontró un establecimiento en la nube con esa clave de inscripción.');
                }
                // Creación de la entidad a guardar utilizando el id del establecimiento ya guardado
                const branchOffice = CloudBranchOfficeEntity.create(dto.branchOfficeName, establishment.cloudEstablishmentId, dto.localBranchOfficeId);
                // Guardar la sucursal
                const branchOfficeResult = await this.cloudBranchOfficeRepository.save(branchOffice);

                // Asignamos el establecimiento a la entidad de retorno
                branchOfficeResult.updateEstablishment(establishment);
                branchOfficeResult.updateCloudEstablishmentId(establishment.cloudEstablishmentId);
                // REtornamos la sucursal y el establecimiento
                return branchOfficeResult;
            }) as CloudBranchOfficeEntity;
        } catch (error) {
            throw error;
        }
    }

}