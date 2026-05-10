import { DomainException } from "../domain.exceptions";

export class DInvalidException extends DomainException {
    constructor(message: string){
        super(message);
        this.name = 'InvalidException';
    }
}