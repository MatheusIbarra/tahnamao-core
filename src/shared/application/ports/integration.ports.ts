export interface FileUploadRequest {
  ownerId: string;
  folder: string;
  fileName: string;
  contentType: string;
  byteSize: number;
}

export interface FileUploadUrlResult {
  fileId: string;
  uploadUrl: string;
  expiresAt: Date;
}

export interface FileStoragePort {
  createPresignedUploadUrl(input: FileUploadRequest): Promise<FileUploadUrlResult>;
  delete(fileId: string): Promise<void>;
}

export interface AuditEntry {
  action: string;
  actorId: string;
  actorRole: string;
  resource: string;
  resourceId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface AuditTrailPort {
  append(entry: AuditEntry): Promise<void>;
}

export interface JobPayload {
  jobType: string;
  payload: Record<string, unknown>;
  scheduledTo?: Date;
  deduplicationKey?: string;
}

export interface JobDispatcherPort {
  dispatch(job: JobPayload): Promise<string>;
}

export interface DomainEventPayload {
  eventName: string;
  aggregateId: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

export interface DomainEventPublisherPort {
  publish(events: DomainEventPayload[]): Promise<void>;
}
