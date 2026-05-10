/**
 * Script para ejecutar las migraciones de TypeORM usando ts-node.
 */
import { execSync } from "child_process";

const command = `npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/config/database/typeorm/app.data.source.ts`;

// ...removed console.log...
execSync(command, { stdio: "inherit" });