# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

JEEMA Transfer Platform API — a NestJS backend for managing inventory transfers (traspasos) between branch offices (sucursales) of an establishment. Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`); do not use npm/yarn commands.

## Commands

```bash
# Install
pnpm install

# Run
pnpm run start:dev      # watch mode (normal dev loop)
pnpm run start:debug    # watch mode + inspector
pnpm run start:prod     # runs dist/main after build
pnpm run build          # nest build

# Lint / format
pnpm run lint           # eslint --fix on src/apps/libs/test
pnpm run format         # prettier --write on src and test

# Tests
pnpm run test                         # unit tests (jest.config.js, matches *.spec.ts / *.test.ts)
pnpm run test -- path/to/file.spec.ts # single test file
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e                     # e2e config (jest-e2e.json), matches *.e2e-spec.ts
# NOTE: as of this writing there are no *.spec.ts/*.e2e-spec.ts files in the repo yet —
# these commands run against an empty suite.

# Database (TypeORM), via ts-node against src/config/database/typeorm/app.data.source.ts
pnpm run migration:generate <name>    # generate a migration from entity changes
pnpm run migration:run
pnpm run migration:revert

# Local Postgres
docker-compose up -d    # spins up postgres:15.3, reads DB_* vars from .env
```

Env vars come from `.env` (see `.env.template`): `DATABASE_URL`, `DB_*`, `JWT_SECRET`, `PORT`. `ConfigModule` is global (`src/app.module.ts`), loading `.env`, `.env.development`, `.env.production` in that order.

The `pnpm run module` script in `package.json` points at `src/config/scripts/generate.module.ts`, which does not exist in the repo — that command is currently non-functional, don't rely on it to scaffold new bounded contexts.

## Architecture

This is **not** a conventional NestJS controller→service→repository app. It's organized as **bounded contexts**, each internally structured as DDD/Clean Architecture layers:

```
src/contexts/<bounded-context>/<subdomain>/
  domain/          entities, value objects, repository interfaces — no framework/ORM imports
  application/      use-cases (plain classes, no @Injectable) + DTOs
  infrastructure/    TypeORM entities (*.orm-entity.ts), TypeORM repository impls, domain<->ORM mappers
  presentation/       controllers, class-validator commands (*.command.ts), domain<->HTTP mappers
  <context>.module.ts
```

Existing bounded contexts:
- `establishment-management/cloud-establishment` — establishments, enrollment keys. Fully wired (module, controller, use-cases, migration).
- `establishment-management/cloud-branch-office` — branch offices belonging to an establishment, registered via enrollment key. Fully wired.
- `transfer-management/cloud-transfer` — the transfer domain itself (the product's core purpose). **Only domain + ORM entities and enums exist.** No module, no use-cases, no controller, no migration, and it is not imported in `AppModule`. If asked to build out transfers, this is a from-scratch implementation following the pattern of the other two contexts, not an extension of existing wiring.

To add a new use-case/endpoint to an existing context, follow the pattern already present (e.g. `cloud-establishment.module.ts`): providers are registered as `{ provide: XUseCase, useFactory: (repo) => new XUseCase(repo), inject: [X_REPOSITORY] }`, not `@Injectable()` classes — use-cases are plain, framework-agnostic classes.

To wire up a brand-new bounded context end-to-end you must touch all of: the ORM entity, `src/config/database/typeorm/entities.ts` (central list TypeORM actually uses), a generated migration, the context's `*.module.ts`, and `src/app.module.ts` imports. Missing any one of these means the "feature" silently doesn't exist at runtime even if the domain/application code looks complete — this is exactly the current state of `cloud-transfer`.

### Key patterns

- **Repository DI via Symbol token**: each context defines `export const X_REPOSITORY = Symbol(...)` next to its repository interface in `domain/repositories/`, and binds it to a TypeORM implementation with `useClass` in the module. Domain code depends only on the interface.
- **Entities**: private constructor + static `create()` (new entity, validates via VOs) / `reconstitute()` (rehydrate from persistence) factory methods, private fields with getters, immutable value objects (`Object.freeze`) for validated primitives like names and enrollment keys.
- **Domain exceptions**: `DomainException` (abstract, `src/shared/domain/exceptions/domain.exceptions.ts`) is the base for `DNotFoundException`, `DAlreadyExistException`, `DInvalidException`, `DConflictException` (`src/shared/domain/exceptions/basics/`). These are framework-agnostic and thrown from use-cases/domain code.
- **Exception → HTTP mapping is manual per controller method**: each controller method wraps its use-case call in try/catch and maps `DNotFoundException`→404, `DAlreadyExistException`→400 individually (see `cloud-establishment.controller.ts`). There's a global `AllExceptionsFilter` (`src/shared/presentation/http/filters/all-exceptions.filter.ts`) but it only does generic fallback formatting — it does not translate `DomainException` subtypes. When adding a new controller method, follow the existing manual try/catch pattern for consistency, don't assume the global filter handles domain exceptions.
- **Transactions via AsyncLocalStorage**, not TypeORM's per-call transaction API: `TypeormTransactionRepository` (`src/config/database/typeorm/transaction/infraestructure/repositories/TypeormTransactionRepository.ts`) is a `Scope.REQUEST` provider wrapping a module-level `AsyncLocalStorage<QueryRunner>`. Call `runInTransaction(fn)` to run an operation inside a transaction; repositories fetch their `EntityManager`/`Repository` via `getManager()` on this service (which returns the ALS-stored transactional manager if present, else the global one), so repositories don't need the `QueryRunner` passed explicitly through call chains.
- **Central entity registry**: `src/config/database/typeorm/entities.ts` is the single list TypeORM's `TypeOrmModule.forRootAsync` actually uses (`typeorm-config.module.ts`). An ORM entity not listed here is invisible to migrations/sync even if fully coded elsewhere.
- **Soft delete**: base `TemplateOrmEntity` (`src/shared/infraestructure/typeorm/template.orm-entity.ts`) provides `createdAt`/`updatedAt`/`deletedAt` (`@DeleteDateColumn`); TypeORM excludes soft-deleted rows from normal finds automatically. Physical deletes are a separate explicit use-case (`delete-cloud-establishment-phisical.use-case.ts`).
- **`ParseBigIntPipe`** (`src/shared/pipes/parse-bigint.pipe.ts`) is the custom pipe for `bigint` route params (all entity IDs are `bigint`/bigserial).
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) and prefix `api/v1` are set in `src/main.ts`.

### Known gaps / traps (don't assume otherwise)

- **No authentication/authorization is wired up anywhere**, despite `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` being installed and `JWT_SECRET` being present in `.env`. There are no guards/strategies in `src/`. The `enrollmentKey` on an establishment is currently the only access-control mechanism for registering a branch office to it, and `GenerateEnrollmentKeyUseCase` derives the key from server timestamp (not a CSPRNG/uuid), so treat it as low-entropy, not a real secret.
- CORS is fully open (`origin: '*'` in `main.ts`) and Swagger setup is commented out in `main.ts`.
- `TypeormCloudBranchOfficeRepository.save()` has a bug on the update path: when a branch office already exists it reassigns `name`/`deletedAt` to their own current values instead of the incoming entity's new values, so updating an existing branch office is a no-op. `TypeormCloudEstablishmentRepository.save()` does the equivalent update correctly — use it as the reference when touching branch office persistence.
- `CloudBranchOfficeOrmEntity`'s inverse `fromCloudTransfer` relation currently points at the wrong property (`item.cloudEstablishment` instead of `item.fromCloudBranch`) — worth fixing before building real transfer queries/joins against branch offices.
- `initial-data-postgres-script.sql` and the `"school-platform-api": "link:"` dependency in `package.json` are leftovers from a sibling project and reference tables (`role`, `permission`, `transaction_type`, etc.) that don't exist in this schema — ignore them, don't treat them as the intended data model.
