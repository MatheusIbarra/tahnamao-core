export interface MongoDocumentMapper<DomainEntity, MongoDocument> {
  toDomain(document: MongoDocument): DomainEntity;
  toPersistence(entity: DomainEntity): Partial<MongoDocument>;
}
