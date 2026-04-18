import { AuditLogSchema } from '@src/shared/infrastructure/mongo/schemas/audit-log.schema';
import { IdempotencyKeySchema } from '@src/shared/infrastructure/mongo/schemas/idempotency-key.schema';
import { JobSchema } from '@src/shared/infrastructure/mongo/schemas/job.schema';

describe('Mongo schema conventions', () => {
  it('declares required indexes for idempotency and jobs', () => {
    const idempotencyIndexes = IdempotencyKeySchema.indexes();
    const jobIndexes = JobSchema.indexes();
    const auditIndexes = AuditLogSchema.indexes();

    expect(idempotencyIndexes.length).toBeGreaterThanOrEqual(2);
    expect(jobIndexes.length).toBeGreaterThanOrEqual(2);
    expect(auditIndexes.length).toBeGreaterThanOrEqual(2);
  });
});
