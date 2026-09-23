# Análisis Técnico: Envío de mercancía (traspaso) entre sucursales — `cloud-transfer`

> Documento autocontenido. No asume que quien lo lea tenga memoria de la conversación en la que se generó. Todas las rutas de archivo son relativas a la raíz del repo `jeema-transfer-platform-api`.

## 0. Resumen del modelo (contexto ya decidido, no se vuelve a discutir)

Esta API cloud implementa un **relay ligero**: no modela catálogo (`product`, `category`, `brand`, `inventory`, `inventory_item`, `lot`) como entidades relacionales propias. Cada sucursal tiene su propia base de datos local (app de escritorio, proyecto hermano — esquema de referencia en `src/shared/infraestructure/dbml/jeema-store-platform.dbml`). Esta API solo:

1. Recibe de la sucursal origen (A) un payload JSON describiendo la mercancía a transferir, y lo persiste junto con metadatos de enrutamiento (`cloud_transfer`).
2. Expone ese payload a la sucursal destino (B) para que lo descargue.
3. Lleva la máquina de estados del traspaso (quién lo está procesando, si se integró, si se recibió físicamente, si se canceló o falló).

Toda resolución de conflictos de catálogo (categoría inexistente en B, producto ya existente en B por código de barras, etc.) ocurre **en la app local de B**, nunca en esta API. El trabajo de esta spec es garantizar que el payload traiga **todos los datos que B necesita** para resolver esos conflictos sin tener que volver a consultar a A.

---

## 1. Contrato del payload

El payload se sigue persistiendo como `jsonb` en la columna `payload` de `cloud_transfer` (campo `any` en el dominio, sin VO propio — ver decisión D1 en la sección 5). Su forma se documenta y se valida en la frontera HTTP mediante clases `class-validator` anidadas (`presentation/commands/`), pero el dominio no la tipa fuertemente: es un documento de transporte, no una entidad de este bounded context.

### 1.1 Estructura de nivel superior

```jsonc
{
  "shipmentNotes": "string opcional, nota libre de A sobre el envío",
  "items": [ TransferItemPayload, ... ]  // mínimo 1 elemento, obligatorio
}
```

- `shipmentNotes` (string, opcional, máx. 500 caracteres): nota libre del empleado que originó el traspaso en A. Informativa, no se usa en ninguna lógica de negocio de esta API. Se persiste dentro del jsonb (no en columna propia) porque es contenido de negocio del traspaso, no metadato de enrutamiento.
- `items` (array, obligatorio, mínimo 1): cada elemento es un `TransferItemPayload` (una línea de producto+lote a transferir). Un traspaso puede mover múltiples productos/lotes en un solo envío (a diferencia de la tabla `transfer` del dbml de referencia, que es de un solo producto por fila — aquí se decide agrupar por envío, ver decisión D2).

### 1.2 `TransferItemPayload` — campo por campo

Cada item se compone de tres bloques: `product`, `lot`, `inventory`. Se incluye también un identificador de auditoría a nivel de origen.

#### Identificación de auditoría (no usada para matching en B)

| Campo | Tipo | Oblig. | Origen (dbml) | Propósito |
|---|---|---|---|---|
| `originLocalProductId` | string (bigint) | Sí | `product.product_id` en A | Trazabilidad/soporte: permite rastrear en A de qué fila local salió este item. B **nunca** debe usarlo para matching (los IDs de A y B son independientes). |
| `originLocalLotId` | string (bigint) | No | `lot.lot_id` en A | Trazabilidad/soporte del lote de origen. |
| `originLocalInventoryItemId` | string (bigint) | No | `inventory_item.inventory_item_id` en A | Trazabilidad/soporte del renglón de inventario físico de origen. |

#### Bloque `product`

| Campo | Tipo | Oblig. | Origen (dbml) | Por qué es necesario para que B resuelva sin datos faltantes |
|---|---|---|---|---|
| `product.universalBarCode` | string | No* | `product.universal_bar_code` | **Clave de matching primaria y autoritativa.** Si B encuentra un producto local con el mismo código, es el mismo producto real → NO crea producto nuevo, solo agrega lote e incrementa inventario (ver 1.3). |
| `product.name` | string | Sí | `product.name` | Fallback de identificación cuando no hay código de barras, y nombre a usar si B debe crear el producto desde cero. |
| `product.sku` | string | No | `product.sku` | Solo informativo/de referencia para el empleado de B. El SKU es único por `establishment_id` en el esquema local de A — como B tiene su propia base, una coincidencia de SKU entre A y B sería casualidad, **no** se debe usar como clave de matching. |
| `product.categoryName` | string | Sí | `category.name` (vía `product.category_id`) | B tiene categorías propias con IDs propios; solo puede mapear por nombre. Si no hay categoría con ese nombre en B, el empleado de B decide: mapear a una existente o crear una nueva llamada así. |
| `product.categoryDescription` | string | No | `category.description` | Ayuda contextual al empleado de B si decide crear la categoría desde cero. |
| `product.brandName` | string | No | `brand.name` (vía `product.brand_id`, nullable) | Igual que categoría pero opcional (marca es nullable en el esquema de A). |
| `product.description` | string | No | `product.description` | Contexto adicional para el empleado de B al crear/confirmar el producto. |
| `product.unitOfMeasure` | enum `ForSaleEnum` (`kg\|l\|m\|pc\|doc\|paquete\|caja\|set`) | Sí | `product.unit_of_measure` | B necesita saber en qué unidad vienen las cantidades para no interpretar mal `lot.transferredQuantity`. |
| `product.imageUrl` | string (URL) | No | `product.image_url` | Ayuda visual para que el empleado de B confirme "es el mismo producto" durante la resolución manual. **Best-effort**: la URL apunta al storage de A y puede no ser accesible públicamente desde el entorno de B; no se debe asumir que siempre carga. |

`*` `universalBarCode` es opcional a nivel de payload (A puede no tener capturado el código de barras de ese producto), pero es el campo más importante del contrato: su ausencia obliga a B a tratar el item siempre como producto nuevo (ver 1.3, caso 2).

Se excluye deliberadamente `product.min_stock_global`: es un parámetro de reabastecimiento a nivel de establecimiento de A, sin significado en el catálogo independiente de B.

#### Bloque `lot`

| Campo | Tipo | Oblig. | Origen (dbml) | Por qué es necesario |
|---|---|---|---|---|
| `lot.lotNumber` | string | Sí | `lot.lot_number` | B debe registrar el lote. `lot` tiene constraint única `(product_id, lot_number)` en el esquema local — es responsabilidad de B evitar colisión (p. ej. namespacing) si ya usa ese número para otro lote del mismo producto local; esta API no puede garantizarlo porque no conoce el catálogo de B. |
| `lot.purchasePrice` | string (decimal) | Sí | `lot.purchase_price` | Costo base del lote, necesario para que B mantenga su costeo del nuevo lote. |
| `lot.purchaseUnit` | enum `ForSaleEnum` | Sí | `lot.purchase_unit` | Unidad en que se compró el lote (puede diferir de `unitOfMeasure` del producto). |
| `lot.transferredQuantity` | string (decimal) | Sí | conceptualmente `lot.initial_quantity`, pero **renombrado** | Cantidad que efectivamente viaja en *este* traspaso — no necesariamente todo el lote de A (un traspaso puede ser parcial). Se renombra explícitamente para que no se confunda con "cantidad inicial del lote en A". Este es el número que B debe sumar a su inventario. |
| `lot.expirationDate` | string (fecha ISO `YYYY-MM-DD`) | No | `lot.expiration_date` | |
| `lot.manufacturingDate` | string (fecha ISO) | No | `lot.manufacturing_date` | |
| `lot.originReceivedDate` | string (fecha ISO) | No | `lot.received_date` | Fecha en que A recibió originalmente el lote de su proveedor (para trazabilidad/FEFO en B). **No confundir** con la fecha en que B recibe el traspaso — esa la lleva el propio `CloudTransferEntity` (`receivedAt`, sección 2). |
| `lot.supplierName` | string | No | `suplier.name` (vía `lot.suplier_id`) | Puramente informativo/texto libre — B no tiene FK a un proveedor porque no comparte catálogo de proveedores con A. |

#### Bloque `inventory` (valores de referencia, no vinculantes para B)

| Campo | Tipo | Oblig. | Origen (dbml) | Por qué es necesario |
|---|---|---|---|---|
| `inventory.suggestedSalePriceOne` | string (decimal) | No | `inventory.sale_price_one` | Precio sugerido; B puede adoptarlo o sobreescribirlo. |
| `inventory.suggestedSalePriceMany` | string (decimal) | No | `inventory.sale_price_many` | |
| `inventory.suggestedSaleQuantityMany` | string (decimal) | No | `inventory.sale_quantity_many` | |
| `inventory.suggestedSalePriceSpecial` | string (decimal) | No | `inventory.sale_price_special` | |
| `inventory.originQuantityOnHand` | string (decimal) | No | `inventory_item.quantity_on_hand` (en A, antes del envío) | **Puramente informativo/auditoría** — cuánto stock tenía A antes de enviar. **No es** la cantidad a sumar en B (eso es `lot.transferredQuantity`); no deben confundirse. |
| `inventory.suggestedLocation` | enum `LocationEnum` (`venta\|almacen\|dañado\|viajando`) | No | `inventory_item.location` | Ubicación sugerida al llegar a B (default razonable: `almacen`); el empleado de B puede cambiarla. |

Se excluye `inventory.internal_bar_code`: es un código interno/etiqueta física de A, no portable — reutilizarlo en B sin adaptación generaría colisiones o confusión. Si se necesita en el futuro, debe viajar marcado explícitamente como "código interno de origen, no reutilizar tal cual", pero por ahora se omite del contrato v1.

### 1.3 Comportamiento esperado en B según el resultado del matching (documentado para dar contexto completo, la lógica en sí NO vive en esta API)

**Caso 1 — Producto ya existe en B (match por `universalBarCode`):**
B encuentra un `product` local cuyo `universal_bar_code` coincide con `product.universalBarCode` del payload. Acción esperada en B: **no crear producto nuevo**. Solo:
- Crear un nuevo `lot` bajo el `product_id` local existente, con `lotNumber`, `purchasePrice`, `purchaseUnit`, `transferredQuantity`, fechas y proveedor del payload.
- Incrementar `inventory_item.quantity_on_hand` (creando el `inventory_item` si no existe aún para esa ubicación) en `lot.transferredQuantity`.
- `categoryName`/`brandName`/precios sugeridos del payload se ignoran para efectos de matching (B ya tiene su propia categoría/marca para ese producto), pero pueden mostrarse al empleado como referencia de confirmación visual.

**Caso 2 — Producto nuevo para B** (`universalBarCode` ausente, o presente pero sin match en el catálogo de B):
- El empleado de B resuelve `categoryName`: si existe una categoría local con ese nombre, se sugiere auto-mapeo (confirmable); si no, se le pide elegir una categoría existente o crear una nueva usando `categoryName`/`categoryDescription`.
- Igual para `brandName` (opcional; puede quedar sin marca).
- B crea: un `product` nuevo (name, sku informativo, universal_bar_code si vino, description, unit_of_measure, category_id y brand_id resueltos), un `inventory` nuevo (precios = sugeridos del payload como default editable), un `inventory_item` nuevo (`quantity_on_hand = lot.transferredQuantity`, `location` = sugerida o default), y un `lot` nuevo.

**Supuesto abierto explícito:** coincidencia de `name` (sin `universalBarCode`) **no** se trata como match autoritativo — nombres pueden colisionar entre productos distintos. `name`/`sku` son solo pistas para la UI del empleado de B; la decisión final siempre es manual. Ver decisión D3 en sección 5.

---

## 2. Máquina de estados completa de `CloudTransferStatusEnum`

Orden real del flujo feliz, **confirmado por el usuario** (invierte el orden `APPROVED`/`RECEIVED` que se había propuesto originalmente como supuesto — ver decisión D4/D5 en sección 5): `PENDING → IN_TRANSIT → RECEIVED → APPROVED`.

Justificación del orden `RECEIVED` antes de `APPROVED`: el empleado de B primero confirma la **recepción física** de la mercancía (el camión/paquete llegó y coincide, a nivel de bultos/cantidades declaradas, con lo que dice el payload) — este es el evento `RECEIVED`, y en este punto **todavía no se ha tocado el inventario local de B**. Solo **después** de esa confirmación física, el sistema (o el empleado, resolviendo los conflictos de catálogo descritos en la sección 1.3) integra los datos — crea/actualiza `product`/`lot`/`inventory_item` — en la base local de B; ese es el evento `APPROVED`, que ahora es el **estado terminal exitoso** del flujo (ya no `RECEIVED`). En otras palabras: primero se confirma "llegó físicamente", y solo después se traduce eso en movimientos de inventario.

### 2.1 Tabla de transiciones válidas

| Desde | Hacia | Disparado por | Endpoint | Exception si es inválida |
|---|---|---|---|---|
| *(creación)* | `PENDING` | Sucursal origen (A) | `POST /cloud-transfers` | `DInvalidException` (validaciones de payload/branch) |
| `PENDING` | `IN_TRANSIT` | Sucursal destino (B) | `POST /cloud-transfers/:id/start-processing` | `DConflictException` |
| `PENDING` | `CANCELLED` | A o B | `POST /cloud-transfers/:id/cancel` | `DConflictException` |
| `IN_TRANSIT` | `RECEIVED` | Sucursal destino (B) | `POST /cloud-transfers/:id/receive` | `DConflictException` |
| `IN_TRANSIT` | `ERROR` | Sucursal destino (B) | `POST /cloud-transfers/:id/error` | `DConflictException` |
| `IN_TRANSIT` | `CANCELLED` | A o B | `POST /cloud-transfers/:id/cancel` | `DConflictException` |
| `ERROR` | `IN_TRANSIT` | Sucursal destino (B), reintento | `POST /cloud-transfers/:id/start-processing` | `DConflictException` |
| `RECEIVED` | `APPROVED` | Sucursal destino (B) | `POST /cloud-transfers/:id/approve` | `DConflictException` |
| `RECEIVED` | `CANCELLED` | Sucursal destino (B) | `POST /cloud-transfers/:id/cancel` | `DConflictException` |

Estados terminales (sin transiciones salientes): `APPROVED`, `CANCELLED`. `IN_TRANSIT` puede ir a `RECEIVED`, `ERROR` o `CANCELLED`; `RECEIVED` puede ir a `APPROVED` o `CANCELLED`. Se agrega `RECEIVED → CANCELLED` (nuevo respecto a la propuesta original) porque con el orden confirmado tiene sentido de negocio: B ya confirmó que la mercancía llegó físicamente, pero al revisarla a detalle (p. ej. producto dañado, faltante grave, no corresponde a lo declarado) puede rechazar el envío **antes** de integrarlo a su inventario — en ese punto cancelar no genera inconsistencia porque el inventario de B aún no fue tocado. En cambio **no** se permite cancelar después de `APPROVED`, porque ahí sí ya se modificó el inventario local de B; revertir eso es responsabilidad de la app local de B, fuera del alcance de esta API relay (decisión D6, ahora resuelta con esta regla).

Cualquier otra combinación (p. ej. `PENDING → RECEIVED`, `PENDING → APPROVED`, `APPROVED → *`, `CANCELLED → *`) debe rechazarse con `DConflictException` ("transición de estado inválida").

### 2.2 Validación de "quién" dispara cada transición

Como no hay autenticación real en el proyecto (ver `CLAUDE.md`, sección "Known gaps"), la identidad del llamante se declara explícitamente en el body (`actingBranchId`) y se valida contra los campos `fromCloudBranchId`/`toCloudBranchId` del registro — **es una regla de negocio, no un mecanismo de seguridad real**, igual que la `enrollmentKey`:
- `start-processing`, `receive`, `approve`, `error`: `actingBranchId` debe ser igual a `toCloudBranchId`; si no, `DInvalidException` ("Solo la sucursal destino puede realizar esta acción.").
- `cancel`: `actingBranchId` debe ser igual a `fromCloudBranchId` **o** `toCloudBranchId`; si no, `DInvalidException`.

---

## 3. Endpoints

Prefijo global `api/v1` (ya configurado en `main.ts`). Base path del controller: `cloud-transfers`.

### 3.1 `POST /api/v1/cloud-transfers`
Crea un traspaso (llamado por A). Idempotente por `(fromCloudBranchId, localTransferId)` — reintentos desde la app local de A no duplican el registro.

- **Request body** (`CreateCloudTransferCommand`):
  - `fromCloudBranchId: string` (bigint)
  - `toCloudBranchId: string` (bigint)
  - `localTransferId: string` (bigint) — id del traspaso en la BD local de A.
  - `shipmentNotes?: string`
  - `items: TransferItemCommand[]` (mínimo 1) — forma exacta descrita en sección 1.2.
- **Response 201**: `CloudTransferEntity` serializado (ver `ICloudTransfer`, sección 4), `status = "Pendiente"`.
- **Errores**:
  - 404 `DNotFoundException`: `fromCloudBranchId` o `toCloudBranchId` no existen.
  - 400 `DInvalidException`: `fromCloudBranchId === toCloudBranchId`, `items` vacío, o las dos sucursales pertenecen a distintos `cloudEstablishmentId` (un traspaso solo es válido dentro del mismo establecimiento).
  - 400 `DAlreadyExistException`: ya existe un traspaso con ese `(fromCloudBranchId, localTransferId)`.

### 3.2 `GET /api/v1/cloud-transfers/pending/:toCloudBranchId`
Lista los traspasos que B debe descargar/continuar: incluye `PENDING`, `IN_TRANSIT` (para poder reanudar si el proceso de B se interrumpió) y `ERROR` (para reintentar). Usa `ParseBigIntPipe` en `toCloudBranchId`.

- **Response 200**: `ICloudTransfer[]`.
- **Errores**: 404 `DNotFoundException` si la sucursal destino no existe.

### 3.3 `GET /api/v1/cloud-transfers/:id`
Consulta un traspaso por id. `ParseBigIntPipe` en `id`.

- **Response 200**: `ICloudTransfer`.
- **Errores**: 404 `DNotFoundException`.

### 3.4 `POST /api/v1/cloud-transfers/:id/start-processing`
`PENDING → IN_TRANSIT` o `ERROR → IN_TRANSIT` (reintento). Llamado por B.

- **Body**: `{ actingBranchId: string }`.
- **Response 200**: `ICloudTransfer` actualizado (`inTransitAt` seteado/actualizado).
- **Errores**: 404 `DNotFoundException` (transfer o branch no existen), 400 `DInvalidException` (branch equivocada), 409 `DConflictException` (transición inválida, p. ej. ya está `RECEIVED`).

### 3.5 `POST /api/v1/cloud-transfers/:id/receive`
`IN_TRANSIT → RECEIVED`. Llamado por B cuando el empleado confirma que la mercancía física llegó y coincide (a nivel de bultos/cantidades declaradas) con lo declarado en el payload. **En este punto el inventario local de B todavía no se ha modificado** — es solo una confirmación operativa de recepción; la integración de datos ocurre después, en `/approve`.

- **Body**: `{ actingBranchId: string, notes?: string }`.
- **Response 200**: `ICloudTransfer` (`receivedAt` seteado).
- **Errores**: igual patrón que 3.4.

### 3.6 `POST /api/v1/cloud-transfers/:id/approve`
`RECEIVED → APPROVED`. Llamado por B cuando, tras la confirmación física de recepción, terminó de resolver los conflictos de catálogo (sección 1.3) e integró el payload (creó/actualizó `product`/`lot`/`inventory_item`) en su BD local. Es el **estado terminal exitoso** del flujo.

- **Body**: `{ actingBranchId: string, notes?: string }`.
- **Response 200**: `ICloudTransfer` (`approvedAt` seteado).
- **Errores**: igual patrón que 3.4.

### 3.7 `POST /api/v1/cloud-transfers/:id/error`
`IN_TRANSIT → ERROR`. Llamado por B cuando falla el procesamiento local del JSON.

- **Body**: `{ actingBranchId: string, errorMessage: string }` (`errorMessage` obligatorio, no vacío).
- **Response 200**: `ICloudTransfer` (`errorAt` seteado, `errorMessage` persistido).
- **Errores**: igual patrón que 3.4, más 400 `DInvalidException` si `errorMessage` viene vacío (cubierto ya por `class-validator` en el command).

### 3.8 `POST /api/v1/cloud-transfers/:id/cancel`
`PENDING → CANCELLED`, `IN_TRANSIT → CANCELLED` o `RECEIVED → CANCELLED`. Llamado por A o por B (ver validación de actor en 2.2; en el caso `RECEIVED → CANCELLED` solo tiene sentido de negocio que lo dispare B, pero la regla de actor no lo restringe explícitamente más allá de "A o B").

- **Body**: `{ actingBranchId: string, reason?: string }`.
- **Response 200**: `ICloudTransfer` (`cancelledAt` seteado, `notes` actualizado con `reason` si vino).
- **Errores**: igual patrón que 3.4.

### 3.9 Mapeo de excepciones de dominio → HTTP (nuevo, a introducir en este controller)

Los controllers existentes (`cloud-branch-office.controller.ts`, `cloud-establishment.controller.ts`) solo mapean `DNotFoundException`→404 y `DAlreadyExistException`→400 porque no usan `DInvalidException`/`DConflictException` todavía. Este controller es el primero en necesitarlos; se define explícitamente su mapeo (usando las excepciones HTTP nativas de Nest, mismo patrón try/catch manual por método):

```ts
if (error instanceof DNotFoundException) throw new NotFoundException(error.message);      // 404
if (error instanceof DAlreadyExistException) throw new BadRequestException(error.message); // 400
if (error instanceof DInvalidException) throw new BadRequestException(error.message);      // 400
if (error instanceof DConflictException) throw new ConflictException(error.message);       // 409
throw error;
```

---

## 4. Plan de archivos

### 4.1 Dominio (`domain/`) — modificar existentes

**`src/contexts/transfer-management/cloud-transfer/domain/entities/cloud-transfer.entity.ts`** (MODIFICAR)
- Agregar campos privados: `_notes: string | null`, `_errorMessage: string | null`, `_inTransitAt: Date | null`, `_approvedAt: Date | null`, `_receivedAt: Date | null`, `_cancelledAt: Date | null`, `_errorAt: Date | null`.
- Actualizar `create()` (acepta `notes?: string | null`) y `reconstitute()` (acepta todos los campos nuevos) y sus getters.
- Reemplazar el mutator suelto `updateStatus()` por métodos de transición con guarda, cada uno lanzando `DConflictException` si el estado actual no lo permite (según la tabla de la sección 2.1):
  - `startProcessing(): void` — permite desde `PENDING` o `ERROR`; setea `status = IN_TRANSIT` y `inTransitAt = new Date()`.
  - `markAsReceived(notes?: string): void` — solo desde `IN_TRANSIT`; setea `status = RECEIVED`, `receivedAt = new Date()`, `notes` si vino. (Invertido respecto a una versión previa de este documento: antes exigía `APPROVED`, ahora exige `IN_TRANSIT` — confirmado por el usuario, ver decisión D4/D5.)
  - `approve(notes?: string): void` — solo desde `RECEIVED`; setea `status = APPROVED`, `approvedAt = new Date()`, y `notes` si vino. (Invertido respecto a una versión previa de este documento: antes exigía `IN_TRANSIT`, ahora exige `RECEIVED`.)
  - `markAsError(errorMessage: string): void` — solo desde `IN_TRANSIT`; setea `status = ERROR`, `errorAt = new Date()`, `errorMessage`.
  - `cancel(reason?: string): void` — solo desde `PENDING`, `IN_TRANSIT` o `RECEIVED`; setea `status = CANCELLED`, `cancelledAt = new Date()`, `notes` si vino `reason`.
- Eliminar `updateToCloudBranchId` y `updatePayload` (sin uso en el nuevo diseño: el payload es inmutable tras la creación, y `toCloudBranchId` no cambia). Conservar `updateToCloudBranch(toCloudBranch)` porque el mapper/use-cases lo necesitan para hidratar la relación tras hacer `save()`.

**`src/contexts/transfer-management/cloud-transfer/domain/repositories/cloud-transfer.repository.ts`** (MODIFICAR)
Agregar a la interfaz (además de lo heredado de `TemplateRepository`):
```ts
findByToCloudBranchIdAndStatuses(toCloudBranchId: bigint, statuses: CloudTransferStatusEnum[]): Promise<CloudTransferEntity[]>;
findByFromCloudBranchIdAndLocalTransferId(fromCloudBranchId: bigint, localTransferId: bigint): Promise<CloudTransferEntity | null>;
```

### 4.2 Application (`application/`) — nuevos

- `application/dtos/transfer-item-payload.dto.ts` — interfaz `TransferItemPayloadDTO` con la forma exacta de la sección 1.2 (usada tanto por `CreateCloudTransferDTO` como referencia de tipo del contenido de `payload`).
- `application/dtos/create-cloud-transfer.dto.ts` — `CreateCloudTransferDTO { fromCloudBranchId: bigint; toCloudBranchId: bigint; localTransferId: bigint; shipmentNotes?: string; items: TransferItemPayloadDTO[] }`.
- `application/dtos/transition-cloud-transfer.dto.ts` — `TransitionCloudTransferDTO { cloudTransferId: bigint; actingBranchId: bigint; notes?: string }` (reusado por start-processing/approve/receive).
- `application/dtos/cancel-cloud-transfer.dto.ts` — `CancelCloudTransferDTO { cloudTransferId: bigint; actingBranchId: bigint; reason?: string }`.
- `application/dtos/mark-error-cloud-transfer.dto.ts` — `MarkErrorCloudTransferDTO { cloudTransferId: bigint; actingBranchId: bigint; errorMessage: string }`.
- `application/use-cases/create-cloud-transfer.use-case.ts` — valida ambas sucursales (existen, mismo `cloudEstablishmentId`, distintas entre sí), valida no-duplicado por `(fromCloudBranchId, localTransferId)`, arma `payload = { shipmentNotes, items }`, crea la entidad (`CloudTransferEntity.create(...)`, status inicial `PENDING`), guarda dentro de `transactionDB.runInTransaction()` (mismo patrón que `register-cloud-branch.use-case.ts`).
- `application/use-cases/list-pending-cloud-transfers-by-branch.use-case.ts` — valida que la sucursal destino existe, llama a `findByToCloudBranchIdAndStatuses(id, [PENDING, IN_TRANSIT, ERROR])`.
- `application/use-cases/find-cloud-transfer-by-id.use-case.ts` — `findById`, `DNotFoundException` si no existe.
- `application/use-cases/start-processing-cloud-transfer.use-case.ts`
- `application/use-cases/approve-cloud-transfer.use-case.ts`
- `application/use-cases/mark-cloud-transfer-received.use-case.ts`
- `application/use-cases/mark-cloud-transfer-error.use-case.ts`
- `application/use-cases/cancel-cloud-transfer.use-case.ts`

Los 5 use-cases de transición comparten la misma forma: `findById` (404 si no existe) → validar `actingBranchId` contra `toCloudBranchId`/`fromCloudBranchId` según corresponda (`DInvalidException` si no matchea) → invocar el método de dominio correspondiente (que lanza `DConflictException` si el estado no lo permite) → `save()`, todo envuelto en `transactionDB.runInTransaction()`.

### 4.3 Infraestructura (`infrastructure/`)

**`infrastructure/entities/cloud-transfer.orm-entity.ts`** (MODIFICAR) — agregar columnas:
```ts
@Column({ type: 'text', name: 'notes', nullable: true }) notes!: string | null;
@Column({ type: 'text', name: 'error_message', nullable: true }) errorMessage!: string | null;
@Column({ type: 'timestamptz', name: 'in_transit_at', nullable: true }) inTransitAt!: Date | null;
@Column({ type: 'timestamptz', name: 'approved_at', nullable: true }) approvedAt!: Date | null;
@Column({ type: 'timestamptz', name: 'received_at', nullable: true }) receivedAt!: Date | null;
@Column({ type: 'timestamptz', name: 'cancelled_at', nullable: true }) cancelledAt!: Date | null;
@Column({ type: 'timestamptz', name: 'error_at', nullable: true }) errorAt!: Date | null;
```
Agregar también `@Index(['fromCloudBranchId', 'localTransferId'], { unique: true })` a nivel de clase (idempotencia de creación).

- `infrastructure/mappers/cloud-transfer.mapper.ts` (NUEVO) — `toDomain(orm): CloudTransferEntity` (usa `reconstitute`, mapea relaciones `cloudEstablishment`/`fromCloudBranch`/`toCloudBranch` si vienen cargadas, igual patrón que `cloud-branch-office.mapper.ts`) y `toOrm(entity): CloudTransferOrmEntity`.
- `infrastructure/repositories/typeorm-cloud-transfer.repository.ts` (NUEVO) — implementa `CloudTransferRepository`. Sigue el patrón exacto de `typeorm-cloud-branch-office.repository.ts`: usa `tDB.getManager().getRepository(CloudTransferOrmEntity)`, mapea `QueryFailedError` código `23505`→`DAlreadyExistException` ("Ya existe un traspaso con ese identificador local para esta sucursal de origen."), código `23503`→`DNotFoundException`. Implementa los dos métodos nuevos con `find({ where: { toCloudBranchId, status: In(statuses) } })` / `findOneBy({ fromCloudBranchId, localTransferId })`.

### 4.4 Presentación (`presentation/`)

- `presentation/commands/transfer-item.command.ts` (NUEVO) — clase `TransferItemCommand` con sub-clases anidadas `ProductBlockCommand`, `LotBlockCommand`, `InventoryBlockCommand` (o campos aplanados con prefijo, a discreción del agente backend, mientras se respete la forma documentada en 1.2), decoradas con `class-validator` (`@IsString`, `@IsOptional`, `@IsEnum`, `@IsNumberString` para decimales/bigints, `@ValidateNested`, `@Type(() => ...)` de `class-transformer`).
- `presentation/commands/create-cloud-transfer.command.ts` (NUEVO) — `fromCloudBranchId`/`toCloudBranchId`/`localTransferId` como `@IsNumberString`, `shipmentNotes?` opcional, `items: TransferItemCommand[]` con `@ValidateNested({ each: true })`, `@ArrayMinSize(1)`.
- `presentation/commands/start-processing-cloud-transfer.command.ts`, `approve-cloud-transfer.command.ts`, `receive-cloud-transfer.command.ts` (NUEVOS) — `{ actingBranchId: string }` (+ `notes?` en approve/receive).
- `presentation/commands/error-cloud-transfer.command.ts` (NUEVO) — `{ actingBranchId: string; errorMessage: string }` (`@IsNotEmpty`).
- `presentation/commands/cancel-cloud-transfer.command.ts` (NUEVO) — `{ actingBranchId: string; reason?: string }`.
- `presentation/interfaces/ICloudTransfer.ts` (NUEVO) — forma de respuesta HTTP (bigints como `string`, incluye bloque `payload` tal cual, sucursales anidadas vía `ICloudBranchOffice` si están hidratadas).
- `presentation/mappers/cloud-transfer.http-mapper.ts` (NUEVO) — `CloudTransferHttpMapper.toHttpResponse(entity): ICloudTransfer`, mismo patrón que `cloud-branch-office.http-mapper.ts`.
- `presentation/controllers/cloud-transfer.controller.ts` (NUEVO) — los 8 endpoints de la sección 3, try/catch manual por método con el mapeo de la sección 3.9, `@ApiTags('Cloud Transfers')`, `ParseBigIntPipe` en los params de ruta.

### 4.5 Módulo y wiring global

- `src/contexts/transfer-management/cloud-transfer/cloud-transfer.module.ts` (NUEVO) — `imports: [TypeOrmModule.forFeature([CloudTransferOrmEntity]), CloudBranchOfficeModule, TransactionDBModule]` (se necesita `CLOUD_BRANCH_OFFICE_REPOSITORY` para validar existencia/`cloudEstablishmentId` de ambas sucursales en `create-cloud-transfer.use-case.ts`); `controllers: [CloudTransferController]`; `providers`: binding `{ provide: CLOUD_TRANSFER_REPOSITORY, useClass: TypeormCloudTransferRepository }` + 8 factories `{ provide: XUseCase, useFactory: (...) => new XUseCase(...), inject: [...] }` (mismo patrón que `cloud-branch-office.module.ts`).
- `src/app.module.ts` (MODIFICAR) — agregar `import { CloudTransferModule } from './contexts/transfer-management/cloud-transfer/cloud-transfer.module';` y añadirlo al arreglo `imports`.
- `src/config/database/typeorm/entities.ts` — **no requiere cambios**, `CloudTransferOrmEntity` ya está registrada.
- **Nueva migración** (generar con `pnpm run migration:generate AddTransferStateMachineColumns` tras aplicar los cambios del ORM entity) — agrega las 7 columnas nuevas + el índice único `(from_cloud_branch_id, local_transfer_id)` sobre `cloud_transfer`. La migración existente `1787802042766-AlignSchemaWithDbmlDiagram.ts` **no es suficiente** por sí sola para este feature.

### 4.6 Deuda técnica relacionada a resolver antes de construir queries reales de traspasos

Por lo documentado en `CLAUDE.md`: `CloudBranchOfficeOrmEntity`'s inverse `fromCloudTransfer` relation apunta a la propiedad equivocada (`item.cloudEstablishment` en vez de `item.fromCloudBranch`). Debe corregirse como parte de este trabajo, antes de depender de esa relación inversa para listar traspasos por sucursal (aunque los queries de este documento usan `findOneBy`/`find` con filtros directos sobre `CloudTransferOrmEntity`, no la relación inversa, por lo que no bloquea el MVP, pero sí cualquier extensión futura tipo "traspasos salientes de mi sucursal" navegada desde `CloudBranchOfficeOrmEntity`).

---

## 5. Decisiones y supuestos explícitos

- **D1 — Payload sin VO de dominio propio**: se decidió mantener `payload: any` en el dominio (sin crear `TransferItemEntity`/VOs) porque el contenido es un documento de transporte opaco para esta API, no una entidad de este bounded context. La validación de forma se hace solo en la capa `presentation/commands` vía `class-validator`. **Supuesto todavía abierto**: si a futuro esta API necesitara *leer*/filtrar el contenido del payload (p. ej. buscar traspasos que contengan cierto `universalBarCode`), este enfoque no lo soporta bien y habría que reconsiderar un modelo más estructurado (columnas generadas, JSON path indexes, etc.).
- **D2 — Un traspaso = múltiples items — CONFIRMADO por el usuario**: un `CloudTransfer` sí puede agrupar varios productos/lotes en un solo envío (arreglo `items`), tal como se propuso originalmente, a diferencia de la tabla `transfer` del dbml de referencia (que es una fila por producto). No requiere cambios al contrato del payload (sección 1).
- **D3 — Matching solo por `universalBarCode`, nunca por `name`/`sku`**: ver sección 1.3. Es la interpretación más segura dado que "resolución de conflictos ocurre en B", pero el usuario no explicó si quiere que el `name` también dispare un mapeo automático (sugerido, no autoritativo) en la UI de B. **Sigue abierto.**
- **D4/D5 — Orden real `RECEIVED` antes de `APPROVED` — CONFIRMADO por el usuario, invierte la propuesta original**: el flujo real es primero recepción física (`RECEIVED`), y solo después integración de datos en la BD local de B (`APPROVED`, ahora estado terminal exitoso). Ver justificación completa y tabla de transiciones actualizada en sección 2. Ya reflejado en los endpoints (3.5 `/receive` = `IN_TRANSIT → RECEIVED`, 3.6 `/approve` = `RECEIVED → APPROVED`) y en los métodos de dominio (sección 4.1).
- **D6 — Cancelación tras recepción física, pero no tras integración — RESUELTO**: se agrega `RECEIVED → CANCELLED` (B puede rechazar el envío tras inspeccionarlo físicamente, antes de integrarlo a su inventario) pero se mantiene la restricción de que **no** se puede cancelar después de `APPROVED` (ya se modificó el inventario local de B; revertir eso es responsabilidad de la app local, fuera de alcance de esta API). Ver tabla de transiciones en sección 2.1.
- **D7 — `actingBranchId` como pseudo-autorización**: dado que no hay autenticación en todo el proyecto (confirmado en `CLAUDE.md`), se decidió validar "quién" dispara cada transición comparando un `actingBranchId` explícito del body contra los campos de la entidad — es una regla de negocio, no seguridad real. Cualquier cliente que conozca el id de la sucursal puede suplantarla. Coherente con el resto del proyecto (la `enrollmentKey` tampoco es un secreto real), pero se deja explícito como **gap de seguridad heredado**, no introducido por este feature.
- **D8 — Sin modelado de `employee`**: no se agregan columnas tipo `requested_by_employee_id`/`approved_by_employee_id` (presentes en el `transfer` del dbml de referencia) porque esta API no tiene contexto de empleados. Si se necesita atribución humana, debe viajar como campo informativo de texto libre dentro del payload (p. ej. `shipmentNotes` puede incluirlo) o agregarse en una iteración futura si se decide modelar empleados a nivel cloud.
- **D9 — `notes`/`errorMessage` como columnas propias vs. dentro del payload**: se decidió que son metadatos del *traspaso* (no del catálogo transferido), por lo que van en columnas propias de `cloud_transfer`, igual que `transfer.notes` en el dbml de referencia — requieren la migración nueva descrita en 4.5.
- **D10 — Idempotencia por `(fromCloudBranchId, localTransferId)`**: se agrega constraint único nuevo, asumiendo que el id local de A es estable y que A puede reintentar el `POST` de creación de forma segura (p. ej. por fallas de red) sin duplicar. No se confirmó con el usuario si `localTransferId` es realmente único y estable del lado de la app local de A.

---

## 6. Plan de implementación paso a paso (para el agente backend)

1. Modificar `cloud-transfer.entity.ts` (dominio): nuevos campos + métodos de transición con guardas (sección 4.1).
2. Modificar `cloud-transfer.repository.ts` (interfaz): agregar los dos métodos de consulta nuevos.
3. Modificar `cloud-transfer.orm-entity.ts`: nuevas columnas + índice único.
4. Generar y revisar la migración (`pnpm run migration:generate AddTransferStateMachineColumns`), verificar que solo contenga los cambios esperados (7 columnas + índice único), aplicarla en local con `pnpm run migration:run` sobre el Postgres de `docker-compose up -d`.
5. Crear `infrastructure/mappers/cloud-transfer.mapper.ts` y `infrastructure/repositories/typeorm-cloud-transfer.repository.ts`.
6. Crear los DTOs de `application/dtos/`.
7. Crear los 8 use-cases de `application/use-cases/`.
8. Crear los commands de `presentation/commands/` con validaciones `class-validator` completas según el contrato de la sección 1.
9. Crear `presentation/interfaces/ICloudTransfer.ts` y `presentation/mappers/cloud-transfer.http-mapper.ts`.
10. Crear `presentation/controllers/cloud-transfer.controller.ts` con los 8 endpoints y el mapeo de excepciones de la sección 3.9.
11. Crear `cloud-transfer.module.ts` y registrar `CloudTransferModule` en `src/app.module.ts`.
12. (Opcional pero recomendado) Corregir el bug de la relación inversa `fromCloudTransfer` en `CloudBranchOfficeOrmEntity` (sección 4.6) antes de dar por cerrado el feature.
13. Probar manualmente el flujo feliz completo vía HTTP: crear traspaso → listar pendientes de B → start-processing → approve → receive; y el flujo de error/cancelación.
14. Confirmar con el usuario los supuestos que siguen realmente abiertos (D3, D7, D8, D9, D10) antes o inmediatamente después de implementar, ya que podrían requerir ajustes al contrato o a la máquina de estados. D2 y D4/D5 ya fueron confirmados por el usuario y están reflejados en este documento (secciones 1, 2, 3 y 4.1); D6 quedó resuelto como parte de la confirmación de D4/D5.
