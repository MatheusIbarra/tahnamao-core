export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}
