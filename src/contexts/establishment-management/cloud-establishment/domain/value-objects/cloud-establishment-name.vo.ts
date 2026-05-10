import { DInvalidException } from "../../../../../shared/domain/exceptions/basics/d-invalid.exception";

export class CloudEstablishmentNameVO {
    private _name: string;
    private constructor(name: string){
        this._name = name;
        Object.freeze(this);
    }

    public static create(value: string){
        if(value.trim().length <= 3){
            throw new DInvalidException('El nombre del establecimiento debe contener mas de 3 caracteres.');
        }
        if(value.trim().length > 250){
            throw new DInvalidException('El nombre del establecimiento es muy largo. Máximo 250 caracteres.');
        }
        return new CloudEstablishmentNameVO(value);
    }
    get value(): string{
        return this._name;
    }
}