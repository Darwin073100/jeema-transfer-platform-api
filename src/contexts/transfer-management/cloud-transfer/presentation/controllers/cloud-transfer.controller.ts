import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParseBigIntPipe } from 'src/shared/pipes/parse-bigint.pipe';
import { DNotFoundException } from 'src/shared/domain/exceptions/basics/d-not-found.exception';
import { DAlreadyExistException } from 'src/shared/domain/exceptions/basics/d-already-exist.exception';
import { DInvalidException } from 'src/shared/domain/exceptions/basics/d-invalid.exception';
import { DConflictException } from 'src/shared/domain/exceptions/basics/d-conflict.exception';
import { CreateCloudTransferUseCase } from '../../application/use-cases/create-cloud-transfer.use-case';
import { ListPendingCloudTransfersByBranchUseCase } from '../../application/use-cases/list-pending-cloud-transfers-by-branch.use-case';
import { FindCloudTransferByIdUseCase } from '../../application/use-cases/find-cloud-transfer-by-id.use-case';
import { StartProcessingCloudTransferUseCase } from '../../application/use-cases/start-processing-cloud-transfer.use-case';
import { MarkCloudTransferReceivedUseCase } from '../../application/use-cases/mark-cloud-transfer-received.use-case';
import { ApproveCloudTransferUseCase } from '../../application/use-cases/approve-cloud-transfer.use-case';
import { MarkCloudTransferErrorUseCase } from '../../application/use-cases/mark-cloud-transfer-error.use-case';
import { CancelCloudTransferUseCase } from '../../application/use-cases/cancel-cloud-transfer.use-case';
import { CreateCloudTransferCommand } from '../commands/create-cloud-transfer.command';
import { StartProcessingCloudTransferCommand } from '../commands/start-processing-cloud-transfer.command';
import { ReceiveCloudTransferCommand } from '../commands/receive-cloud-transfer.command';
import { ApproveCloudTransferCommand } from '../commands/approve-cloud-transfer.command';
import { ErrorCloudTransferCommand } from '../commands/error-cloud-transfer.command';
import { CancelCloudTransferCommand } from '../commands/cancel-cloud-transfer.command';
import { CreateCloudTransferDTO } from '../../application/dtos/create-cloud-transfer.dto';
import { CloudTransferHttpMapper } from '../mappers/cloud-transfer.http-mapper';

@ApiTags('Cloud Transfers')
@Controller('cloud-transfers')
export class CloudTransferController {
  constructor(
    private readonly createCloudTransferUseCase: CreateCloudTransferUseCase,
    private readonly listPendingCloudTransfersByBranchUseCase: ListPendingCloudTransfersByBranchUseCase,
    private readonly findCloudTransferByIdUseCase: FindCloudTransferByIdUseCase,
    private readonly startProcessingCloudTransferUseCase: StartProcessingCloudTransferUseCase,
    private readonly markCloudTransferReceivedUseCase: MarkCloudTransferReceivedUseCase,
    private readonly approveCloudTransferUseCase: ApproveCloudTransferUseCase,
    private readonly markCloudTransferErrorUseCase: MarkCloudTransferErrorUseCase,
    private readonly cancelCloudTransferUseCase: CancelCloudTransferUseCase,
  ) {}

  /**
   * Mapeo de excepciones de dominio -> HTTP (sección 3.9 de la spec). Centralizado aquí
   * para no repetir la misma cadena if/instanceof en los 8 métodos del controller; cada
   * método igualmente envuelve su llamada al use-case en su propio try/catch.
   */
  private handleDomainException(error: unknown): never {
    if (error instanceof DNotFoundException) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof DAlreadyExistException) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof DInvalidException) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof DConflictException) {
      throw new ConflictException(error.message);
    }
    throw error;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un traspaso',
    description:
      'Recibe de la sucursal origen (A) el payload de mercancía a transferir. Idempotente por (fromCloudBranchId, localTransferId).',
  })
  @ApiCreatedResponse({ description: 'Traspaso creado en estado Pendiente.' })
  @ApiBadRequestResponse({
    description: 'Sucursales inválidas, items vacío, o traspaso duplicado.',
  })
  @ApiNotFoundResponse({
    description: 'La sucursal de origen o de destino no existe.',
  })
  async create(@Body() command: CreateCloudTransferCommand) {
    try {
      const dto: CreateCloudTransferDTO = {
        fromCloudBranchId: BigInt(command.fromCloudBranchId),
        toCloudBranchId: BigInt(command.toCloudBranchId),
        localTransferId: BigInt(command.localTransferId),
        shipmentNotes: command.shipmentNotes,
        items: command.items,
      };
      const result = await this.createCloudTransferUseCase.execute(dto);
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Get('pending/:toCloudBranchId')
  @ApiOperation({
    summary: 'Listar traspasos pendientes de una sucursal destino',
    description:
      'Incluye los estados Pendiente, En_Transito y Error, para que B pueda descargar/continuar/reintentar.',
  })
  @ApiOkResponse({ description: 'Listado de traspasos pendientes.' })
  @ApiNotFoundResponse({ description: 'La sucursal destino no existe.' })
  async listPendingByBranch(
    @Param('toCloudBranchId', ParseBigIntPipe) toCloudBranchId: bigint,
  ) {
    try {
      const result =
        await this.listPendingCloudTransfersByBranchUseCase.execute(
          toCloudBranchId,
        );
      return CloudTransferHttpMapper.toHttpResponseList(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un traspaso por id' })
  @ApiOkResponse({ description: 'Traspaso encontrado.' })
  @ApiNotFoundResponse({ description: 'No existe un traspaso con ese id.' })
  async findById(@Param('id', ParseBigIntPipe) id: bigint) {
    try {
      const result = await this.findCloudTransferByIdUseCase.execute(id);
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Post(':id/start-processing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar el procesamiento de un traspaso',
    description:
      'Pendiente -> En_Transito, o Error -> En_Transito (reintento). Solo la sucursal destino puede invocarlo.',
  })
  @ApiOkResponse({ description: 'Traspaso actualizado a En_Transito.' })
  @ApiBadRequestResponse({
    description: 'La sucursal que actúa no es la sucursal destino.',
  })
  @ApiNotFoundResponse({ description: 'No existe un traspaso con ese id.' })
  @ApiConflictResponse({ description: 'Transición de estado inválida.' })
  async startProcessing(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() command: StartProcessingCloudTransferCommand,
  ) {
    try {
      const result = await this.startProcessingCloudTransferUseCase.execute({
        cloudTransferId: id,
        actingBranchId: BigInt(command.actingBranchId),
      });
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar la recepción física de un traspaso',
    description:
      'En_Transito -> Recibida. El inventario local de B todavía no se modifica en este paso.',
  })
  @ApiOkResponse({ description: 'Traspaso actualizado a Recibida.' })
  @ApiBadRequestResponse({
    description: 'La sucursal que actúa no es la sucursal destino.',
  })
  @ApiNotFoundResponse({ description: 'No existe un traspaso con ese id.' })
  @ApiConflictResponse({ description: 'Transición de estado inválida.' })
  async receive(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() command: ReceiveCloudTransferCommand,
  ) {
    try {
      const result = await this.markCloudTransferReceivedUseCase.execute({
        cloudTransferId: id,
        actingBranchId: BigInt(command.actingBranchId),
        notes: command.notes,
      });
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar un traspaso',
    description:
      'Recibida -> Aprobada. B ya integró el payload (product/lot/inventory_item) en su BD local. Estado terminal exitoso.',
  })
  @ApiOkResponse({ description: 'Traspaso actualizado a Aprobada.' })
  @ApiBadRequestResponse({
    description: 'La sucursal que actúa no es la sucursal destino.',
  })
  @ApiNotFoundResponse({ description: 'No existe un traspaso con ese id.' })
  @ApiConflictResponse({ description: 'Transición de estado inválida.' })
  async approve(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() command: ApproveCloudTransferCommand,
  ) {
    try {
      const result = await this.approveCloudTransferUseCase.execute({
        cloudTransferId: id,
        actingBranchId: BigInt(command.actingBranchId),
        notes: command.notes,
      });
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Post(':id/error')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar un traspaso como fallido',
    description:
      'En_Transito -> Error. B lo invoca cuando falla el procesamiento local del JSON.',
  })
  @ApiOkResponse({ description: 'Traspaso actualizado a Error.' })
  @ApiBadRequestResponse({
    description:
      'La sucursal que actúa no es la sucursal destino, o errorMessage viene vacío.',
  })
  @ApiNotFoundResponse({ description: 'No existe un traspaso con ese id.' })
  @ApiConflictResponse({ description: 'Transición de estado inválida.' })
  async markAsError(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() command: ErrorCloudTransferCommand,
  ) {
    try {
      const result = await this.markCloudTransferErrorUseCase.execute({
        cloudTransferId: id,
        actingBranchId: BigInt(command.actingBranchId),
        errorMessage: command.errorMessage,
      });
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar un traspaso',
    description:
      'Pendiente, En_Transito o Recibida -> Cancelada. Puede ser invocado por la sucursal origen o la destino.',
  })
  @ApiOkResponse({ description: 'Traspaso actualizado a Cancelada.' })
  @ApiBadRequestResponse({
    description:
      'La sucursal que actúa no es ni la de origen ni la de destino.',
  })
  @ApiNotFoundResponse({ description: 'No existe un traspaso con ese id.' })
  @ApiConflictResponse({
    description:
      'Transición de estado inválida (p. ej. ya está Aprobada o Cancelada).',
  })
  async cancel(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() command: CancelCloudTransferCommand,
  ) {
    try {
      const result = await this.cancelCloudTransferUseCase.execute({
        cloudTransferId: id,
        actingBranchId: BigInt(command.actingBranchId),
        reason: command.reason,
      });
      return CloudTransferHttpMapper.toHttpResponse(result);
    } catch (error) {
      this.handleDomainException(error);
    }
  }
}
