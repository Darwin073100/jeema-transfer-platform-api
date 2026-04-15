import TimeMaster from "src/shared/utils/TimeMaster";
import { CloudEstablishmentRepository } from "../../domain/repositories/cloud-establishment.repository";
import { CloudEstablishmentEntity } from "../../domain/entities/cloud-establishment.entity";

export class GenerateEnrollmentKeyUseCase {
    constructor(
        private readonly repository: CloudEstablishmentRepository
    ){}

    async execute(){
        let enrollmentKeyExist: CloudEstablishmentEntity | null = null;
        let enrollmentKey = '';
        do{
            let date = new TimeMaster('America/Mexico_City');
            enrollmentKey = `${date.getInstance().getDay()}${(date.getInstance().getMonth()+1)}-${date.getInstance().getFullYear().toString()}-${date.getInstance().getTime().toString()}`;
            enrollmentKeyExist = await this.repository.existByEnrollmentKey(enrollmentKey);
        }while(enrollmentKeyExist);

        return enrollmentKey;
    }
}