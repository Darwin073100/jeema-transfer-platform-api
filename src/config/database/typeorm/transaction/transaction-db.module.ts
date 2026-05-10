import { Module } from "@nestjs/common";
import { TRANSACTION_DB_REPOSITORIO } from "./domain/repositories/transaction-repository";
import { TypeormTransactionRepository } from "./infraestructure/repositories/TypeormTransactionRepository";

@Module({
    providers:[
        {
            provide: TRANSACTION_DB_REPOSITORIO,
            useClass: TypeormTransactionRepository
        }
    ],
    exports: [
        TRANSACTION_DB_REPOSITORIO
    ]
})
export class TransactionDBModule{}