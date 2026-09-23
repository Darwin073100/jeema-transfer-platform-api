import { TransferItemPayloadDTO } from './transfer-item-payload.dto';

export interface CreateCloudTransferDTO {
  fromCloudBranchId: bigint;
  toCloudBranchId: bigint;
  localTransferId: bigint;
  shipmentNotes?: string;
  items: TransferItemPayloadDTO[];
}
