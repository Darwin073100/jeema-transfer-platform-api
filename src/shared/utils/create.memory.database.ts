import { DataSource } from "typeorm";
import { DataType, newDb} from 'pg-mem';

export async function createMemoryDatabase():Promise<DataSource>{
  
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  db.public.interceptQueries((query) => {
    if (query.includes("information_schema.columns")) {
      return [];
    }
  });

  db.public.registerFunction({
    name: 'current_database',
    returns: DataType.text,
    implementation: () => 'test_db',
  });

  db.public.registerFunction({
    name: 'version',
    returns: DataType.text,
    implementation: () => 'PostgreSQL 15.0, compiled by Visual C++ build 1914, 64-bit',
  });

  db.public.many(`
    CREATE VIEW pg_views AS 
    SELECT NULL::text AS schemaname, NULL::text AS viewname 
    WHERE false;
  `);

  db.public.many(`
    CREATE TABLE pg_tables (
      schemaname text,
      tablename text
    );
  `);

  const dataSource = db.adapters.createTypeormDataSource({
    type: 'postgres',
    database: 'test_db',
    entities: [`${__dirname}/../../../**/*.schema.{ts,js}`],
    migrations: [`${__dirname}/../../../infraestructure/database/typeorm/migrations/*.{ts,js}`],
    migrationsTableName: 'migrations',
    synchronize: false,
  });

  await dataSource.initialize();
  // await dataSource.synchronize();
  await dataSource.runMigrations(); // En lugar de synchronize()

  return dataSource;
}