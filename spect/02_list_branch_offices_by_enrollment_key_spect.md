# Análisis Técnico: Listar sucursales inscritas por `enrollmentKey`

> Feature pequeño y acotado. Documento breve — no es una spec extensa como `01_transfer_shipment_spect.md`.

## Problema

La app local de una sucursal, al crear un traspaso (`POST /cloud-transfers`), necesita elegir la sucursal destino (`toCloudBranchId`). Lo único que la app local conoce con certeza es el `enrollmentKey` del establecimiento (su credencial de inscripción). No existía ningún endpoint GET que, a partir de ese `enrollmentKey`, devolviera la lista de sucursales del establecimiento.

## Impacto arquitectural

- **Backend**: un use-case nuevo + un endpoint nuevo, ambos en el contexto `establishment-management/cloud-branch-office`. No se toca `cloud-establishment` ni `cloud-transfer`.
- **Base de datos**: ninguno. La query ya existía (`TypeormCloudEstablishmentRepository.findByEnrollmentKey`, que hace `relations: { cloudBranchOffices: true }`).
- **`CloudBranchOfficeRepository`**: no se le agregó ningún método. Se decidió reusar `CloudEstablishmentRepository.findByEnrollmentKey` desde el nuevo use-case, porque la data ya viene resuelta desde ese lado (evita duplicar la misma query con otro shape).

## Decisiones

1. **Ubicación del endpoint**: `CloudBranchOfficeController` (`cloud-branch-offices`), no `CloudEstablishmentController`. Devuelve `ICloudBranchOffice[]` directamente (lo que el cliente realmente necesita para poblar un picker de sucursal destino), en vez de forzar al cliente a pedir el `ICloudEstablishment` completo y extraer `.cloudBranchOffices`. Mantiene el principio "cada contexto expone lo suyo".
2. **Ruta**: `GET /cloud-branch-offices/by-enrollment-key/:enrollmentKey`. Sin colisión con las rutas existentes del controller (`POST /cloud-branch-offices`, `POST /cloud-branch-offices/all`). No hay ningún `GET /cloud-branch-offices/:id` hoy, pero si se agrega en el futuro debe declararse **después** de esta ruta estática para no generar shadowing (Nest resuelve rutas en orden de declaración).
3. **Use-case nuevo**: `FindCloudBranchOfficesByEnrollmentKeyUseCase` (clase plana, sin `@Injectable`), inyecta solo `CloudEstablishmentRepository` vía el token `CLOUD_ESTABLISHMENT_REPOSITORY` (ya exportado por `CloudEstablishmentModule`, que `CloudBranchOfficeModule` ya importa — no hizo falta tocar imports de módulo). Llama a `findByEnrollmentKey`, lanza `DNotFoundException` si no existe el establecimiento, y retorna `establishment.cloudBranchOffices ?? []`.
4. **Manejo de errores**: `enrollmentKey` inexistente → `DNotFoundException` → 404 en el controller (patrón manual try/catch, igual que `RegisterCloudBranchUseCase`). No se devuelve lista vacía en ese caso — un `enrollmentKey` que no resuelve a ningún establecimiento es un error del cliente, no "cero sucursales".
5. **Filtrado**: la API devuelve la lista completa de sucursales del establecimiento, sin excluir ninguna. Excluir "la sucursal que hace la petición" queda como responsabilidad de la app local (ya conoce su propio `cloudBranchOfficeId` tras enrolarse).
6. **Soft-delete en relaciones — CONFIRMADO en runtime**: se probó contra Postgres real (registrar establecimiento + 2 sucursales, soft-eliminar una vía `UPDATE cloud_branch_office SET deleted_at = now()`, volver a pedir el listado). TypeORM sí excluye automáticamente las sucursales soft-deleted al cargarlas vía `relations: { cloudBranchOffices: true }` en `findOne` — la sucursal eliminada desapareció de la respuesta sin necesidad de filtrar manualmente.

## Archivos tocados

- `src/contexts/establishment-management/cloud-branch-office/application/use-cases/find-cloud-branch-offices-by-enrollment-key.use-case.ts` (nuevo)
- `src/contexts/establishment-management/cloud-branch-office/cloud-branch-office.module.ts` (registra el use-case con `useFactory`/`inject`)
- `src/contexts/establishment-management/cloud-branch-office/presentation/controllers/cloud-branch-office.controller.ts` (nuevo método `GET by-enrollment-key/:enrollmentKey`, con Swagger `@ApiOperation`/`@ApiParam`/`@ApiOkResponse`/`@ApiNotFoundResponse`)

No se tocó: `CloudBranchOfficeRepository`, `CloudEstablishmentRepository`, ningún ORM entity, `entities.ts`, ni ninguna migración — no hace falta, no hay cambios de esquema.

## Verificado

- `pnpm run build` — sin errores.
- `pnpm run lint` — sin errores nuevos (los 60 errores preexistentes del lint son de archivos no tocados por este feature).
- Prueba manual end-to-end contra Postgres real: registrar establecimiento + 2 sucursales, listar por `enrollmentKey` (200, ambas presentes), `enrollmentKey` inexistente (404), soft-delete de una sucursal → desaparece del listado (punto 6 arriba, confirmado).
