/**
 * Módulo raíz de la aplicación. Importa y agrupa todos los módulos principales.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormConfigModule } from './config/database/typeorm/typeorm-config.module';
import { CloudEstablishmentModule } from './contexts/establishment-management/cloud-establishment/cloud-establishment.module';
import { CloudBranchOfficeModule } from './contexts/establishment-management/cloud-branch-office/cloud-branch-office.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    TypeormConfigModule, CloudEstablishmentModule, CloudBranchOfficeModule
  ],
})
export class AppModule {}
