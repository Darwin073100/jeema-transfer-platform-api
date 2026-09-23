export interface CancelCloudTransferDTO {
  cloudTransferId: bigint;
  actingBranchId: bigint;
  reason?: string;
}
