import { DInvalidException } from "../../../../../shared/domain/exceptions/basics/d-invalid.exception";

export class CloudBranchOfficeNameVO {
    private _name: string;
    private constructor(name: string){
        this._name = name;
        Object.freeze(this);
    }

    public static create(value: string){
        if(value.trim().length <= 3){
            throw new DInvalidException('El nombre de la sucursal debe contener mas de 3 caracteres.');
        }
        if(value.trim().length > 250){
            throw new DInvalidException('El nombre de la sucursal es muy largo. Máximo 250 caracteres.');
        }
        return new CloudBranchOfficeNameVO(value);
    }
    get value(): string{
        return this._name;
    }
}