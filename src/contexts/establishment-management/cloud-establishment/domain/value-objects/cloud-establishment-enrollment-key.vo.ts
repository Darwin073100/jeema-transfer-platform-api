import { DInvalidException } from "../../../../../shared/domain/exceptions/basics/d-invalid.exception";

export class CloudEstablishmentEnrollmentVO {
    private _name: string;
    private constructor(name: string){
        this._name = name;
        Object.freeze(this);
    }

    public static create(value: string){
        if(value.trim().length <= 3){
            throw new DInvalidException('La llave debe tener mas de 3 caracteres');
        }
        if(value.trim().length > 250){
            throw new DInvalidException('La llave es muy larga. Máximo 255 caracteres.');
        }
        return new CloudEstablishmentEnrollmentVO(value);
    }
    get value(): string{
        return this._name;
    }
}