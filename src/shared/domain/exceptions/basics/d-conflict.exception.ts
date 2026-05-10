import { DomainException } from "../domain.exceptions";

export class DConflictException extends DomainException {
    constructor(message: string){
        super(message);
        this.name = 'ConflictException';
    }
}