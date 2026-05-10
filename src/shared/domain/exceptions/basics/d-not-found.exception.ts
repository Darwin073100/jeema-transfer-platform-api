import { DomainException } from "../domain.exceptions";

export class DNotFoundException extends DomainException {
    constructor(message: string){
        super(message);
        this.name = 'NotFoundException';
    }
}