import { TemplateRepository } from "../../../../../shared/domain/repositories/template.repository";
import { CloudEstablishmentEntity } from "../entities/cloud-establishment.entity";

export const CLOUD_ESTABLISHMENT_REPOSITORY = Symbol('CLOUD_ESTABLISHMENT_REPOSITORY');

export interface CloudEstablishmentRepository extends TemplateRepository<CloudEstablishmentEntity> {

}