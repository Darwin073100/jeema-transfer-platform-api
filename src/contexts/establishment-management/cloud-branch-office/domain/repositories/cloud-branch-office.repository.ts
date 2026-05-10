import { TemplateRepository } from "../../../../../shared/domain/repositories/template.repository";
import { CloudBranchOfficeEntity } from "../entities/cloud-branch-office.entity";

export const CLOUD_BRANCH_OFFICE_REPOSITORY = Symbol('CLOUD_BRANCH_OFFICE_REPOSITORY');

export interface CloudBranchOfficeRepository extends TemplateRepository<CloudBranchOfficeEntity>{

}