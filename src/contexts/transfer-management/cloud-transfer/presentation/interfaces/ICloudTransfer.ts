import { ICloudBranchOffice } from 'src/contexts/establishment-management/cloud-branch-office/presentation/interfaces/ICloudBranchOffice';
import { ICloudEstablishment } from 'src/contexts/establishment-management/cloud-establishment/presentation/interfaces/ICloudEstablishment';

export interface ICloudTransfer {
  cloudTransferId: string;
  cloudEstablishmentId: string;
  fromCloudBranchId: string;
  toCloudBranchId: string;
  localTransferId: string;
  /** Documento de transporte tal cual fue recibido (`{ shipmentNotes, items }`, sección 1 de la spec). */
  payload: any;
  status: string;
  notes: string | null;
  errorMessage: string | null;
  inTransitAt: Date | null;
  approvedAt: Date | null;
  receivedAt: Date | null;
  cancelledAt: Date | null;
  errorAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  cloudEstablishment: ICloudEstablishment | null;
  fromCloudBranch: ICloudBranchOffice | null;
  toCloudBranch: ICloudBranchOffice | null;
}
