import { DomainException } from "../domain.exceptions";

export class DAlreadyExistException extends DomainException {
    constructor(message: string){
        super(message);
        this.name = 'AlreadyExistException';
    }
}