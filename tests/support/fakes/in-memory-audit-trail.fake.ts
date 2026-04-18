import { AuditEntry, AuditTrailPort } from '@src/shared/application/ports/integration.ports';

export class InMemoryAuditTrailFake implements AuditTrailPort {
  public readonly entries: AuditEntry[] = [];

  async append(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
}
