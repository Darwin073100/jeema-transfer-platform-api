export interface ICloudEstablishment {
  cloudEstablishmentId: string,
  name: string,
  createdAt: Date,
  updatedAt: Date | null,
  deletedAt: Date | null,
  cloudBranchOffices: any[],
}