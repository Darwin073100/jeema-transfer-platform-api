export interface ICloudEstablishment {
  cloudEstablishmentId: bigint,
  name: string,
  createdAt: Date,
  updatedAt: Date | null,
  deletedAt: Date | null,
  cloudBranchOffices: any[],
}