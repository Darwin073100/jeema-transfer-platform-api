/**
 * DTO compartido por las transiciones start-processing / receive / approve,
 * ya que las tres tienen la misma forma de entrada (sección 4.2 de la spec).
 */
export interface TransitionCloudTransferDTO {
  cloudTransferId: bigint;
  actingBranchId: bigint;
  notes?: string;
}
