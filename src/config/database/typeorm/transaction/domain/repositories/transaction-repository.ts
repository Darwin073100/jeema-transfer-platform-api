export const TRANSACTION_DB_REPOSITORIO = Symbol('TRANSACTION_DB_REPOSITORIO');
export interface TransactionDBRepository<T = any> {
  /** Inicia la transacción, configurando un QueryRunner transaccional en el contexto. */
  beginTransaction(): Promise<void>;

  /** Confirma la transacción. */
  commit(): Promise<void>;

  /** Revierte la transacción. */
  rollback(): Promise<void>;

  /**
   * NUEVO MÉTODO: Ejecuta todo dentro de un contexto seguro
   */
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>
  
  /** Método auxiliar para que los repositorios obtengan el EntityManager activo. */
  getManager(): T;
}