import { Injectable, Scope } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { TransactionDBRepository } from '../../domain/repositories/transaction-repository';

// 💡 Esto es una convención: creamos una instancia de ALS fuera de la clase.
const asyncLocalStorage = new AsyncLocalStorage<QueryRunner>();

// El servicio debe ser de alcance de solicitud (Scope.REQUEST) para ser un singleton por request.
@Injectable({ scope: Scope.REQUEST })
export class TypeormTransactionRepository implements TransactionDBRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) {}

  // Implementación del método que usa el Caso de Uso para iniciar
  async beginTransaction(): Promise<void> {
    // Si ya existe un QueryRunner activo (por ejemplo, en un servicio anidado), lo ignoramos.
    if (asyncLocalStorage.getStore()) {
      return; 
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 🔑 Clave: Almacenamos el QueryRunner en el contexto asíncrono.
    asyncLocalStorage.enterWith(queryRunner);
  }

  // Implementación del commit
  async commit(): Promise<void> {
    const queryRunner = asyncLocalStorage.getStore();
    if (queryRunner) {
      try {
        await queryRunner.commitTransaction();
      } finally {
        await queryRunner.release();
        // Limpiar el contexto es crucial
        asyncLocalStorage.disable(); 
      }
    }
  }

  // Implementación del rollback
  async rollback(): Promise<void> {
    const queryRunner = asyncLocalStorage.getStore();
    if (queryRunner) {
      try {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
        // Limpiar el contexto es crucial
        asyncLocalStorage.disable();
      }
    }
  }

  // Implementación para que los repositorios obtengan el Manager
  getManager(): EntityManager {
    // Si hay un QueryRunner activo en el contexto, retornamos su EntityManager transaccional.
    const queryRunner = asyncLocalStorage.getStore();
    return queryRunner ? queryRunner.manager : this.dataSource.manager; // Si no hay, usa el Manager global (no transaccional)
  }
}